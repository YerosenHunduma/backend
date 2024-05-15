import House from "../models/house.model.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
import assetApiFilters from "../utils/assetApiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";
import { geocoder } from "../config/geoCoderConfig.js";

export const postHouse = catchAsyncError(async (req, res, next) => {
  const { address } = JSON.parse(req.body.jsonData);
  const mainFolderName = "houses";

  try {
    const broker = await Broker.findById(req.userId);
    if (!broker) {
      return next(new errorHandler("User not found", 404));
    }
    const geo = await geocoder.geocode(address);
    console.log(geo);
    const uploadedImages = req.files.map(async (file) => {
      const result = await uploadTocloudinary(file.path, mainFolderName);
      return result;
    });
    const uploadResults = await Promise.all(uploadedImages);
    const successfulUploads = uploadResults.filter((url) => url !== null);

    const house = new House({
      ...JSON.parse(req.body.jsonData),
      postedBy: req.userId,
      images: successfulUploads,
      location: {
        type: "Point",
        coordinates: [geo[0]?.longitude, geo[0]?.latitude],
      },
      googleMap: geo,
    });
    await house.save();

    res.status(200).json({ success: true, house });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

export const getHouses = catchAsyncError(async (req, res, next) => {
  console.log(req.query);
  const resPerPage = 4;
  const apiFilter = new assetApiFilters(House, req.query)
    .search()
    .filters()
    .sort(req.query.sortedBy);
  let houses = await apiFilter.query;
  const filteredHouseCount = houses.length;
  apiFilter.pagination(resPerPage);
  houses = await apiFilter.query
    .clone()
    .select("_id type title price address images action createdAt")
    .populate("postedBy", "_id name profile role");
  console.log("first order", houses);
  res.status(200).json({ resPerPage, filteredHouseCount, houses });
});

export const houseDetail = catchAsyncError(async (req, res, next) => {
  const house = await House.findById(req.params.id).populate("postedBy");

  if (!house) {
    return next(new errorHandler("House not found", 404));
  }

  const Related = await House.find({
    _id: { $ne: house?._id },
    action: house?.action,
    type: house?.type,
    address: {
      $regex: house?.googleMap[0].city,
    },
  })
    .limit(4)
    .select("_id type title price address images action createdAt")
    .populate("postedBy", "_id name profile role");

  res.status(200).json({ success: true, house, Related });
});

//accessed by an admin

export const getAllHouses = catchAsyncError(async (req, res, next) => {
  const resPerPage = 4;
  const apiFilter = new assetApiFilters(House, req.query)
    .search()
    .filters()
    .sort();
  let houses = await apiFilter.query;
  const filteredBrokersCount = houses.length;
  apiFilter.pagination(resPerPage);
  houses = await apiFilter.query
    .clone()
    .select("_id title action price address images currency sold")
    .populate("postedBy");
  res.status(200).json({ resPerPage, filteredBrokersCount, houses });
});
