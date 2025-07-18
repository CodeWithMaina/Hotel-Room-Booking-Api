import db from "../drizzle/db";
import { and, eq } from "drizzle-orm";
import { addresses } from "../drizzle/schema";
import { TAddressInsert, TAddressSelect } from "../drizzle/schema";
import { TAddressEntity } from "../types/entityTypes";

interface TEntyAddress {
      street: string,
      city: string,
      state: string | null,
      postalCode: string,
      country: string,
    }

export const getAddressesService = async (): Promise<TAddressSelect[]> => {
  return await db.query.addresses.findMany({});
};

export const getAddressByIdService = async (
  addressId: number
): Promise<TAddressSelect | null> => {
  const result = await db.query.addresses.findFirst({
    where: eq(addresses.addressId, addressId),
  });
  return result || null;
};

export const createAddressService = async (
  addressData: TAddressInsert
): Promise<TAddressSelect> => {
  const result = await db.insert(addresses).values(addressData).returning();
  return result[0];
};

export const updateAddressService = async (
  addressId: number,
  addressData: Partial<TAddressInsert>
): Promise<TAddressSelect | null> => {
  const result = await db
    .update(addresses)
    .set(addressData)
    .where(eq(addresses.addressId, addressId))
    .returning();

  return result[0] || null;
};

export const deleteAddressService = async (
  addressId: number
): Promise<TAddressSelect | null> => {
  const result = await db
    .delete(addresses)
    .where(eq(addresses.addressId, addressId))
    .returning();

  return result[0] || null;
};

// Get address for either hotel or user
export const getEntityAddressService = async (entityId: number, entityType: TAddressEntity ): Promise<TEntyAddress[]> => {
  return await db.query.addresses.findMany({
    where: and(
      eq(addresses.entityId, entityId),
      eq(addresses.entityType, entityType)
    ),
    columns:{
      addressId: true,
      street: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    }
  });
};
