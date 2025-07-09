import { Request, Response } from "express";
import {
  getAddressesService,
  getAddressByIdService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  getEntityAddressService,
} from "./addresses.service";
import { TAddressInsert, TAddressSelect } from "../drizzle/schema";
import { TAddressEntity } from "../types/entityTypes";

export const getAddressesController = async (req: Request, res: Response) => {
  try {
    const addresses = await getAddressesService();
    if (addresses == null || addresses.length === 0) {
      res.status(404).json({ message: "No addresses found" });
      return;
    }
    res.status(200).json({ Addresses: addresses });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};

export const getAddressByIdController = async (req: Request, res: Response) => {
  try {
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      res.status(400).json({ message: "Invalid address ID" });
      return;
    }

    const address = await getAddressByIdService(addressId);
    if (!address) {
      res.status(404).json({ message: "Address not found" });
      return;
    }
    res.status(200).json(address);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch address",
      error: error.message,
    });
  }
};

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const addressData: TAddressInsert = req.body;
    if (
      !addressData.entityId ||
      !addressData.entityType ||
      !addressData.street ||
      !addressData.city ||
      !addressData.postalCode ||
      !addressData.country
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newAddress = await createAddressService(addressData);
    res.status(201).json(newAddress);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create address",
      error: error.message,
    });
  }
};

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      res.status(400).json({ message: "Invalid address ID" });
      return;
    }

    const addressData: Partial<TAddressInsert> = req.body;
    if (Object.keys(addressData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedAddress = await updateAddressService(addressId, addressData);
    if (!updatedAddress) {
      res.status(404).json({ message: "Address not found" });
      return;
    }
    res.status(200).json(updatedAddress);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update address",
      error: error.message,
    });
  }
};

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      res.status(400).json({ message: "Invalid address ID" });
      return;
    }

    const deletedAddress = await deleteAddressService(addressId);
    if (!deletedAddress) {
      res.status(404).json({ message: "Address not found" });
      return;
    }
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

export const getEntityAddressController = async (
  req: Request,
  res: Response
) => {
  try {
    const { entityId, entityType } = req.params;

    const parsedEntityId = parseInt(entityId, 10);
    if (isNaN(parsedEntityId)) {
      res.status(400).json({ error: "entityId must be a valid number" });
      return;
    }

    if (entityType !== "hotel" && entityType !== "user") {
      res
        .status(400)
        .json({ error: 'entityType must be either "hotel" or "user"' });
      return;
    }

    const addresses = await getEntityAddressService(
      parsedEntityId,
      entityType as TAddressEntity
    );

    res.status(200).json(addresses);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch address",
      error: error.message,
    });
  }
};
