import { Router } from "express";
import { submitContactForm } from "./contact.controller";

export const contactRouter = Router();

contactRouter.post("/contact", submitContactForm);
