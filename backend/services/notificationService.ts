import Notification from '../models/Notification';
import User from '../models/User';

export const sendNotification = async (shopId: string, productId: string, type: string, message: string) => {
  try {
    // 1. Save to DB
    const notification = new Notification({ shopId, productId, type, message });
    await notification.save();

    // 2. Fetch User Mobile
    const user = await User.findById(shopId);
    if (user && user.mobile) {
      // 3. Simulate SMS Sending
      console.log(`[SMS NOTIFICATION] To: ${user.mobile} | Msg: ${message}`);
      // In production, integration with Twilio/Nexmo happens here
    }

    return notification;
  } catch (error) {
    console.error('Error in sendNotification service:', error);
  }
};
