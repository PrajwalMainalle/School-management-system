import Book from '../models/book.model.js';
import BookIssue from '../models/bookIssue.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Add New Book to Library Catalog
 */
export const addBook = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
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
      return sendError(res, 'Accession number, title, and author are required', null, 400);
    }

    const qty = Number(quantityTotal) || 1;

    const bookDoc = await Book.create({
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

    return sendSuccess(res, 'Book catalog entry added successfully', bookDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Library Book Catalog List & Search
 */
export const getBooks = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const { query, category } = req.query;

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
  } catch (error) {
    next(error);
  }
};

/**
 * Issue Library Book
 */
export const issueBook = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      bookId,
      borrowerType = 'STUDENT',
      borrowerId,
      daysToReturn = 14,
    } = req.body;

    if (!bookId || !borrowerId) {
      return sendError(res, 'bookId and borrowerId are required', null, 400);
    }

    const book = await Book.findById(bookId);
    if (!book) return sendError(res, 'Book not found in library catalog', null, 404);
    if (book.quantityAvailable <= 0) {
      return sendError(res, 'All physical copies of this book are currently issued out', null, 400);
    }

    const issueId = `ISS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const issueDate = new Date();
    const dueDate = new Date(Date.now() + 86400000 * Number(daysToReturn));

    book.quantityAvailable -= 1;
    await book.save();

    const issueDoc = await BookIssue.create({
      issueId,
      schoolId,
      bookId: book._id,
      borrowerType,
      borrowerId,
      issueDate,
      dueDate,
      status: 'ISSUED',
      issuedBy: req.user?._id || 'stf_librarian',
    });

    return sendSuccess(res, 'Library book issued successfully', issueDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Return Library Book (Server-Side Overdue Fine Calculation)
 */
export const returnBook = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const { fineRatePerDay = 5 } = req.body;

    const issueRecord = await BookIssue.findById(issueId);
    if (!issueRecord) return sendError(res, 'Circulation issue record not found', null, 404);

    if (issueRecord.status === 'RETURNED') {
      return sendError(res, 'Book has already been returned', null, 400);
    }

    const book = await Book.findById(issueRecord.bookId);

    const returnDate = new Date();
    const dueDate = new Date(issueRecord.dueDate);
    let overdueFine = 0;

    if (returnDate > dueDate) {
      const overdueTimeDiff = returnDate.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(overdueTimeDiff / (1000 * 3600 * 24));
      overdueFine = overdueDays * Number(fineRatePerDay);
    }

    issueRecord.returnDate = returnDate;
    issueRecord.overdueFine = overdueFine;
    issueRecord.status = 'RETURNED';
    await issueRecord.save();

    if (book) {
      book.quantityAvailable += 1;
      await book.save();
    }

    return sendSuccess(
      res,
      `Book returned successfully. Server calculated overdue fine: ₹${overdueFine}`,
      { issueRecord, overdueFine }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Circulation Logs & Overdue Records
 */
export const getCirculationLogs = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const { borrowerId, status } = req.query;

    const filter = { schoolId };
    if (borrowerId) filter.borrowerId = borrowerId;
    if (status) filter.status = status;

    const logs = await BookIssue.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 'Circulation logs fetched', logs);
  } catch (error) {
    next(error);
  }
};
