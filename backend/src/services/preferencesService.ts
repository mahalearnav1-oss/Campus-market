import { preferencesRepository } from '../repositories/preferencesRepository';
import { UpdatePreferencesInput } from '../validators/userValidators';

export class PreferencesService {
  async getUserPreferences(userId: string) {
    return preferencesRepository.findByUserId(userId);
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    return preferencesRepository.updatePreferences(userId, input);
  }
}

export const preferencesService = new PreferencesService();
