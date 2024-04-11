import { Chapa } from "chapa-nodejs";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Broker from "../models/broker.model.js";

const chapa = new Chapa({
  secretKey: process.env.Chapa_Secret_key,
});

export const PaymentService = async (req, res) => {
  const tx_ref = await chapa.generateTransactionReference();

  const { name, lastName, email, amount } = req.body;
  const broker = await Broker.findOne({ email });
  if (!broker) {
    return res.status(404).send("Broker not found");
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
    let startDate = new Date(created_at);
    let endDate;
    if (amount == 100) {
      plan = "monthly";
      endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
    } else if (amount == 500) {
      plan = "quarterly";
      endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
    } else if (amount == 1000) {
      plan = "yearly";
      endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
    } else {
      return res.send("Invalid amount");
    }

    console.log(
      broker.subscription.plan,
      broker.subscription.startDate,
      broker.subscription.endDate
    );
    console.log(plan, startDate, endDate);
    const paidBy = broker ? broker._id : null;
    broker.subscription.plan = plan;
    broker.subscription.startDate = startDate;
    broker.subscription.endDate = endDate;

    await broker.save();

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
    return res.send(200);
  }
};
