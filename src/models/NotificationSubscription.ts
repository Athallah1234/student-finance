import mongoose, { Schema, model, models } from 'mongoose';

const NotificationSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      }
    },
    userAgent: { type: String },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

const NotificationSubscription = models.NotificationSubscription || model('NotificationSubscription', NotificationSubscriptionSchema);
export default NotificationSubscription;
