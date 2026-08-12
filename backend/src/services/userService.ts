import { userRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { UpdateProfileInput, ChangePasswordInput } from '../validators/authValidators';
import { logAuditEvent } from '../utils/auditLogger';

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput, ipAddress?: string) {
    const updated = await userRepository.updateProfile(userId, input);
    await logAuditEvent('USER_PROFILE_UPDATE', 'User', userId, userId, { updatedFields: Object.keys(input) }, ipAddress);
    return updated;
  }

  async changePassword(userId: string, input: ChangePasswordInput, ipAddress?: string) {
    const user = await userRepository.findById(userId);
    if (!user || !user.passwordHash) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Current password specified is incorrect.');
      error.statusCode = 400;
      error.code = 'INVALID_CURRENT_PASSWORD';
      throw error;
    }

    const newHashedPassword = await hashPassword(input.newPassword);
    await userRepository.updatePassword(userId, newHashedPassword);

    await logAuditEvent('PASSWORD_CHANGE', 'User', userId, userId, {}, ipAddress);
  }
}

export const userService = new UserService();
