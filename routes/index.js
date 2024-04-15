import express from "express";
import authRoutes from "./auth.routes.js";
import error from "../middlewares/error.js";
import paymentRoutes from "./payment.routes.js";
import brokerRoutes from "./broker.routes.js";
import uploaderRoutes from "./upload.image.routes.js";
// import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/user", userRoutes);
router.use("/payment", paymentRoutes);
router.use("/broker", brokerRoutes);
router.use("/upload", uploaderRoutes);
router.use(error);

export default router;
