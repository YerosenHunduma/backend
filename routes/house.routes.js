import express from "express";
import * as house from "../controllers/house.controllers.js";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/post-house",
  isAuthenticated,
  authorizedRoles("Broker"),
  uploadImageFromLocalToServer.array("file", 10),
  house.postHouse
);

router.get("/get-houses", house.getHouses);
router.get("/house-detail/:id", house.houseDetail);
router.get(
  "/all-houses",
  isAuthenticated,
  authorizedRoles("Admin"),
  house.getAllHouses
);

export default router;
