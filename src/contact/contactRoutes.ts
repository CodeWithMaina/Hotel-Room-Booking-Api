import express from "express";
import { handleContactForm } from "./contactController";

export const contactRouter = express.Router();

contactRouter.post("/contact", handleContactForm);

