import Car from "../models/car.model.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
import apiFilters from "../utils/apiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";
import { geocoder } from "../config/geoCoderConfig.js";

export const PostCar = catchAsyncError(async (req, res, next) => {
  const { address } = JSON.parse(req.body.jsonData);
  const mainFolderName = "cars";

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
});
