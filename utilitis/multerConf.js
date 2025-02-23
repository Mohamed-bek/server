import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Define the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the uploads directory
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure the uploads directory exists

// Set up storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR); // Use the defined uploads directory
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname); // Get the file's original extension
    cb(null, file.fieldname + "-" + Date.now() + extname); // Append the extension to the filename
  },
});

// Create and export the multer instance
export const upload = multer({ storage: storage });
