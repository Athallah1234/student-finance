import mongoose, { Schema, model, models } from 'mongoose';

const BudgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

const Budget = models.Budget || model('Budget', BudgetSchema);
export default Budget;
