import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
import apiFilters from "../utils/apiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getAllBrokers = catchAsyncError(async (req, res) => {
  const resPerPage = 6;
  const apiFilter = new apiFilters(Broker, req.query).search().filters();

  let brokers = await apiFilter.query;
  const filteredBrokersCount = brokers.length;

  apiFilter.pagination(resPerPage);
  brokers = await apiFilter.query.clone();
  res.status(200).json({ resPerPage, filteredBrokersCount, brokers });
});

export const getBroker = catchAsyncError(async (req, res) => {
  const broker = await Broker.findById(req.params.id);
  if (!broker) {
    return next(new errorHandler("broker not found", 404));
  }
  res.status(200).json(broker);
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const {
    name,
    lastName,
    email,
    address,
    phoneNumber,
    profile,
    biography,
    profileCloudId,
  } = req.body;

  const newBrokerData = {
    name,
    lastName,
    email,
    address,
    phoneNumber,
    profile,
    biography,
    profileCloudId,
  };
  const broker = await Broker.findById(req.userId);
  if (!broker) {
    return next(new errorHandler("broker not found", 404));
  }
  res.status(200).json(user);
});

export const createBrokerReviews = catchAsyncError(async (req, res, next) => {
  const { rating, comment, brokerId } = req.body;
  const review = {
    user: req.userId,
    rating,
    comment,
  };

  const broker = await Broker.findById(brokerId);

  if (!broker) {
    return next(new errorHandler("broker not found", 404));
  }

  // find(an array method) a review where the user id is req?.userId?
  const isReviewed = broker?.reviews?.find(
    (review) => review?.user?.toString() === req?.userId?.toString()
  );

  if (isReviewed) {
    broker.reviews.forEach((review) => {
      if (review.user.toString() === req.userId.toString()) {
        review.rating = rating;
        review.comment = comment;
      }
    });
  } else {
    broker.reviews.push(review);
    broker.numOfReviews = broker.reviews.length;
  }

  broker.ratings =
    broker.reviews.reduce((acc, review) => review.rating + acc, 0) /
    broker.reviews.length;

  await broker.save();
  res.status(200).json({ success: true });
});

export const getAllReviews = catchAsyncError(async (req, res, next) => {
  const brokerId = req.query.id;
  const broker = await Broker.findById(brokerId);
  if (!broker) {
    return next(new errorHandler("broker not found", 404));
  }
  res.status(200).json({ reviews: broker.reviews });
});
