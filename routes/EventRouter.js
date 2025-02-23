import { Router } from "express";
import {
  CreateEvent,
  DeleteEvent,
  GetEvent,
  GetEvents,
  UpdateEvent,
} from "../controllers/EventController.js";
import { authenticateToken } from "../middleware/Auth.js";
import { upload } from "../utilitis/multerConf.js";

const EventRouter = Router();

EventRouter.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "speakerImages", maxCount: 10 },
  ]),
  CreateEvent
);

EventRouter.put(
  "/:id",
  authenticateToken,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "speakerImages", maxCount: 10 },
  ]),
  UpdateEvent
);

EventRouter.get("/", GetEvents);
EventRouter.get("/:id", GetEvent);
EventRouter.delete("/:id", DeleteEvent);

export default EventRouter;
