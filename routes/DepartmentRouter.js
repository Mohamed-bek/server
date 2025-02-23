import { Router } from "express";
import {
  AddDepartment,
  GetDepartements,
  RemoveMember,
  GetDepartement,
  UpdateDepartment,
  deleteDepartment,
} from "../controllers/DepartmentController.js";
import { authenticateToken } from "../middleware/Auth.js";
import { upload } from "../utilitis/multerConf.js";

const DepartmentRouter = Router();

DepartmentRouter.post(
  "/",
  authenticateToken,
  upload.single("file"),
  AddDepartment
);

DepartmentRouter.get("/", GetDepartements);
DepartmentRouter.get("/:id", GetDepartement);

DepartmentRouter.put(
  "/:id",
  authenticateToken,
  upload.single("file"),
  UpdateDepartment
);
DepartmentRouter.patch("/member/:id", authenticateToken, RemoveMember);
DepartmentRouter.delete("/:id", authenticateToken, deleteDepartment);

export default DepartmentRouter;
