import { Schema, model } from "mongoose";

const gallerySchema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Gallery = model("Gallery", gallerySchema);
export default Gallery;
