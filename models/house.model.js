import { Schema, model } from "mongoose";

const houseSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Car", "House"],
    },
    title: {
      type: String,
      required: true,
      maxLength: 255,
    },
    description: {
      type: String,
      required: true,
    },
    priceType: {
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
    address: String,
    bedrooms: Number,
    bathrooms: Number,
    landSize: Number,
    parkingSpot: Number,
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
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
    googleMap: {},
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "Broker",
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
