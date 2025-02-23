import { Router } from "express";
import {
  MakeRegistration,
  GetRegistrations,
} from "../controllers/RegistrationController.js";

const RegistrationRouter = Router();

RegistrationRouter.post("/", MakeRegistration);
RegistrationRouter.get("/:id", GetRegistrations);

export default RegistrationRouter;
