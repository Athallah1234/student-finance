import AuditLog from '@/models/AuditLog';
import dbConnect from './mongodb';

export async function logSecurityEvent(userId: string, action: string, details?: string, req?: Request) {
  try {
    await dbConnect();
    
    let ip = 'unknown';
    let userAgent = 'unknown';

    if (req) {
      ip = req.headers.get('x-forwarded-for') || 'unknown';
      userAgent = req.headers.get('user-agent') || 'unknown';
    }

    await AuditLog.create({
      userId,
      action,
      details,
      ip,
      userAgent
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}
