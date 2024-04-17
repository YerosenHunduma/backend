import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
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
  SubscribedBroker: {
    type: Schema.Types.ObjectId,
    ref: "Broker",
  },
});

const Subscription = model("Subscription", subscriptionSchema);
export default Subscription;
