import { prisma } from '../config/prisma';
import { UpdatePreferencesInput } from '../validators/userValidators';

export class PreferencesRepository {
  async findByUserId(userId: string) {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: { userId },
      });
    }
    return preferences;
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    return prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        emailNotifications: input.emailNotifications ?? true,
        pushNotifications: input.pushNotifications ?? true,
        smsNotifications: input.smsNotifications ?? false,
      },
      update: {
        ...(input.emailNotifications !== undefined ? { emailNotifications: input.emailNotifications } : {}),
        ...(input.pushNotifications !== undefined ? { pushNotifications: input.pushNotifications } : {}),
        ...(input.smsNotifications !== undefined ? { smsNotifications: input.smsNotifications } : {}),
      },
    });
  }
}

export const preferencesRepository = new PreferencesRepository();
