import mongoose, { Schema, model, models } from 'mongoose';

const DebtSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['debt', 'receivable'], required: true },
    amount: { type: Number, required: true },
    deadline: { type: Date },
    status: { type: String, enum: ['unpaid', 'paid', 'partially_paid'], default: 'unpaid' },
    note: { type: String },
  },
  { timestamps: true }
);

const Debt = models.Debt || model('Debt', DebtSchema);
export default Debt;
