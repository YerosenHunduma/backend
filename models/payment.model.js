import mongoose from "mongoose";
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  charge: {
    type: Number,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
    required: true,
  },
  tx_ref: {
    type: String,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Payment", paymentSchema);
