import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    image: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    link: { type: String, required: true },
    techs: [{ type: String }],
  },
  { timestamps: true }
);

const Project = model("Project", projectSchema);

export default Project;
