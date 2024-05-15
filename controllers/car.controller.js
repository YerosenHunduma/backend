import Car from "../models/car.model.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
// import apiFilters from "../utils/apiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";
import { geocoder } from "../config/geoCoderConfig.js";
import assetApiFilters from "../utils/assetApiFilters.js";

export const PostCar = catchAsyncError(async (req, res, next) => {
  const { address } = JSON.parse(req.body.jsonData);
  const mainFolderName = "cars";

  try {
    const broker = await Broker.findById(req.userId);
    if (!broker) {
      return next(new errorHandler("User not found", 404));
    }

    const geo = await geocoder.geocode(address);

    const uploadedImages = req.files.map(async (file) => {
      const result = await uploadTocloudinary(file.path, mainFolderName);
      return result;
    });

    const uploadResults = await Promise.all(uploadedImages);
    const successfulUploads = uploadResults.filter((url) => url !== null);

    const car = new Car({
      ...JSON.parse(req.body.jsonData),
      postedBy: req.userId,
      images: successfulUploads,
      location: {
        type: "Point",
        coordinates: [geo[0]?.longitude, geo[0]?.latitude],
      },
      googleMap: geo,
    });
    await car.save();

    res.status(200).json({ success: true, car });
  } catch (error) {
    next(error);
  }
});

export const getCars = catchAsyncError(async (req, res, next) => {
  const resPerPage = 4;
  const apiFilter = new assetApiFilters(Car, req.query)
    .search()
    .filters()
    .sort(req.query.sortedBy);
  let cars = await apiFilter.query;
  const filteredCarsCount = cars.length;
  apiFilter.pagination(resPerPage);
  cars = await apiFilter.query
    .clone()
    .select("_id type title price address images action createdAt")
    .populate("postedBy", "_id name profile role");
  res.status(200).json({ resPerPage, filteredCarsCount, cars });
});

export const carDetail = catchAsyncError(async (req, res, next) => {
  const car = await Car.findById(req.params.id).populate("postedBy");
  if (!car) {
    return next(new errorHandler("Car not found", 404));
  }

  const Related = await Car.find({
    _id: { $ne: car?._id },
    action: car?.action,
    type: car?.type,
    address: {
      $regex: car?.googleMap[0].city,
    },
  })
    .limit(4)
    .select("_id type title price address images action createdAt")
    .populate("postedBy", "_id name profile role");

  res.status(200).json({ success: true, car, Related });
});

//accessed by an admin

export const getAllCars = catchAsyncError(async (req, res, next) => {
  const resPerPage = 3;
  const apiFilter = new assetApiFilters(Car, req.query)
    .search()
    .filters()
    .sort();
  let car = await apiFilter.query;
  const filteredBrokersCount = car.length;
  apiFilter.pagination(resPerPage);
  car = await apiFilter.query
    .clone()
    .select("_id title action price address images currency sold")
    .populate("postedBy");
  res.status(200).json({ resPerPage, filteredBrokersCount, car });
});
