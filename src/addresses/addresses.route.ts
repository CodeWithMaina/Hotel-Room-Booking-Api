import { Router } from "express";
import { 
  createAddressController, 
  deleteAddressController, 
  getAddressByIdController, 
  getAddressesController, 
  updateAddressController 
} from "./addresses.controller";

export const addressRouter = Router();

addressRouter.get('/addresses', getAddressesController);
addressRouter.get("/address/:id", getAddressByIdController);
addressRouter.post("/address", createAddressController);
addressRouter.put("/address/:id", updateAddressController);
addressRouter.delete("/address/:id", deleteAddressController);