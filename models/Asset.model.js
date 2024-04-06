import mongoose from "mongoose";
const { Schema, model } = mongoose;

const propertySchema = new Schema(
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
    price: {
      type: Number,
      required: true,
    },
    address: String, // Relevant for houses
    bedrooms: Number, // Relevant for houses
    bathrooms: Number, // Relevant for houses
    landSize: String, // Relevant for houses
    carPark: Number, // Relevant for houses
    make: String, // Relevant for cars
    model: String, // Relevant for cars
    year: Number, // Relevant for cars
    mileage: Number, // Relevant for cars
    fuelType: String, // Relevant for cars
    photos: [String], // Assuming URLs to images
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
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for geo-location searches
propertySchema.index({ location: "2dsphere" });

export default model("Property", propertySchema);
