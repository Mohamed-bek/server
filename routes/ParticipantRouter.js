import { Router } from "express";
import {
  AddParticipant,
  GetParticipants,
  ParticipantStatus,
} from "../controllers/ParticipantController.js";
import { authenticateToken } from "../middleware/Auth.js";
import { upload } from "../utilitis/multerConf.js";

const ParticipantRouter = Router();

ParticipantRouter.post("/new", upload.single("file"), AddParticipant);
ParticipantRouter.get("/all", authenticateToken, GetParticipants);
ParticipantRouter.put("/:id", authenticateToken, ParticipantStatus);

export default ParticipantRouter;
