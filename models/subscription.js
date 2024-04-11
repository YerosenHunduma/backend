import { model, Schema, ObjectId } from "mongoose";

const SubSchema = new Schema(
  {
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

export default model("Subscription", SubSchema);
