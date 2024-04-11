import { model, Schema, ObjectId } from "mongoose";

const verifyResetTokenSchema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    // required: true,
    refPath: "userType",
  },
  token: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    // required: true,
    default: Date.now,
    expires: 900,
  },
  userType: {
    type: String,
    // required: true,
    enum: ["User", "Broker"],
  },
});

export default model("verificationToken", verifyResetTokenSchema);
