import { Router } from "express";
import {
  AddAdmin,
  GetAnalytics,
  GetAnalyticsOfCharts,
  GetData,
  Login,
  LogOut,
  RefreshToken,
  UpdateAvatar,
} from "../controllers/AdminController.js";
import { authenticateToken } from "../middleware/Auth.js";

const AdminRouter = Router();

AdminRouter.post("/create", authenticateToken, AddAdmin);
AdminRouter.post("/login", Login);
AdminRouter.get("/refresh", RefreshToken);
AdminRouter.post("/logout", LogOut);
AdminRouter.put("/", authenticateToken, UpdateAvatar);
AdminRouter.get("/statics", authenticateToken, GetData);
AdminRouter.get("/analytics", authenticateToken, GetAnalytics);
AdminRouter.get(
  "/dashboard-analytics",
  // authenticateToken,
  GetAnalyticsOfCharts
);

export default AdminRouter;
