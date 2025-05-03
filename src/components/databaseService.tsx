import {openDatabase} from '../../database';

export const SettingsService = {
  getNotificationSetting: async () => {
    const db = await openDatabase();
    try {
      const [result] = await db.executeSql(
        `SELECT setting_value FROM settings WHERE setting_name = 'notifications_enabled'`,
      );
      return result.rows.length > 0
        ? result.rows.item(0).setting_value === '1'
        : false;
    } catch (error) {
      console.error('Error getting notification setting:', error);
      return false;
    }
  },

  setNotificationSetting: async (enabled: boolean) => {
    const db = await openDatabase();
    try {
      await db.executeSql(
        `INSERT OR REPLACE INTO settings (setting_name, setting_value)
         VALUES ('notifications_enabled', ?)`,
        [enabled ? '1' : '0'],
      );
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  },
};
