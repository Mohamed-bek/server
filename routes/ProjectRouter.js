import { Router } from "express";
import {
  AddProject,
  DeleteProject,
  GetProjectById,
  GetProjects,
  UpdateProject,
} from "../controllers/ProjectController.js";
import { authenticateToken } from "../middleware/Auth.js";
import { upload } from "../utilitis/multerConf.js";

const ProjectRouter = Router();

ProjectRouter.post("/", authenticateToken, upload.single("file"), AddProject);
ProjectRouter.get("/", GetProjects);
ProjectRouter.get("/:id", GetProjectById);
ProjectRouter.delete("/:id", authenticateToken, DeleteProject);
ProjectRouter.put(
  "/:id",
  authenticateToken,
  upload.single("file"),
  UpdateProject
);

export default ProjectRouter;
