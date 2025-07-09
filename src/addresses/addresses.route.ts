import { Router } from "express";
import { 
  createAddressController, 
  deleteAddressController, 
  getAddressByIdController, 
  getAddressesController, 
  getEntityAddressController, 
  updateAddressController 
} from "./addresses.controller";

export const addressRouter = Router();

addressRouter.get('/addresses', getAddressesController);
addressRouter.get("/address/:id", getAddressByIdController);
addressRouter.post("/address", createAddressController);
addressRouter.put("/address/:id", updateAddressController);
addressRouter.delete("/address/:id", deleteAddressController);
addressRouter.get('/address/:entityType/:entityId', getEntityAddressController);