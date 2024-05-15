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
  "/admin-getAllUnApprovedBrokers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.adminGetAllUnApprovedBrokers
);

router.get(
  "/admin-getAllBrokers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.adminGetAllbrokers
);

router.get(
  "/admin-getAllUsers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.adminGetAllusers
);

router.put(
  "/approve-brokers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.approveBroker
);

router.put(
  "/deactivate-brokers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.DeavtivateBrokers
);

router.put(
  "/activate-brokers",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.avtivateBrokers
);

router.put(
  "/deactivate-users",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.DeavtivateUsers
);

router.put(
  "/activate-users",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.avtivateUsers
);

router.get(
  "/assets-per-months",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.asset_per_month
);

router.post(
  "/send-email",
  isAuthenticated,
  authorizedRoles("Admin"),
  user.notifyBroker
);
router.post("/wishlist", isAuthenticated, user.addToWishlist);
router.delete("/wishlist/:assetId", isAuthenticated, user.RemoveFromWishlist);
router.get("/get-wishlists", isAuthenticated, user.getUserWishlists);
router.get("/latest", user.latest);
router.post("/contact-us", user.Contact);

export default router;
