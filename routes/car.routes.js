import express from "express";
import * as car from "../controllers/car.controller.js";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/post-car",
  isAuthenticated,
  authorizedRoles("Broker"),
  uploadImageFromLocalToServer.array("file", 10),
  car.PostCar
);

router.get("/get-cars", car.getCars);
router.get("/car-detail/:id", car.carDetail);
router.get(
  "/all-cars",
  isAuthenticated,
  authorizedRoles("Admin"),
  car.getAllCars
);

router.delete("/delete-car/:id", isAuthenticated, car.DeleteCar);
router.delete("/delete-image/:id", isAuthenticated, car.deleteImage);
router.put("/update-car/:id", isAuthenticated, car.updateCar);
router.put("/update-sold-car", isAuthenticated, car.soldCar);

export default router;
