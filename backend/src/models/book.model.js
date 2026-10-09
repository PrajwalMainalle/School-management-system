import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    accessionNumber: {
      type: String,
      required: [true, 'Accession number/ISBN is required'],
      unique: true,
      index: true,
      trim: true,
    },
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    publisher: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['TEXTBOOK', 'REFERENCE', 'FICTION', 'NON_FICTION', 'PERIODICAL', 'JOURNAL'],
      default: 'TEXTBOOK',
    },
    quantityTotal: {
      type: Number,
      required: true,
      default: 1,
    },
    quantityAvailable: {
      type: Number,
      required: true,
      default: 1,
    },
    shelfLocation: {
      type: String,
      default: 'Rack A1',
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookSchema.index({ schoolId: 1, category: 1, accessionNumber: 1 });

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export default Book;
