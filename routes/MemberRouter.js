import { Router } from "express";
import {
  AddMember,
  UpdateMember,
  DeleteMember,
  GetMembers,
  GetMember,
} from "../controllers/MemberController.js";
import { authenticateToken } from "../middleware/Auth.js";
import { upload } from "../utilitis/multerConf.js";

const MemberRouter = Router();

MemberRouter.post("/", authenticateToken, upload.single("file"), AddMember);
MemberRouter.put(
  "/:id",
  authenticateToken,
  upload.single("file"),
  UpdateMember
);
MemberRouter.delete("/:id", authenticateToken, DeleteMember);
MemberRouter.get("/all", GetMembers);
MemberRouter.get("/:id", GetMember);

export default MemberRouter;
