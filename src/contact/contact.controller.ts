import { Request, Response } from 'express';
import { saveContactMessage } from './contact.service';
import { sendEmailToSupport } from './sendEmailToSupport';
import { sendConfirmationEmailToUser } from './sendConfirmationEmailToUser';
import { ContactMessageInput, ContactResponse, contactSchema } from './contactValidator';


export const submitContactForm = async (
  req: Request<{}, {}, ContactMessageInput>,
  res: Response<ContactResponse>
): Promise<void> => {
  // Validate input
  const validationResult = contactSchema.safeParse(req.body);

  if (!validationResult.success) {
    const formattedErrors = validationResult.error.format();
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: {
        name: formattedErrors.name?._errors || [],
        email: formattedErrors.email?._errors || [],
        message: formattedErrors.message?._errors || [],
      },
    });
    return;
  }

  const { name, email, message } = validationResult.data;

  try {
    // Save to database
    const savedMessage = await saveContactMessage(name, email, message);

    if (!savedMessage) {
      throw new Error("Failed to save contact message");
    }

    // Send email to support
    await sendEmailToSupport({ name, email, message });

    // ✅ Send confirmation email to client
    await sendConfirmationEmailToUser({ name, email, message });

    // Successful response
    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully",
      data: {
        id: savedMessage.messageId,
        name: savedMessage.name,
        email: savedMessage.email,
      },
    });
  } catch (error) {
    console.error('Contact controller error:', error);
    
    res.status(500).json({
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred",
    });
  }
};
