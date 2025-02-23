import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token is required" });
  }
  const accessToken = authHeader.split(" ")[1];
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.admin = admin;
    next();
  });
};
