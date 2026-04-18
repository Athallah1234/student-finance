import mongoose, { Schema, model, models } from 'mongoose';

const IncomeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true }, // e.g., 'Parents', 'Scholarship', 'Part-time'
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { timestamps: true }
);

const Income = models.Income || model('Income', IncomeSchema);
export default Income;
