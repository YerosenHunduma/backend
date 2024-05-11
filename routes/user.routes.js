import express from "express";
import * as user from "../controllers/user.controllers.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/post-blog",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.postBlog
);
router.get("/get-posted-blogs", user.getBlogs);
router.get(
  "/get-totalAsset",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.TotalAsset
);
router.get("/latestAssets", user.latestAssets);
router.get(
  "/admin-getAllBrokers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.adminGetAllbrokers
);
router.get(
  "/assets-per-months",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.asset_per_month
);
router.post("/wishlist", isAuthenticated, user.addToWishlist);
router.delete("/wishlist/:assetId", isAuthenticated, user.RemoveFromWishlist);
router.get("/get-wishlists", isAuthenticated, user.getUserWishlists);

export default router;
