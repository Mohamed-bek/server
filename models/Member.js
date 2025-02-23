import { Schema, model } from "mongoose";

const memberSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      default: null,
      sparse: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    media: {
      linkedin: {
        type: String,
        default: null,
      },
      github: {
        type: String,
        default: null,
      },
      portfolio: {
        type: String,
        default: null,
      },
    },
    work: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Member = model("Member", memberSchema);
export default Member;
