import { Router } from "express";
import {
  AddImage,
  GetGalleries,
  RemoveImage,
} from "../controllers/GalleryController.js";
import { authenticateToken } from "../middleware/Auth.js";
import { upload } from "../utilitis/multerConf.js";

const GalleryRouter = Router();

GalleryRouter.get("/:id", GetGalleries);
GalleryRouter.post("/:id", authenticateToken, upload.single("file"), AddImage);
GalleryRouter.delete("/:id", authenticateToken, RemoveImage);

export default GalleryRouter;
