import express from "express";
import * as payment from "../controllers/payment.controllers.js";

const router = express.Router();

router.post("/pay", payment.PaymentService);
router.post("/webhook", payment.chapaWebhook);

export default router;
