import Event from "../models/Event.js";
import cloudinary from "cloudinary";
export const CreateEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, speakers } =
      req.body;
    const files = req.files;
    // Validation checks
    if (!title) {
      return res.status(400).json({ error: "Event name is required" });
    }

    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    if (!startDate) {
      return res.status(400).json({ error: "Start date is required" });
    }

    const mainFile = req.files["file"][0];
    if (!mainFile) {
      return res.status(400).json({ error: "Event Must Have An Image" });
    }

    // Upload main image
    const { secure_url } = await cloudinary.v2.uploader.upload(mainFile.path, {
      folder: "events",
    });

    // Process speakers
    const processedSpeakers = [];

    // Check if speakers exist and is an array
    if (speakers && Array.isArray(speakers)) {
      for (let i = 0; i < speakers.length; i++) {
        const speaker = JSON.parse(speakers[i]); // Assuming speakers are sent as stringified JSON

        // Prepare speaker data
        const speakerData = {
          firstName: speaker.firstName || "",
          lastName: speaker.lastName || "",
          image: null,
        };
        // Check if speaker image exists
        if (files.speakerImages && files.speakerImages[i]) {
          const { secure_url } = await cloudinary.v2.uploader.upload(
            files.speakerImages[i].path,
            {
              folder: "speakers",
            }
          );
          speakerData.image = secure_url;
        }

        processedSpeakers.push(speakerData);
      }
    }

    const event = await Event.create({
      title,
      description,
      location,
      date: {
        start: startDate,
        end: endDate,
      },
      image: secure_url,
      speakers: processedSpeakers,
    });

    if (!event) {
      return res.status(500).json({
        message: "Failed to create event",
      });
    }

    // Successful response
    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "An unexpected error occurred",
    });
  }
};

const getEventStatus = (event, currentDate) => {
  if (event.date.end && new Date(event.date.end) < currentDate) {
    return "old";
  }
  if (new Date(event.date.start) > currentDate) {
    return "upcoming";
  }
  return "ongoing";
};

export const GetEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const queries = {
      old: {
        "date.end": { $lt: currentDate },
      },
      ongoing: {
        $and: [
          { "date.start": { $lte: currentDate } },
          {
            $or: [{ "date.end": { $gte: currentDate } }, { "date.end": null }],
          },
        ],
      },
      upcoming: {
        "date.start": { $gt: currentDate },
      },
      all: {},
    };

    const type = req.query.type?.toLowerCase();

    let events;
    if (type && queries[type]) {
      events = await Event.find(queries[type]).sort({ "date.start": 1 });
    } else {
      events = await Event.find().sort({ "date.start": 1 }).lean();
      events = events.map((event) => ({
        ...event,
        status: getEventStatus(event, currentDate),
      }));
    }

    res.status(200).json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const GetEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UpdateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      speakers: speakersJson,
    } = req.body;
    const files = req.files;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (startDate) event.date.start = startDate;
    if (endDate) event.date.end = endDate;

    if (files?.file?.[0]) {
      const { secure_url } = await cloudinary.uploader.upload(
        files.file[0].path,
        {
          folder: "events",
        }
      );
      event.image = secure_url;
    }

    const speakers = JSON.parse(speakersJson);
    const speakerImages = files?.speakerImages || [];
    let imageIndex = 0;

    const updatedSpeakers = await Promise.all(
      speakers.map(async (speaker) => {
        const speakerObj = {
          firstName: speaker.firstName,
          lastName: speaker.lastName,
          image: speaker.image,
        };

        if (!speaker.isNew && speaker._id) {
          speakerObj._id = speaker._id;
        }
        if (!speaker.image && speakerImages[imageIndex]) {
          const { secure_url } = await cloudinary.uploader.upload(
            speakerImages[imageIndex].path,
            {
              folder: "speakers",
            }
          );
          speakerObj.image = secure_url;
          imageIndex++;
        }

        return speakerObj;
      })
    );
    event.speakers = updatedSpeakers;
    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: error.message });
  }
};

export const DeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
