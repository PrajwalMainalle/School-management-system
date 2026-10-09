import mongoose from 'mongoose';

const bookIssueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    bookId: {
      type: String, // Ref to Book
      required: true,
      index: true,
    },
    borrowerType: {
      type: String,
      enum: ['STUDENT', 'STAFF'],
      required: true,
    },
    borrowerId: {
      type: String, // Ref to Student/Teacher ID
      required: true,
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    overdueFine: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'],
      default: 'ISSUED',
    },
    issuedBy: {
      type: String, // Ref to Staff/Librarian ID
    },
  },
  { timestamps: true }
);

bookIssueSchema.index({ schoolId: 1, borrowerId: 1, status: 1 });

const BookIssue = mongoose.models.BookIssue || mongoose.model('BookIssue', bookIssueSchema);
export default BookIssue;
