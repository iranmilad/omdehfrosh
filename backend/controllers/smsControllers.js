import db from "../db/db.js";
import { verifySMSCode } from '../libs/verifySMSCode.js'
import SMS from "../models/SMS.js";
import User from "../models/User.js"; // Assuming you have a User model



export const newSMSCode = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate input
    if (!mobile) {
      return res.status(500).send()
    }


    // Ensure mobile number is valid (assuming 10-15 digits)
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).send()
    }

    // Generate a random 4-digit SMS code
    const smsCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if an SMS entry for this mobile number already exists
    const existingSMS = await SMS.findOne({ mobile });

    if (existingSMS) {
      // Update existing SMS code
      existingSMS.smsCode = smsCode;
      existingSMS.createdAt = new Date(); // Reset expiration time
      await existingSMS.save();


      return res.status(200).json({
        state: "ok",
        message: "کد پیامکی با موفقیت ارسال شد",
        smsId: existingSMS.id,
        smsCode, // Return the new code for testing (remove in production)
      });
    }

    // If no existing entry, create a new one
    const smsCount = await SMS.countDocuments();
    const newSmsId = smsCount + 1; // Auto-increment ID

    const newSMS = new SMS({
      id: newSmsId,
      mobile,
      smsCode,
    });

    await newSMS.save();

    // res.status(201).json({
    //   message: "مشکلی در ارسال کد پیامکی رخ داده است.",
    //   state: "error",
    //   errors: {
    //     mobile: "شماره موبایل صحیح نیست"
    //   }
    // })


    
    
    res.status(201).json({
      message: "کد پیامکی با موفقیت ارسال شد",
      state: "ok",
      smsId: newSmsId,
      smsCode, // Return the new code for testing (remove in production)
    });



  } catch (error) {
    console.error("Error generating/updating SMS code:", error);
    res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};


export const verifySMS = async (req, res) => {
    const { mobile, code } = req.body;
    const result = await verifySMSCode(mobile, code);
  
    if (!result.success) {
      return res.status(400).json({ error: { code: result.message } });
    }
  
    return res.status(200).json({ message: "ok" });
  };
  
  