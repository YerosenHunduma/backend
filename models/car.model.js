import { Schema, model } from "mongoose";

const carSchema = new Schema(
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
    currency: {
      type: String,
      required: true,
      enum: ["USD", "ETB", "EUR"],
    },
    address: String,
    make: String,
    model: String,
    year: Number,
    mileage: Number,
    engineSize: Number,
    fuelType: String,
    photos: [String],
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
