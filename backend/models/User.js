import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  addressId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  title: {
    type: String,
    required: [true, "Address title is required"],
    trim: true,
  },
  // User information for this address
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  family: {
    type: String,
    required: [true, "Family name is required"],
    trim: true,
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    trim: true,
  },
  nationalCode: {
    type: String,
    required: [true, "National code is required"],
    trim: true,
  },
  // Location information
  province: {
    type: String,
    required: [true, "Province is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
    match: [/^\d{10}$/, "Postal code must be 10 digits"],
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

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
      default: "ایران"
    },
    // Social network for coordination
    socialNetworkName: {
      type: String,
      trim: true,
      default: "whatsapp"
    },
    socialNetworkMobile: {
      type: String,
      required: false,
    },
    // Deprecated fields - kept for backward compatibility
    province: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    // New addresses array
    addresses: {
      type: [AddressSchema],
      default: [],
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