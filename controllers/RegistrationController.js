import Registration from "../models/Registration.js";

export const MakeRegistration = async (req, res) => {
  try {
    const { firstName, lastName, email, event } = req.body;
    const registration = await Registration.create({
      firstName,
      lastName,
      email,
      event,
    });
    if (!registration)
      return res.status(400).json({ error: "Failed To Create Registration " });
    res.status(200).json({ message: "Registration Succeded" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const GetRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.query;
    let filter = { event: id };
    if (firstName) {
      filter.$or = [
        { firstName: { $regex: firstName, $options: "i" } },
        { lastName: { $regex: firstName, $options: "i" } },
      ];
    }

    if (lastName) {
      filter.$or = [
        { firstName: { $regex: lastName, $options: "i" } },
        { lastName: { $regex: lastName, $options: "i" } },
      ];
    }
    const registrations = await Registration.find(filter).populate(
      "event",
      "title"
    );
    res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
