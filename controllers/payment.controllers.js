import { Chapa } from "chapa-nodejs";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.js";

const chapa = new Chapa({
  secretKey: process.env.Chapa_Secret_key,
});

export const PaymentService = async (req, res) => {
  var tx_ref = await chapa.generateTransactionReference();
  const { Fname, Lname, email, amount } = req.body;

  const data = await chapa.initialize({
    first_name: Fname,
    last_name: Lname,
    email: email,
    currency: "ETB",
    amount: amount,
    tx_ref: tx_ref,
    callback_url: "https://example.com/",
    return_url: "https://yerosen.com/",
  });
  console.log(data);
  return res.status(200).json(data);
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
    status,
    reference,
    tx_ref,
    payment_method,
    created_at,
    updated_at,
  } = req.body;

  const paidBy = User.findOne({ email });
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-chapa-signature"]) {
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
      tx_ref,
      payment_method,
      paidBy,
    });
    await payment.save();
    return res.send(200);
  }
};

export const enddate = (req, res) => {
  const { amount } = req.body;
  console.log(amount);
  console.log(Date.now());
  const startDate = Date.now();
  console.log(startDate);
  if (amount == 100) {
    let sd = new Date(startDate);
    console.log("uu", sd);
    let ed = new Date(sd.setMonth(sd.getMonth() + 1));
    console.log("mm", ed);
  } else if (amount == 500) {
    let sd = new Date(startDate);
    console.log("uu", sd);
    let ed = new Date(sd.setMonth(sd.getMonth() + 3));
    console.log("mm", ed);
  } else if (amount == 1000) {
    let sd = new Date(startDate);
    console.log("uu", sd);
    let ed = new Date(sd.setFullYear(sd.getFullYear() + 1));
    console.log("mm", ed);
  }
};

export const sub = async (req, res) => {
  const { amount } = req.body;
  let plan = ""; // Change plan assignment to an empty string
  let endDate;
  let sd = new Date(Date.now());
  if (amount == 100) {
    plan = "monthly"; // Assign string value directly
    endDate = new Date(sd.setMonth(sd.getMonth() + 1));
  } else if (amount == 500) {
    plan = "quarterly"; // Assign string value directly
    endDate = new Date(sd.setMonth(sd.getMonth() + 3));
  } else if (amount == 1000) {
    plan = "yearly"; // Assign string value directly
    endDate = new Date(sd.setFullYear(sd.getFullYear() + 1));
  }
  const sub = new Subscription({
    subscription: {
      plan, // Assign plan directly without wrapping in an array
      startDate: new Date(Date.now()),
      endDate,
    },
  });
  await sub.save();
  return res.status(200).send("Subscription created successfully");
};
