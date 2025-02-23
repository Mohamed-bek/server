import { Router } from "express";
import { TrackTime, TrackVisit } from "../controllers/VisitorController.js";

const VisitorRouter = Router();

VisitorRouter.post("/track", TrackVisit);
VisitorRouter.post("/track-time", TrackTime);

export default VisitorRouter;
