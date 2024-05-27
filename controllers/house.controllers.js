import House from "../models/house.model.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Broker from "../models/broker.model.js";
import assetApiFilters from "../utils/assetApiFilters.js";
import { errorHandler } from "../utils/errorHandler.js";
import uploadTocloudinary, {
  deleteFromCloudinary,
} from "../config/cloudinaryConfig.js";
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
    const uploadedImages = req.files.map(async (file) => {
      const result = await uploadTocloudinary(file.path, mainFolderName);
      console.log(result);
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

export const DeleteHouse = catchAsyncError(async (req, res, next) => {
  const house = await House.findById(req.params.id);
  if (!house) {
    return next(new errorHandler("Car not found", 404));
  }
  if (house.postedBy.toString() !== req.userId) {
    return next(
      new errorHandler("You are not authorized to delete this car", 401)
    );
  }

  const deletedImages = await Promise.all(
    house?.images.map(async (image) => {
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

  res
    .status(200)
    .json({ success: true, message: "House deleted successfully" });
});

export const deleteImage = catchAsyncError(async (req, res, next) => {
  const house = await House.findById(req.params.id);
  if (!house) {
    return next(new errorHandler("House not found", 404));
  }
  if (house.postedBy.toString() !== req.userId) {
    return next(
      new errorHandler("You are not authorized to delete this image", 401)
    );
  }

  const image = house.images.find(
    (image) => image.public_id === req.body.imageId
  );

  if (!image) {
    return next(new errorHandler("Image not found", 404));
  }

  const deleted = await deleteFromCloudinary(image.public_id);
  if (!deleted) {
    return next(new errorHandler("Failed to delete image", 500));
  }

  house.images = house.images.filter(
    (image) => image.public_id !== req.body.imageId
  );

  await house.save();
  res
    .status(200)
    .json({ success: true, message: "Image deleted successfully" });
});

export const updateHouse = catchAsyncError(async (req, res, next) => {
  const { address, ...houseData } = JSON.parse(req.body.jsonData);
  const mainFolderName = "house";

  const house = await House.findById(req.params.id);
  if (!House) {
    return next(new errorHandler("House not found", 404));
  }

  if (house.postedBy.toString() !== req.userId) {
    return next(
      new errorHandler("You are not authorized to update this House", 401)
    );
  }

  const geo = await geocoder.geocode(address);
  if (geo.length === 0) {
    return next(new errorHandler("Invalid address", 400));
  }

  if (req.files && req.files.length > 0) {
    const uploadedImages = req.files.map(async (file) => {
      const result = await uploadTocloudinary(file.path, mainFolderName);
      return result;
    });

    const uploadResults = await Promise.all(uploadedImages);
    const successfulUploads = uploadResults.filter((url) => url !== null);

    const newImages = successfulUploads.map((upload) => ({
      public_id: upload.public_id,
      secure_url: upload.secure_url,
    }));

    house.images = [...house.images, ...newImages];
  }

  house.address = address;
  house.location = {
    type: "Point",
    coordinates: [geo[0].longitude, geo[0].latitude],
  };
  Object.assign(house, houseData);

  await house.save();

  res
    .status(200)
    .json({ success: true, message: "House updated successfully", house });
});

export const getHouses = catchAsyncError(async (req, res, next) => {
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
