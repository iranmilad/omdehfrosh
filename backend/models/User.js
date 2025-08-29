import mongoose from "mongoose";
import { number } from "yup";

const UserAccountsSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    nameEng: {
      type: String,
      required: [false, "First name is required"],
    },
    family: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [false, "Email is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [false, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    nationalCode: {
      type: String,
      required: [true, "National code is required"],
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      required: [false, "Country is required"],
      trim: true,
    },
    province: {
      type: String,
      required: [false, "Province is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [false, "Address is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [false, "Postal code is required"],
      match: [/^\d{10}$/, "Postal code must be 10 digits"],
      trim: true,
    },
    socialNetworkName: {
      type: String,
      trim: true,
    },
    socialNetworkMobile: {
      type: String,
      trim: true,
    },
    birthday: {
      type: String,
      required: false,
      default: undefined
    },
    role: {
      type: String,
      enum: ["user", "admin", "supplier", "master"],
      default: "user",
    },
    subscriptions: {
      type: Object,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const UserAccounts = mongoose.model("UserAccounts", UserAccountsSchema);

export default UserAccounts;
