import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
      },
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    speakers: [
      {
        firstName: String,
        lastName: String,
        image: String,
        link: String,
      },
    ],
  },
  { timestamps: true }
);

const Event = model("Event", eventSchema);

export default Event;
