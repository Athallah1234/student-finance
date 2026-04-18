import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Food', 'Rent', 'Transport'
    paymentMethod: { type: String, default: 'Cash' }, // e.g., 'Cash', 'E-Wallet', 'Bank Transfer'
    date: { type: Date, default: Date.now },
    note: { type: String },
    receiptImage: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

const Expense = models.Expense || model('Expense', ExpenseSchema);
export default Expense;
