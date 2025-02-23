import fs from "fs";
import Department from "../models/Department.js";
import cloudinary from "cloudinary";
import Member from "../models/Member.js";
export const AddDepartment = async (req, res) => {
  try {
    const { name, description, leader, co_leader, responsibilities } = req.body;
    if (!name || !description || !leader)
      return res.status(400).json({ error: "Data is Missing" });
    const imageFile = req.file;
    if (!imageFile)
      return res.status(400).json({ error: "Image Of Department Is Missing" });
    const image = await cloudinary.v2.uploader.upload(imageFile.path, {
      folder: "Department",
    });
    const responsibilitiesValues = JSON.parse(responsibilities);
    const department = await Department.create({
      name,
      description,
      leader,
      co_leader,
      members: [],
      image,
      responsibilities: responsibilitiesValues,
    });
    await fs.promises.unlink(imageFile.path);
    res.status(200).json({ department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UpdateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, leader, co_leader, responsibilities } = req.body;
    const department = await Department.findById(id);
    if (name && department.name !== name) {
      department.name = name;
    }
    if (description && department.description !== description) {
      department.description = description;
    }
    if (leader && department.leader !== leader) {
      department.leader = leader;
    }
    if (co_leader && department.co_leader !== co_leader) {
      department.co_leader = co_leader;
    }
    const responsibilitiesValues = JSON.parse(responsibilities);
    department.responsibilities = responsibilitiesValues;
    const imageFile = req.file;
    if (imageFile) {
      await cloudinary.v2.uploader.destroy(department.image.public_id);
      const image = await cloudinary.v2.uploader.upload(imageFile.path, {
        folder: "Department",
      });
      department.image = image;
    }
    await department.save();
    res.status(200).json({ department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const RemoveMember = async (req, res) => {
  try {
    const { departmentId } = req.id;
    const { memberId } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const memberIndex = department.members.indexOf(memberId);
    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ error: "Member not found in this department" });
    }

    department.members.splice(memberIndex, 1);

    if (department.co_leader === memberId) {
      department.co_leader = null;
    }
    if (department.leader === memberId) {
      department.leader = null;
    }

    await department.save();

    res
      .status(200)
      .json({ message: "Member removed successfully", department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const GetDepartements = async (req, res) => {
  try {
    const departments = await Department.find().populate([
      { path: "leader", select: "image firstName lastName" },
      {
        path: "co_leader",
        select: "image firstName lastName",
      },
    ]);

    // Use map + Promise.all to ensure all async operations complete
    const ListOfDepartments = await Promise.all(
      departments.map(async (department) => {
        const departementNbMembers = await Member.countDocuments({
          department: department._id,
        });
        return { ...department.toObject(), members: departementNbMembers };
      })
    );

    res.status(200).json({ departments: ListOfDepartments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const GetDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    res.status(200).json({ department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);
    if (!department)
      res.status(404).json({ error: "The Department does not exist" });
    res.status(200).json({ message: "Department Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
