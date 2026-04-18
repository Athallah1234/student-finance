import mongoose, { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'DELETE_BUDGET', 'UPDATE_SAVINGS'
    details: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  }
);

const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);
export default AuditLog;
