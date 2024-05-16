import Car from "../models/car.model.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
// import apiFilters from "../utils/apiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";
import { geocoder } from "../config/geoCoderConfig.js";
import assetApiFilters from "../utils/assetApiFilters.js";
import { deleteFromCloudinary } from "../config/cloudinaryConfig.js";

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

export const DeleteCar = catchAsyncError(async (req, res, next) => {
  console.log(req.params);
  const car = await Car.findById(req.params.id);
  if (!car) {
    return next(new errorHandler("Car not found", 404));
  }
  if (car.postedBy.toString() !== req.userId) {
    return next(
      new errorHandler("You are not authorized to delete this car", 401)
    );
  }

  car?.images.map((img) => console.log(img.public_id));
  const deletedImages = await Promise.all(
    car?.images.map(async (image) => {
      try {
        await deleteFromCloudinary(image.public_id);
        return true;
      } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${error}`);
        return false;
      }
    })
  );

  const failedDeletions = deletedImages.filter((deleted) => !deleted);

  if (failedDeletions.length > 0) {
    return next(
      new errorHandler(
        `Failed to delete ${failedDeletions.length} images.`,
        500
      )
    );
  }
  await House.deleteOne({ _id: house._id });

  res.status(200).json({ success: true, message: "Car deleted successfully" });
});

export const UpdateCar = catchAsyncError(async (req, res, next) => {
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
