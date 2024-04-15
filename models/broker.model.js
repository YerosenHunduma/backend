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
    boigraphy: { type: String, default: "" },
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
    subscription: {
      plan: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
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

brokerSchema.methods.subscribe = async function (plan, startDate, endDate) {
  try {
    this.subscription.plan = plan;
    this.subscription.startDate = startDate;
    this.subscription.endDate = endDate;

    await this.save();

    return { success: true, message: "Subscription is successfully" };
  } catch (error) {
    console.error("Subscription error:", error);
    return { success: false, message: "Failed is subscription" };
  }
};

const Broker = model("Broker", brokerSchema);

export default Broker;
