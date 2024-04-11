import express from "express";
import authRoutes from "./auth.routes.js";
import error from "../middlewares/error.js";
import userRoutes from "./asset.routes.js";
import paymentRoutes from "./payment.routes.js";
import brokerRoutes from "./broker.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/payment", paymentRoutes);
router.use("/get", brokerRoutes);
router.use(error);

export default router;
