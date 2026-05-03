import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import authRouter from "./auth";
import clubsRouter from "./clubs";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/storage", storageRouter);
router.use("/auth", authRouter);
router.use("/clubs", clubsRouter);
router.use("/bookings", bookingsRouter);
router.use("/reviews", reviewsRouter);
router.use("/upload", uploadRouter);

export default router;
