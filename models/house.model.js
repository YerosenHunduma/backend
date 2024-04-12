import { Schema, model } from "mongoose";

const houseSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["car", "house"],
    },
    title: {
      type: String,
      required: true,
      maxLength: 255,
    },
    class: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricetype: {
      type: String,
      required: true,
      enum: ["Negotiable", "Fixed", "Per_Month", "Per_Year"],
    },
    action: {
      type: String,
      required: true,
      enum: ["Rent", "Sale"],
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "ETB", "EUR"],
    },
    address: String,
    bedrooms: Number,
    bathrooms: Number,
    landSize: String,
    carPark: Number,
    photos: [String],
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geo-location searches
houseSchema.index({ location: "2dsphere" });

const House = model("House", houseSchema);

export default House;
