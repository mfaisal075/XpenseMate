import {openDatabase} from '../../database';
import notifee from '@notifee/react-native';
import {SettingsService} from '../components/databaseService';

const getCurrentMonthExpenses = async (categoryName: string) => {
  const db = await openDatabase();
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  try {
    const [result] = await db.executeSql(
      `SELECT SUM(amount) AS total 
                 FROM transactions 
                 WHERE category = ?
                 AND strftime('%m', date) = ? 
                 AND strftime('%Y', date) = ? 
                 AND categoryType = 'expense'
                 AND status = 'Y'`,
      [categoryName, month.toString().padStart(2, '0'), year.toString()],
    );

    const total = result.rows.item(0).total || 0;
    return total;
  } catch (error) {
    console.log('Error calculating expenses:', error);
    return 0;
  }
};

const checkBudgetExceed = async (
  categoryName: string,
  currencySymbol: string,
) => {
  try {
    // Check if notifications are enabled
    const notificationsEnabled = await SettingsService.getNotificationSetting();
    if (!notificationsEnabled) return;

    const db = await openDatabase();
    const [categoryResult] = await db.executeSql(
      `SELECT budget FROM categories 
       WHERE name = ? AND type = 'Expense'`,
      [categoryName],
    );

    // Check if category exists
    if (categoryResult.rows.length === 0) {
      console.log('Category not found or not an expense type');
      return;
    }

    const categoryData = categoryResult.rows.item(0);

    const budget = parseFloat(categoryData.budget);
    if (isNaN(budget)) {
      console.error('Invalid budget value:', categoryData.budget);
      return;
    }

    const totalExpenses = await getCurrentMonthExpenses(categoryName);
    console.log('Total expenses:', totalExpenses);

    if (totalExpenses > budget) {
      try {
        const db = await openDatabase();
        const notificationMessage = `You have exceeded your budget for ${categoryName} by ${currencySymbol} ${(
          totalExpenses - budget
        ).toFixed(2)}`;

        // Store in database
        await db.executeSql(
          `INSERT INTO notifications 
            (title, message, categoryId, readStatus) 
            VALUES (?, ?, ?, ?)`,
          [
            'Budget Alert', // title
            notificationMessage, // message
            categoryData.id, // categoryId (make sure to select this in your query)
            0, // readStatus (0 = unread)
          ],
        );

        // Show notification
        await notifee.displayNotification({
          title: 'Budget Alert',
          body: notificationMessage,
          android: {
            channelId: 'budget-alerts',
            importance: 4,
            pressAction: {id: 'default'},
          },
        });
      } catch (error) {
        console.log('Failed to save notification:', error);
      }
    }
  } catch (error) {
    console.log('Budget check failed:', error);
  }
};

export default checkBudgetExceed;
