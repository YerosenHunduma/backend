import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
import Car from "../models/car.model.js";
import House from "../models/house.model.js";
import apiFilters from "../utils/apiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getAllBrokers = catchAsyncError(async (req, res) => {
  const resPerPage = 4;
  const apiFilter = new apiFilters(Broker, req.query).search().filters().sort();
  let brokers = await apiFilter.query;
  const filteredBrokersCount = brokers.length;

  apiFilter.pagination(resPerPage);
  brokers = await apiFilter.query.clone();
  res.status(200).json({ resPerPage, filteredBrokersCount, brokers });
});

export const getBroker = catchAsyncError(async (req, res) => {
  const broker = await Broker.findById(req.params.id).populate("reviews.user");
  if (!broker) {
    return next(new errorHandler("broker not found", 404));
  }
  res.status(200).json(broker);
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
        review.rating = rating || broker?.reviews[0]?.rating;
        review.comment = comment || broker?.reviews[0]?.comment;
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
  const broker = await Broker.findById(brokerId).populate("reviews.user");
  if (!broker) {
    return next(new errorHandler("broker not found", 404));
  }
  res.status(200).json({ reviews: broker.reviews });
});

export const TotalAssets = catchAsyncError(async (req, res, next) => {
  const cars = await Car.countDocuments({ postedBy: req.userId });
  const houses = await House.countDocuments({ postedBy: req.userId });
  const soldCars = await Car.countDocuments({
    postedBy: req.userId,
    sold: true,
  });
  const soldHouses = await House.countDocuments({
    postedBy: req.userId,
    sold: true,
  });

  const totalAsset = cars + houses;
  const soldAsset = soldCars + soldHouses;

  res.status(200).json({
    totalAsset,
    soldAsset,
  });
});

export const BrokerlatestPosts = catchAsyncError(async (req, res, next) => {
  const latestCars = await Car.find({ postedBy: req.userId })
    .populate("postedBy")
    .sort({ createdAt: -1 })
    .limit(5);
  const latestHouses = await House.find({ postedBy: req.userId })
    .populate("postedBy")
    .sort({ createdAt: -1 })
    .limit(5);

  // Merge the results into one array
  let combinedLatestAssets = [...latestCars, ...latestHouses];

  // Sort the combined array based on the createdAt field in descending order
  combinedLatestAssets.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Limit the combined array to 5 items
  combinedLatestAssets = combinedLatestAssets.slice(0, 5);

  res.status(200).json({
    success: true,
    latestAssets: combinedLatestAssets,
  });
});

export const broker_post_per_month = catchAsyncError(async (req, res, next) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  try {
    const carData = await Car.find({ postedBy: req.userId });
    const houseData = await House.find({ postedBy: req.userId });

    // Categorize car data by month
    const carCounts = {};
    carData.forEach((car) => {
      const month = new Date(car.createdAt).getMonth();
      if (!carCounts[month]) {
        carCounts[month] = 0;
      }
      carCounts[month]++;
    });

    // Categorize house data by month
    const houseCounts = {};
    houseData.forEach((house) => {
      const month = new Date(house.createdAt).getMonth();
      if (!houseCounts[month]) {
        houseCounts[month] = 0;
      }
      houseCounts[month]++;
    });

    const combinedData = [];
    for (let i = 0; i < 12; i++) {
      combinedData.push({
        month: monthNames[i],
        car: carCounts[i] || 0,
        house: houseCounts[i] || 0,
      });
    }

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching categorized data:", error);
    next(error);
  }
});

export const brokerCars = catchAsyncError(async (req, res, next) => {
  try {
    const brokerId = req.userId;
    const cars = await Car.find({ postedBy: brokerId })
      .select("_id type title price address images createdAt sold")
      .populate("postedBy", "_id name profile role");
    res.status(200).json(cars);
  } catch (error) {
    next(error);
  }
});

export const brokerHouses = catchAsyncError(async (req, res, next) => {
  try {
    const brokerId = req.userId;
    const houses = await House.find({ postedBy: brokerId })
      .select("_id type title price address images createdAt sold")
      .populate("postedBy", "_id name profile role");
    res.status(200).json(houses);
  } catch (error) {
    next(error);
  }
});
