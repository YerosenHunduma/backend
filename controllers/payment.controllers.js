import { Chapa } from "chapa-nodejs";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Broker from "../models/broker.model.js";
import Subscription from "../models/subscription.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import apiFilters from "../utils/apiFilters.js";

const chapa = new Chapa({
  secretKey: process.env.Chapa_Secret_key,
});

export const PaymentService = catchAsyncError(async (req, res, next) => {
  const tx_ref = await chapa.generateTransactionReference();

  const { name, lastName, email, amount } = req.body;
  const broker = await Broker.findOne({ email });
  if (!broker) {
    return next(new errorHandler("Broker not found", 404));
  }
  const subscription = await Subscription.findOne({
    SubscribedBroker: broker._id,
  });
  if (subscription) {
    return next(
      new errorHandler("You already have an active subscription", 400)
    );
  }
  if (!broker.isApproved) {
    return next(new errorHandler("Your account is not approved yet", 403));
  }
  const parsedAmount = parseInt(amount);
  if (parsedAmount !== 100 && parsedAmount !== 500 && parsedAmount !== 1000) {
    return next(new errorHandler("Invalid amount", 400));
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
});

export const chapaWebhook = catchAsyncError(async (req, res) => {
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
      return next(errorHandler("Invalid amount", 400));
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
});

export const SubscriptionChecker = catchAsyncError(async (req, res, next) => {
  try {
    const broker = await Broker.findById(req.userId);
    if (!broker) {
      return next(new errorHandler("Broker not found", 404));
    }

    const subscription = await Subscription.findOne({
      SubscribedBroker: broker._id,
    });

    if (!subscription) {
      const Active_subscription = false;
      return res.status(200).json({ Active_subscription });
    }

    const currentDate = new Date();

    if (
      subscription?.subscription.endDate &&
      subscription?.subscription.endDate < currentDate
    ) {
      const Active_subscription = false;
      return res.status(200).json({ Active_subscription });
    }

    const Active_subscription = true;
    return res.status(200).json({ Active_subscription });
  } catch (error) {
    next(error);
  }
});

export const mysubscription = catchAsyncError(async (req, res, next) => {
  const broker = await Broker.findById(req.userId);
  if (!broker) {
    return next(new errorHandler("Broker not found", 404));
  }
  try {
    const subscription = await Subscription.findOne({
      SubscribedBroker: broker._id,
    });

    return res.status(200).json({ subscription });
  } catch (error) {
    next(error);
  }
});

export const transactions = catchAsyncError(async (req, res, next) => {
  const resPerPage = 7;
  const sort = "-created_at";
  try {
    const apiFilter = new apiFilters(Payment, req.query)
      .search()
      .filters()
      .sort(sort);

    let transaction = await apiFilter.query;
    const filteredTransactionCount = transaction.length;
    apiFilter.pagination(resPerPage);
    transaction = await apiFilter.query.clone();
    res.status(200).json({ filteredTransactionCount, resPerPage, transaction });
  } catch (error) {
    next(error);
  }
});
