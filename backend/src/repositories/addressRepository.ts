import { prisma } from '../config/prisma';
import { CreateAddressInput, UpdateAddressInput } from '../validators/userValidators';

export class AddressRepository {
  async findByUserId(userId: string) {
    return prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(addressId: string) {
    return prisma.userAddress.findUnique({
      where: { id: addressId },
    });
  }

  async createAddress(userId: string, input: CreateAddressInput) {
    return prisma.$transaction(async (tx) => {
      // Check if user has any existing addresses
      const existingAddresses = await tx.userAddress.findMany({ where: { userId } });
      const isFirstAddress = existingAddresses.length === 0;
      const setAsDefault = input.isDefault || isFirstAddress;

      if (setAsDefault) {
        // Clear previous default address flag
        await tx.userAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await tx.userAddress.create({
        data: {
          userId,
          label: input.label,
          recipientName: input.recipientName,
          phone: input.phone,
          streetAddress: input.streetAddress,
          dormOrBuilding: input.dormOrBuilding || null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          isDefault: setAsDefault,
        },
      });

      return address;
    });
  }

  async updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updated = await tx.userAddress.update({
        where: { id: addressId },
        data: {
          ...(input.label ? { label: input.label } : {}),
          ...(input.recipientName ? { recipientName: input.recipientName } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.streetAddress ? { streetAddress: input.streetAddress } : {}),
          ...(input.dormOrBuilding !== undefined ? { dormOrBuilding: input.dormOrBuilding } : {}),
          ...(input.city ? { city: input.city } : {}),
          ...(input.state ? { state: input.state } : {}),
          ...(input.postalCode ? { postalCode: input.postalCode } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
      });

      return updated;
    });
  }

  async deleteAddress(addressId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const address = await tx.userAddress.findUnique({ where: { id: addressId } });
      if (!address) return null;

      await tx.userAddress.delete({ where: { id: addressId } });

      // If deleted address was default, set the latest remaining address as default
      if (address.isDefault) {
        const remaining = await tx.userAddress.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (remaining) {
          await tx.userAddress.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }

      return address;
    });
  }
}

export const addressRepository = new AddressRepository();
