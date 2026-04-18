import mongoose, { Schema, model, models } from 'mongoose';

const SavingsGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    targetDate: { type: Date },
    category: { type: String },
    note: { type: String },
    image: { type: String },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  },
  { timestamps: true }
);

const SavingsGoal = models.SavingsGoal || model('SavingsGoal', SavingsGoalSchema);
export default SavingsGoal;
