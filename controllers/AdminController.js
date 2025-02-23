import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { generateTokens } from "../utilitis/tokens.js";
import cloudinary from "cloudinary";
import Visitor from "../models/Visitor.js";
import Member from "../models/Member.js";
import Participant from "../models/Participant.js";
import Project from "../models/Project.js";
import Event from "../models/Event.js";
import jwt from "jsonwebtoken";
import {
  generateMonthlyData,
  generateCumulativeMonthlyData,
} from "../utilitis/Analytics.js";

export const AddAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    if (!newAdmin) {
      return res.status(400).json({ message: "User creation failed" });
    }

    res.status(200).json({ admin: newAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Email Dosen't exist" });
    }
    if (!(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(admin);
    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", admin, accessToken });
  } catch (error) {
    res.status(error.status || 500).json({ err: error.message });
  }
};

export const RefreshToken = (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken)
      return res.status(401).json({ error: "The Resfresh Not Found" });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, adminData) => {
        if (err) return res.status(403).json({ error: err });
        const adminId = adminData.id;
        const admin = await Admin.findById(adminId);
        console.log("Admin :", admin);
        console.log("admin.refreshToken :", admin.refreshToken);
        console.log("refreshToken :", refreshToken);
        if (!admin || admin.refreshToken !== refreshToken)
          return res
            .status(403)
            .json({ error: "The Refresh Token Is Not Like IN DB" });

        const newTokens = generateTokens(admin);

        admin.refreshToken = newTokens.refreshToken;
        await admin.save();

        res.cookie("refreshToken", newTokens.refreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { firstName, lastName, email, _id } = admin;

        res.status(200).json({
          message: "Refresh token Succeeded",
          admin: {
            firstName,
            lastName,
            email,
            _id,
          },
          accessToken: newTokens.accessToken,
        });
      }
    );
  } catch (error) {
    res.status(error.status || 400).json({ err: error.message });
  }
};

export const LogOut = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      res.cookie("refreshToken", "", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: -1,
        expires: new Date(0),
      });
      await Admin.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: "" } }
      );
    }
    res.status(204).json({ message: "Log Out Successfully" });
  } catch (error) {
    res.status(error.status || 404).json({ err: error.message });
  }
};

export const UpdateAvatar = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin Not Found" });
    }

    if (admin.image.public_id) {
      await cloudinary.v2.uploader.destroy(admin.image.public_id);
    }
    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
      file,
      {
        folder: "AdminsImages",
      }
    );

    // Update user image with new location
    admin.image = {
      secure_url,
      public_id,
    };
    await admin.save();

    res.status(200).json({ message: "Upload Success" });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(error.status || 500).json({ err: error.message });
  }
};

export const GetData = async (req, res) => {
  try {
    const [visitors, members, participants, projects, events] =
      await Promise.all([
        Visitor.countDocuments(),
        Member.countDocuments(),
        Participant.countDocuments(),
        Project.countDocuments(),
        Event.countDocuments(),
      ]);
    res.status(200).json({ visitors, members, participants, projects, events });
  } catch (error) {
    res.status({ message: "Faild To Get Data", err: error.message });
  }
};

export const GetAnalytics = async (req, res) => {
  try {
    const data = await generateCumulativeMonthlyData(Member, 6);
    res.status(200).json({ ...data });
  } catch (error) {
    res.status({ message: "Faild To Get Data", err: error.message });
  }
};

async function getVisitorAnalytics(month = 6) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - month);

  // First get monthly new visitors based on creation date
  const newVisitors = await Visitor.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        newVisitors: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: {
                if: { $lt: ["$_id.month", 10] },
                then: { $concat: ["0", { $toString: "$_id.month" }] },
                else: { $toString: "$_id.month" },
              },
            },
          ],
        },
        newVisitors: 1,
      },
    },
  ]);

  // Then get monthly visits and active visitors
  const visitStats = await Visitor.aggregate([
    {
      $unwind: "$visits",
    },
    {
      $match: {
        "visits.timestamp": {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$visits.timestamp" },
          month: { $month: "$visits.timestamp" },
        },
        uniqueVisitors: { $addToSet: "$visitorId" },
        totalVisits: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: {
                if: { $lt: ["$_id.month", 10] },
                then: { $concat: ["0", { $toString: "$_id.month" }] },
                else: { $toString: "$_id.month" },
              },
            },
          ],
        },
        totalVisits: 1,
        activeVisitors: { $size: "$uniqueVisitors" },
      },
    },
  ]);

  // Get array of last 6 months
  const months = getLastSixMonths(month);

  // Combine both stats and fill in missing months
  const filledMonthlyStats = months.map((month) => {
    const visits = visitStats.find((item) => item.month === month) || {
      totalVisits: 0,
      activeVisitors: 0,
    };
    const visitors = newVisitors.find((item) => item.month === month) || {
      newVisitors: 0,
    };

    return {
      month,
      totalVisits: visits.totalVisits,
      uniqueVisitors: Math.max(visits.activeVisitors, visitors.newVisitors), // Take the higher number
    };
  });

  // Calculate summary
  const summary = {
    totalVisitsAllTime: filledMonthlyStats.reduce(
      (sum, month) => sum + month.totalVisits,
      0
    ),
    totalUniqueVisitors: await Visitor.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    }),
  };

  return {
    monthlyStats: filledMonthlyStats,
    summary,
  };
}
function getLastSixMonths(month) {
  const months = [];
  const date = new Date();

  for (let i = 0; i < month; i++) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    months.unshift(`${year}-${month}`);
    date.setMonth(date.getMonth() - 1);
  }

  return months;
}

async function GetMemberAnalytics() {
  const MemberAnalytics = await Member.aggregate([
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "departments", // The name of the collection in MongoDB
        localField: "_id",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $unwind: "$departmentInfo", // Extract department details
    },
    {
      $project: {
        _id: 0, // Remove the department ID from the response
        department: "$departmentInfo.name", // Get the department name
        count: 1,
      },
    },
  ]);

  return MemberAnalytics;
}

export const GetAnalyticsOfCharts = async (req, res) => {
  try {
    const [MemberAnalytics, VisitorAnalytics, ProjectAnalytics] =
      await Promise.all([
        GetMemberAnalytics(),
        getVisitorAnalytics(12),
        generateMonthlyData(Project),
      ]);

    res
      .status(200)
      .json({ MemberAnalytics, VisitorAnalytics, ProjectAnalytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
