import { Schema, model } from "mongoose";

const carSchema = new Schema(
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
    action: {
      type: String,
      required: true,
      enum: ["Rent", "Sale"],
    },
    price: {
      type: Number,
      required: true,
    },
    category: String,
    bodyType: String,
    priceType: {
      type: String,
      required: true,
      enum: ["Negotiable", "Fixed", "Per_Day"],
    },
    address: String,
    brand: String,
    model: String,
    year: Number,
    mileage: Number,
    engineSize: String,
    fuelType: String,
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

const Car = model("Car", carSchema);

export default Car;
