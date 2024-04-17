import { Chapa } from "chapa-nodejs";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Broker from "../models/broker.model.js";
import Subscription from "../models/subscription.model.js";

const chapa = new Chapa({
  secretKey: process.env.Chapa_Secret_key,
});

export const PaymentService = async (req, res) => {
  const tx_ref = await chapa.generateTransactionReference();

  const { name, lastName, email, amount } = req.body;
  const broker = await Broker.findOne({ email });
  if (!broker) {
    return res
      .status(404)
      .json({ success: false, message: "Broker not found" });
  }
  const subscription = await Subscription.findOne({
    SubscribedBroker: broker._id,
  });
  if (subscription) {
    return res.json({
      success: false,
      message: "You already have an active subscription",
    });
  }
  if (!broker.isApproved) {
    return res.json({
      success: false,
      message: "Your account is not approved yet",
    });
  }
  const parsedAmount = parseInt(amount);
  if (parsedAmount !== 100 && parsedAmount !== 500 && parsedAmount !== 1000) {
    return res.json({ success: false, message: "Invalid amount" });
  }

  const data = await chapa.initialize({
    first_name: name,
    last_name: lastName,
    email: email,
    currency: "ETB",
    amount: amount,
    tx_ref: tx_ref,
    callback_url: "https://yero-chapa.onrender.com/api/payment/myWebhook,",
    return_url: "https://yerosen.com/",
  });

  return res.status(200).json({ success: true, data });
};

export const chapaWebhook = async (req, res) => {
  const secret = process.env.webhook_secret_key;
  const {
    first_name,
    last_name,
    email,
    currency,
    amount,
    charge,
    mode,
    type,
    tx_ref,
    status,
    reference,
    payment_method,
    created_at,
    updated_at,
  } = req.body;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-chapa-signature"]) {
    const broker = await Broker.findOne({ email });
    let plan = "";
    const startDate = new Date(created_at);
    let endDate;
    if (amount == 100) {
      plan = "monthly";
      endDate = new Date(startDate.getTime());
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (amount == 500) {
      plan = "quarterly";
      endDate = new Date(startDate.getTime());
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (amount == 1000) {
      plan = "yearly";
      endDate = new Date(startDate.getTime());
      endDate.setMonth(startDate.getMonth() + 1);
    } else {
      return res.send("Invalid amount");
    }
    const newSubscription = new Subscription({
      subscription: {
        plan: plan,
        startDate: startDate,
        endDate: endDate,
      },
      SubscribedBroker: broker._id,
    });

    await newSubscription.save();

    const paidBy = broker ? broker._id : null;

    const payment = new Payment({
      first_name,
      last_name,
      email,
      currency,
      amount,
      charge,
      mode,
      type,
      status,
      reference,
      created_at,
      updated_at,
      tx_ref,
      payment_method,
      paidBy,
    });
    await payment.save();
    return res.sendStatus(200);
  }
};
