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
    address: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    license: { type: String, default: "" },
    licenseCloudId: { type: String },
    photo: { type: String, default: "" },
    photoCloudId: { type: String },
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
      type: {
        plan: {
          type: String,
          default: ["monthly"],
          enum: ["monthly", "quarterly", "yearly"],
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
      },
    },
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

    return { success: true, message: "Subscription updated successfully" };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, message: "Failed to update subscription" };
  }
};

export default model("Broker", brokerSchema);
