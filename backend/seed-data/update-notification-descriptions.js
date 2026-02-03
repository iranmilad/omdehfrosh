/**
 * One-time script: set description (and fullDescription if missing) for notifications
 * that have empty or missing description. Run from backend folder:
 *   node seed-data/update-notification-descriptions.js
 */
import mongoose from 'mongoose';
import NotificationTable from '../models/NotificationsTable.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/j2b';
const DEFAULT_DESCRIPTION = 'محتوای این پیام ثبت نشده است.';

const updateNotificationDescriptions = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await NotificationTable.updateMany(
      {
        $or: [
          { description: { $exists: false } },
          { description: null },
          { description: '' },
          { description: { $regex: /^\s*$/ } }
        ]
      },
      { $set: { description: DEFAULT_DESCRIPTION } }
    );

    console.log('✅ Notifications update completed');
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateNotificationDescriptions();
