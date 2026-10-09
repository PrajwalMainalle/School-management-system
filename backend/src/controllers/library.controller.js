import mongoose from 'mongoose';
import Book from '../models/book.model.js';
import BookIssue from '../models/bookIssue.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Dev Fallback Stores (Empty by default for real user data)
let mockBooks = [];
let mockBookIssues = [];

/**
 * Add New Book to Library Catalog
 */
export const addBook = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      accessionNumber,
      title,
      author,
      publisher = '',
      category = 'TEXTBOOK',
      quantityTotal = 1,
      shelfLocation = 'Rack A1',
      price = 0,
    } = req.body;

    if (!accessionNumber || !title || !author) {
      return sendError(res, 'Accession number, title, and author are required', 400);
    }

    const qty = Number(quantityTotal) || 1;

    let bookDoc;
    if (mongoose.connection.readyState === 1) {
      bookDoc = await Book.create({
        schoolId,
        accessionNumber,
        title,
        author,
        publisher,
        category,
        quantityTotal: qty,
        quantityAvailable: qty,
        shelfLocation,
        price: Number(price),
      });
    } else {
      bookDoc = {
        _id: `bk_${Date.now()}`,
        schoolId,
        accessionNumber,
        title,
        author,
        publisher,
        category,
        quantityTotal: qty,
        quantityAvailable: qty,
        shelfLocation,
        price: Number(price),
        createdAt: new Date().toISOString(),
      };
      mockBooks.push(bookDoc);
    }

    return sendSuccess(res, 'Book catalog entry added successfully', bookDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Library Book Catalog List & Search
 */
export const getBooks = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN', query, category } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId };
      if (category) filter.category = category;
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { accessionNumber: { $regex: query, $options: 'i' } },
        ];
      }

      const books = await Book.find(filter).sort({ createdAt: -1 });
      return sendSuccess(res, 'Book catalog fetched', books);
    } else {
      let filtered = mockBooks.filter((b) => b.schoolId === schoolId);
      if (category) filtered = filtered.filter((b) => b.category === category);
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.accessionNumber.toLowerCase().includes(q)
        );
      }

      return sendSuccess(res, 'Book catalog fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Issue Library Book
 */
export const issueBook = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      bookId,
      borrowerType = 'STUDENT',
      borrowerId,
      daysToReturn = 14,
    } = req.body;

    if (!bookId || !borrowerId) {
      return sendError(res, 'bookId and borrowerId are required', 400);
    }

    let book;
    if (mongoose.connection.readyState === 1) {
      book = await Book.findById(bookId);
    } else {
      book = mockBooks.find((b) => b._id === bookId);
    }

    if (!book) return sendError(res, 'Book not found in library catalog', 404);
    if (book.quantityAvailable <= 0) {
      return sendError(res, 'All physical copies of this book are currently issued out', 400);
    }

    const issueId = `ISS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const issueDate = new Date();
    const dueDate = new Date(Date.now() + 86400000 * Number(daysToReturn));

    let issueDoc;
    if (mongoose.connection.readyState === 1) {
      book.quantityAvailable -= 1;
      await book.save();

      issueDoc = await BookIssue.create({
        issueId,
        schoolId,
        bookId: book._id,
        borrowerType,
        borrowerId,
        issueDate,
        dueDate,
        status: 'ISSUED',
        issuedBy: req.user?.id || 'stf_librarian',
      });
    } else {
      book.quantityAvailable -= 1;
      issueDoc = {
        _id: `iss_${Date.now()}`,
        issueId,
        schoolId,
        bookId: book._id,
        borrowerType,
        borrowerId,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: null,
        overdueFine: 0,
        status: 'ISSUED',
        issuedBy: req.user?.id || 'stf_librarian',
        createdAt: new Date().toISOString(),
      };
      mockBookIssues.push(issueDoc);
    }

    return sendSuccess(res, 'Library book issued successfully', issueDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Return Library Book (Server-Side Overdue Fine Calculation)
 */
export const returnBook = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { fineRatePerDay = 5 } = req.body;

    let issueRecord;
    let book;

    if (mongoose.connection.readyState === 1) {
      issueRecord = await BookIssue.findById(issueId);
      if (!issueRecord) return sendError(res, 'Circulation issue record not found', 404);
      book = await Book.findById(issueRecord.bookId);
    } else {
      issueRecord = mockBookIssues.find((i) => i._id === issueId || i.issueId === issueId);
      if (!issueRecord) return sendError(res, 'Circulation issue record not found', 404);
      book = mockBooks.find((b) => b._id === issueRecord.bookId);
    }

    if (issueRecord.status === 'RETURNED') {
      return sendError(res, 'Book has already been returned', 400);
    }

    const returnDate = new Date();
    const dueDate = new Date(issueRecord.dueDate);
    let overdueFine = 0;

    // SERVER-SIDE OVERDUE FINE CALCULATION
    if (returnDate > dueDate) {
      const overdueTimeDiff = returnDate.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(overdueTimeDiff / (1000 * 3600 * 24));
      overdueFine = overdueDays * Number(fineRatePerDay);
    }

    if (mongoose.connection.readyState === 1) {
      issueRecord.returnDate = returnDate;
      issueRecord.overdueFine = overdueFine;
      issueRecord.status = 'RETURNED';
      await issueRecord.save();

      if (book) {
        book.quantityAvailable += 1;
        await book.save();
      }
    } else {
      issueRecord.returnDate = returnDate.toISOString();
      issueRecord.overdueFine = overdueFine;
      issueRecord.status = 'RETURNED';
      if (book) {
        book.quantityAvailable += 1;
      }
    }

    return sendSuccess(
      res,
      `Book returned successfully. Server calculated overdue fine: ₹${overdueFine}`,
      { issueRecord, overdueFine }
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Circulation Logs & Overdue Records
 */
export const getCirculationLogs = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN', borrowerId, status } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId };
      if (borrowerId) filter.borrowerId = borrowerId;
      if (status) filter.status = status;

      const logs = await BookIssue.find(filter).sort({ createdAt: -1 });
      return sendSuccess(res, 'Circulation logs fetched', logs);
    } else {
      let filtered = mockBookIssues.filter((i) => i.schoolId === schoolId);
      if (borrowerId) filtered = filtered.filter((i) => i.borrowerId === borrowerId);
      if (status) filtered = filtered.filter((i) => i.status === status);

      return sendSuccess(res, 'Circulation logs fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
