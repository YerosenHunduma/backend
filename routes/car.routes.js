import express from "express";
import * as car from "../controllers/car.controller.js";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";

const router = express.Router();

router.post(
  "/post-car",
  jwtAuthMiddleware,
  uploadImageFromLocalToServer.array("file", 10),
  car.PostCar
);

router.get("/get-cars", car.getCars);
router.get("/car-detail/:id", car.carDetail);
router.get("/all-cars", car.getAllCars);

export default router;
