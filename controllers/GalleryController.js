import Gallery from "../models/Gellery.js";
import cloudinary from "cloudinary";

export const GetGalleries = async (req, res) => {
  try {
    const { id } = req.params;
    const galleries = await Gallery.find({ event: id });
    res.status(200).json({ galleries });
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
};

export const AddImage = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const image = await cloudinary.v2.uploader.upload(file.path, {
      folder: "galleries",
    });
    const gallery = await Gallery.create({
      event: id,
      image: image?.secure_url,
    });
    res.status(200).json({ gallery });
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
};

export const RemoveImage = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findByIdAndDelete(id);
    if (!gallery) return res.status(404).json({ message: "Gallery Not Found" });
    res.status(200).json({ gallery });
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
};
