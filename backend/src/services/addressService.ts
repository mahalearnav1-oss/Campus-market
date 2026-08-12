import { addressRepository } from '../repositories/addressRepository';
import { CreateAddressInput, UpdateAddressInput } from '../validators/userValidators';

export class AddressService {
  async getUserAddresses(userId: string) {
    return addressRepository.findByUserId(userId);
  }

  async createAddress(userId: string, input: CreateAddressInput) {
    return addressRepository.createAddress(userId, input);
  }

  async updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
    const existing = await addressRepository.findById(addressId);
    if (!existing) {
      const error: any = new Error('Address not found.');
      error.statusCode = 404;
      error.code = 'ADDRESS_NOT_FOUND';
      throw error;
    }

    if (existing.userId !== userId) {
      const error: any = new Error('You are not authorized to modify this address.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return addressRepository.updateAddress(addressId, userId, input);
  }

  async deleteAddress(addressId: string, userId: string) {
    const existing = await addressRepository.findById(addressId);
    if (!existing) {
      const error: any = new Error('Address not found.');
      error.statusCode = 404;
      error.code = 'ADDRESS_NOT_FOUND';
      throw error;
    }

    if (existing.userId !== userId) {
      const error: any = new Error('You are not authorized to delete this address.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return addressRepository.deleteAddress(addressId, userId);
  }
}

export const addressService = new AddressService();
