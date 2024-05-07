import express from "express";
import * as user from "../controllers/user.controllers.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";

const router = express.Router();

router.post("/post-blog", jwtAuthMiddleware, user.postBlog);
router.get("/get-posted-blogs", user.getBlogs);
router.get("/get-totalAsset", user.TotalAsset);
router.get("/latestAssets", user.latestAssets);
router.get("/admin-getAllBrokers", user.adminGetAllbrokers);
router.get("/assets-per-months", user.asset_per_month);
router.post("/wishlist", jwtAuthMiddleware, user.addToWishlist);
router.delete("/wishlist/:assetId", jwtAuthMiddleware, user.RemoveFromWishlist);
router.get("/get-wishlists", jwtAuthMiddleware, user.getUserWishlists);

export default router;
