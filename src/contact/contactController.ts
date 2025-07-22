import { Request, Response } from "express";
import { contactSchema } from "./contactValidator";
import { sendContactEmail } from "./emailService";

export const handleContactForm = async (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.parse(req.body);

    const sanitizedData = {
      name: parsed.name.trim(),
      email: parsed.email.trim(),
      message: parsed.message.trim(),
    };

    await sendContactEmail(
      sanitizedData.name,
      sanitizedData.email,
      sanitizedData.message
    );

    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    if (err instanceof Error && "errors" in err) {
       res.status(400).json({ error: "Invalid input", details: err });
       return;
    }

    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to send message",
    });
  }
};
