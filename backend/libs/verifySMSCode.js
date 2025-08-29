import SMS from "../models/SMS.js";  // Import SMS model
import User from "../models/User.js"; // Import User model

export const verifySMSCode = async (mobile, code) => {
    try {
      if (!mobile || !code) {
        return { success: false, message: "Mobile number and code are required" };
      }
  
      const mobileStr = String(mobile).trim();
      const codeStr = String(code).trim();
  
      const smsRecord = await SMS.findOne({ mobile: mobileStr });
      if (!smsRecord || smsRecord.smsCode !== codeStr) {
        return { success: false, message: "کد وارد شده اشتباه است" };
      }
  
      // Delete the SMS record after verification
      await SMS.deleteOne({ mobile: mobileStr });
  
      // Find and activate the user
      const user = await User.findOne({ mobile: mobileStr });
      if (user) {
        user.isActive = true;
        await user.save();
      }
  
      return { success: true, user };
    } catch (error) {
      console.error("Error verifying SMS code:", error);
      return { success: false, message: "Failed to verify SMS code" };
    }
  };
  