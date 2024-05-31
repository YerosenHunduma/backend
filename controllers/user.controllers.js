import { errorHandler } from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";
import Car from "../models/car.model.js";
import House from "../models/house.model.js";
import Broker from "../models/broker.model.js";
import apiFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";
import { notifyBrokerTemplate } from "../utils/notifyBrokerTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import ContactUs from "../models/contactUs.js";

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
    .select("_id type title price address images action createdAt")
    .populate("postedBy", "_id name profile role")
    .populate("postedBy")
    .sort({ createdAt: -1 })
    .limit(5);
  const latestHouses = await House.find()
    .select("_id type title price address images action createdAt")
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

export const adminGetAllUnApprovedBrokers = catchAsyncError(
  async (req, res, next) => {
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
  }
);

export const adminGetAllbrokers = catchAsyncError(async (req, res, next) => {
  const resPerPage = 5;
  const sort = "-createdAt";
  const apiFilter = new apiFilters(Broker, req.query)
    .search()
    .filters()
    .sort(sort);
  let broker = await apiFilter.query;
  const filteredBrokersCount = broker.length;
  apiFilter.pagination(resPerPage);
  broker = await apiFilter.query.clone();

  res.status(200).json({ resPerPage, filteredBrokersCount, broker });
});

export const adminGetAllusers = catchAsyncError(async (req, res, next) => {
  const resPerPage = 5;
  const sort = "-createdAt";
  const apiFilter = new apiFilters(User, req.query)
    .search()
    .filters()
    .sort(sort);
  let user = await apiFilter.query;
  const filteredBrokersCount = user.length;
  apiFilter.pagination(resPerPage);
  user = await apiFilter.query.clone();

  res.status(200).json({ resPerPage, filteredBrokersCount, user });
});

export const approveBroker = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  try {
    const broker = await Broker.findById(id);
    if (!broker) {
      return next(new errorHandler("Broker not found", 404));
    }
    broker.isApproved = true;
    await broker.save();
    res.status(200).json({ success: true, broker });
  } catch (error) {
    next(error);
  }
});

export const DeavtivateBrokers = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  try {
    const broker = await Broker.findById(id);
    if (!broker) {
      return next(new errorHandler("Broker not found", 404));
    }
    broker.active = false;
    await broker.save();
    res.status(200).json({ success: true, broker });
  } catch (error) {
    next(error);
  }
});

export const avtivateBrokers = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  try {
    const broker = await Broker.findById(id);
    if (!broker) {
      return next(new errorHandler("Broker not found", 404));
    }
    broker.active = true;
    await broker.save();
    res.status(200).json({ success: true, broker });
  } catch (error) {
    next(error);
  }
});

export const DeavtivateUsers = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new errorHandler("Broker not found", 404));
    }
    user.active = false;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export const avtivateUsers = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new errorHandler("Broker not found", 404));
    }
    user.active = true;
    await user.save();
    res.status(200).json({ success: true, broker });
  } catch (error) {
    next(error);
  }
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
  const collection = req.role[0] === "Broker" ? "Broker" : "User";
  try {
    let user;
    if (collection === "User") {
      user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorite: req.body.assetId } },
        { new: true }
      );
    } else if (collection === "Broker") {
      user = await Broker.findByIdAndUpdate(
        userId,
        { $addToSet: { favorite: req.body.assetId } },
        { new: true }
      );
    } else {
      return new errorHandler("User is not found", 404);
    }
    const { password, ...userInfo } = user?._doc;
    res.status(200).json({ success: true, userInfo });
  } catch (error) {
    next(error);
  }
});

export const RemoveFromWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  const collection = req.role[0] === "Broker" ? "Broker" : "User";
  try {
    let user;
    if (collection === "User") {
      user = await User.findByIdAndUpdate(
        userId,
        { $pull: { favorite: req.params.assetId } },
        { new: true }
      );
    } else if (collection === "Broker") {
      user = await Broker.findByIdAndUpdate(
        userId,
        { $pull: { favorite: req.params.assetId } },
        { new: true }
      );
    } else {
      return new errorHandler("User is not found", 404);
    }
    const { password, ...userInfo } = user._doc;
    res.status(200).json({ success: true, userInfo });
  } catch (error) {
    next(error);
  }
});

export const getUserWishlists = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.userId;
    const collection = req.role[0] === "Admin" ? "User" : req.role[0];
    let blogsWithAuthors;
    if (collection === "User") {
      blogsWithAuthors = await User.aggregate([
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
                        $indexOfArray: [
                          "$houseBrokers._id",
                          "$$house.postedBy",
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);
    } else if (collection === "Broker") {
      blogsWithAuthors = await Broker.aggregate([
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
                        $indexOfArray: [
                          "$houseBrokers._id",
                          "$$house.postedBy",
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);
    }
    res.status(200).json({ success: true, wishlists: blogsWithAuthors[0] });
  } catch (error) {
    next(error);
  }
});

export const latest = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  const latestAssets = await Promise.all([
    Car.aggregate([
      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          price: 1,
          address: 1,
          images: 1,
          currency: 1,
          postedBy: 1,
          createdAt: 1,
          assetType: { $literal: "car" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
    ]),
    House.aggregate([
      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          price: 1,
          address: 1,
          images: 1,
          currency: 1,
          postedBy: 1,
          createdAt: 1,
          assetType: { $literal: "house" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
    ]),
  ]);

  let combinedLatestAssets = latestAssets[0].concat(latestAssets[1]);

  combinedLatestAssets.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const paginatedAssets = combinedLatestAssets.slice(skip, skip + limit);

  const totalAssetsCount = combinedLatestAssets.length;
  const totalPages = Math.ceil(totalAssetsCount / limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalAssetsCount,
    totalPages,
    latestAssets: paginatedAssets,
  });
});

export const notifyBroker = catchAsyncError(async (req, res, next) => {
  const { email, message } = req.body;

  let existingUser;
  const existingBroker = await Broker.findOne({ email });
  if (!existingBroker) {
    existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(
        new errorHandler("No user is found with this email address", 404)
      );
    }
  }

  try {
    if (existingBroker || existingUser) {
      const msg = notifyBrokerTemplate(
        existingBroker ? existingBroker.name : existingUser.name,
        message
      );
      await sendEmail({
        email: existingBroker ? existingBroker.email : existingUser.email,
        subject: "AssetMarketSquare Password Reset",
        message: msg,
      });
      res.status(200).json({
        success: true,
        message: `Email has been sent to ${existingBroker ? existingBroker.email : existingUser.email}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

export const Contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  try {
    await new ContactUs({
      name,
      email,
      message,
    }).save();
    res.status(200).json({
      success: true,
      message: "Your message sent successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const GetContacts = catchAsyncError(async (req, res, next) => {
  const resPerPage = 5;
  const sort = "-createdAt";
  const apiFilter = new apiFilters(ContactUs, req.query)
    .search()
    .filters()
    .sort(sort);
  let contact = await apiFilter.query;
  const filteredBrokersCount = contact.length;
  apiFilter.pagination(resPerPage);
  contact = await apiFilter.query.clone();

  res.status(200).json({ resPerPage, filteredBrokersCount, contact });
  const contacts = await ContactUs.find();
});
