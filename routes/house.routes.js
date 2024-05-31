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

router.delete("/delete-house/:id", isAuthenticated, house.DeleteHouse);
router.delete("/delete-image/:id", isAuthenticated, house.deleteImage);
router.put("/update-house/:id", isAuthenticated, house.updateHouse);
router.put("/update-sold-house", isAuthenticated, house.soldHouse);

export default router;
