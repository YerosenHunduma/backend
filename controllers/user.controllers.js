import { errorHandler } from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";
import Car from "../models/car.model.js";
import House from "../models/house.model.js";
import Broker from "../models/broker.model.js";
import apiFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

export const postBlog = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new errorHandler("User not found", 404));
  }
  const blog = new Blog({
    title,
    description,
    author: user._id,
  });
  await blog.save();
  res.status(201).json({
    success: true,
    blog,
  });
});

export const getBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await Blog.find().populate("author");
  res.status(200).json({
    success: true,
    blogs,
  });
});

export const TotalAsset = catchAsyncError(async (req, res, next) => {
  const totatActiveBrokers = await Broker.countDocuments({ active: true });
  const totatActiveUser = await User.countDocuments({ active: true });
  const cars = await Car.countDocuments();
  const houses = await House.countDocuments();
  const soldCars = await Car.countDocuments({ sold: true });
  const soldHouses = await House.countDocuments({ sold: true });

  const totalAsset = cars + houses;
  const soldAsset = soldCars + soldHouses;

  res.status(200).json({
    totalAsset,
    totatActiveUser,
    totatActiveBrokers,
    soldAsset,
  });
});

export const latestAssets = catchAsyncError(async (req, res, next) => {
  const latestCars = await Car.find()
    .select("_id type title price address images currency")
    .populate("postedBy", "_id name profile role")
    .populate("postedBy")
    .sort({ createdAt: -1 })
    .limit(5);
  const latestHouses = await House.find()
    .select("_id type title price address images currency")
    .populate("postedBy", "_id name profile role")
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
  combinedLatestAssets = combinedLatestAssets.slice(0, 4);

  res.status(200).json({
    success: true,
    latestAssets: combinedLatestAssets,
  });
});

export const adminGetAllbrokers = catchAsyncError(async (req, res, next) => {
  const resPerPage = 5;
  const sort = "-createdAt";
  const apiFilter = new apiFilters(Broker, req.query)
    .search()
    .UnApprovedbrokerfilter()
    .sort(sort);
  let broker = await apiFilter.query;
  const filteredBrokersCount = broker.length;
  apiFilter.pagination(resPerPage);
  broker = await apiFilter.query.clone();

  res.status(200).json({ resPerPage, filteredBrokersCount, broker });
});

export const asset_per_month = catchAsyncError(async (req, res, next) => {
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
    const carData = await Car.find();
    const houseData = await House.find();

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

export const addToWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorite: req.body.assetId } },
      { new: true }
    );
    const { password, ...userInfo } = user._doc;
    console.log("l", userInfo);
    res.status(200).json({ success: true, userInfo });
  } catch (error) {
    next(error);
  }
});

export const RemoveFromWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorite: req.params.assetId } },
      { new: true }
    );
    const { password, ...userInfo } = user._doc;
    console.log("d", userInfo);
    res.status(200).json({ success: true, userInfo });
  } catch (error) {
    next(error);
  }
});

export const getUserWishlists = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.userId;

    const blogsWithAuthors = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "cars",
          localField: "favorite",
          foreignField: "_id",
          as: "cars",
        },
      },
      {
        $lookup: {
          from: "houses",
          localField: "favorite",
          foreignField: "_id",
          as: "houses",
        },
      },
      {
        $lookup: {
          from: "brokers",
          let: { carBrokerIds: "$cars.postedBy" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$carBrokerIds"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                phoneNumber: 1,
                profile: 1,
              },
            },
          ],
          as: "carBrokers",
        },
      },
      {
        $lookup: {
          from: "brokers",
          let: { houseBrokerIds: "$houses.postedBy" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$houseBrokerIds"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                phoneNumber: 1,
                profile: 1,
              },
            },
          ],
          as: "houseBrokers",
        },
      },
      {
        $project: {
          cars: {
            $map: {
              input: "$cars",
              as: "car",
              in: {
                _id: "$$car._id",
                images: "$$car.images",
                landSize: "$$car.brand",
                model: "$$car.model",
                year: "$$car.year",
                currency: "$$car.currency",
                price: "$$car.price",
                priceType: "$$car.priceType",
                address: "$$car.address",
                action: "$$car.action",
                category: "$$car.category",
                bodyType: "$$car.bodyType",
                engineSize: "$$car.engineSize",
                type: "$$car.type",
                title: "$$car.title",

                postedBy: {
                  $arrayElemAt: [
                    "$carBrokers",
                    { $indexOfArray: ["$carBrokers._id", "$$car.postedBy"] },
                  ],
                },
              },
            },
          },
          houses: {
            $map: {
              input: "$houses",
              as: "house",
              in: {
                _id: "$$house._id",
                images: "$$house.images",
                landSize: "$$house.landSize",
                bedrooms: "$$house.bedrooms",
                bathrooms: "$$house.bathrooms",
                currency: "$$house.currency",
                price: "$$house.price",
                priceType: "$$house.priceType",
                address: "$$house.address",
                action: "$$house.action",
                parkingSpot: "$$house.parkingSpot",
                type: "$$house.type",
                title: "$$house.title",
                postedBy: {
                  $arrayElemAt: [
                    "$houseBrokers",
                    {
                      $indexOfArray: ["$houseBrokers._id", "$$house.postedBy"],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({ success: true, wishlists: blogsWithAuthors[0] });
  } catch (error) {
    next(error);
  }
});
