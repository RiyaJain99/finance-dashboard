import mongoose from 'mongoose';

const RECORD_TYPES = ['income', 'expense'];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: RECORD_TYPES,
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// Compound indexes for common query patterns
recordSchema.index({ createdBy: 1, date: -1 });
recordSchema.index({ type: 1, category: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ isDeleted: 1, date: -1 });

// Automatically exclude soft-deleted records from all queries
recordSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

recordSchema.methods.softDelete = function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

export const RECORD_TYPES_ENUM = RECORD_TYPES;
export default mongoose.model('Record', recordSchema);
