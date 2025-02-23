import { Schema, model } from "mongoose";

const visitorSchema = new Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
    },

    visits: [
      {
        path: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        timeSpent: Number,
      },
    ],

    device: {
      type: {
        type: String,
        enum: ["mobile", "desktop", "tablet"],
      },
      browser: {
        type: String,
      },
      os: {
        type: String,
      },
    },

    location: {
      ip: String,
      country: String,
      city: String,
    },

    totalVisits: {
      type: Number,
      default: 1,
    },

    lastVisit: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
const Visitor = model("Visitor", visitorSchema);

export default Visitor;
