import mongoose from "mongoose";

const fpSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    combinationId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true
    },
    regularPrice: {
      type: Number,
      required: true
    },
    discountedPrice: {
      type: Number
    },
    discountPercent: {
      type: String
    },
    attributes: [
      {
        name: {
          type: String,
          required: true
        },
        nameEng: {
          type: String,
          required: true,
          enum: ['color', 'storage', 'connection', 'size', 'panel', 'ram', 'other']
        },
        value: {
          type: String,
          required: true
        },
        colorCode: {
          type: String,
          validate: {
            validator: function(v) {
              // Only validate if colorCode is provided
              if (!v) return true;
              // Check if it's a valid hex color code
              return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
            },
            message: props => `${props.value} is not a valid hex color code!`
          }
        }
      }
    ],
    seller: {
      id: {
        type: Number,
        required: true
      },
      label: {
        type: String,
        required: true
      }
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Index for better query performance
fpSchema.index({ id: 1, combinationId: 1 });
fpSchema.index({ slug: 1 });

export default mongoose.model("FP", fpSchema);