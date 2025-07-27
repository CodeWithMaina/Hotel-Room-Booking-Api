import { Request, Response } from "express";
import {
  getUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "./user.service";
import { TUserInsert, TUserSelect } from "../drizzle/schema";
import { userUpdateSchema } from "./userUpdateSchema";

export const getUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getUsersService();
    if (users == null || users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    } else {
      res.status(200).json(users);
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const user = await getUserByIdService(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    } else {
      res.status(200).json(user);
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const userData: TUserInsert = req.body;
    if (
      !userData.email ||
      !userData.password ||
      !userData.firstName ||
      !userData.lastName
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    // A018676019Z
    const newUser = await createUserService(userData);
    res.status(201).json(newUser);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
       res.status(400).json({ message: "Invalid user ID" });
       return;
    }

    // Parse and validate request body
    const parsed = userUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
       res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const filteredData = parsed.data;

    const updatedUser = await updateUserService(userId, filteredData);
    if (!updatedUser) {
       res.status(404).json({ message: "User not found" });
       return;
    }

     res.status(200).json(updatedUser);
      return;
  } catch (error: any) {
    console.error("Update user error:", error);
    
    if (error.code === '23505') {
       res.status(409).json({
        message: "Email already exists",
        error: "email_taken",
      });
      return;

    }

     res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
      return;

  }
};

// export const updateUserController = async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.id);
//     if (isNaN(userId)) {
//       res.status(400).json({ message: "Invalid user ID" });
//       return;
//     }

//     const userData: Partial<TUserInsert> = req.body;
//     if (Object.keys(userData).length === 0) {
//       res.status(400).json({ message: "No data provided for update" });
//       return;
//     }

//     const updatedUser = await updateUserService(userId, userData);
//     if (!updatedUser) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     } else {
//       res.status(200).json(updatedUser);
//     }
//   } catch (error: any) {
//     res.status(500).json({
//       message: "Failed to update user",
//       error: error.message,
//     });
//   }
// };

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const deletedUser = await deleteUserService(userId);
    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    } else {
      res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
