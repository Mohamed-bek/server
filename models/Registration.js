import { Schema, model } from "mongoose";

const registrationSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
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

registrationSchema.index({ email: 1, event: 1 }, { unique: true });

const Registration = model("Registration", registrationSchema);
export default Registration;
