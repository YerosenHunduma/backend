import { model, Schema, ObjectId } from "mongoose";

const brokerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    biography: { type: String, default: "" },
    address: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    license: { type: String, default: "" },
    licenseCloudId: { type: String },
    profile: { type: String, default: "" },
    profileCloudId: { type: String },
    role: {
      type: [String],
      default: ["Broker"],
      enum: ["Buyer", "Broker", "Admin"],
    },
    isApproved: { type: Boolean, default: false },
    active: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Broker = model("Broker", brokerSchema);

export default Broker;
