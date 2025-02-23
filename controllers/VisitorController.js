import Visitor from "../models/Visitor.js";

export const TrackVisit = async (req, res) => {
  try {
    const { visitorId, path, device } = req.body;

    let visitor = await Visitor.findOne({ visitorId });

    if (!visitor) {
      visitor = new Visitor({
        visitorId,
        device: {
          type: device.type,
          browser: device.browser,
          os: device.os,
        },
        location: {
          ip: req.ip,
        },
      });
    }

    visitor.visits.push({ path });
    visitor.totalVisits += 1;
    visitor.lastVisit = new Date();

    await visitor.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error tracking visit",
      error: error.message,
    });
  }
};

export const TrackTime = async (req, res) => {
  try {
    const { visitorId, path, timeSpent } = req.body;

    const visitor = await Visitor.findOne({ visitorId });

    if (visitor) {
      const visitIndex = visitor.visits.findIndex(
        (visit) => visit.path === path && !visit.timeSpent
      );

      if (visitIndex !== -1) {
        visitor.visits[visitIndex].timeSpent = timeSpent;
        await visitor.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error tracking time",
      error: error.message,
    });
  }
};
