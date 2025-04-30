import React, {useEffect} from 'react';
import AppNavigator from './src/components/AppNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {
  initTransactionsTable,
  initCategoriesTable,
  initNotificationsTable,
  initOpeningBalanceTable,
} from './database';
import Toast from 'react-native-toast-message';
import {TransactionProvider} from './src/components/TransactionContext';
import {CurrencyProvider} from './src/components/CurrencyContext';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {PermissionsAndroid, Platform} from 'react-native';

const App = () => {
  useEffect(() => {
    async function requestNotificationPermission() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
    }

    async function requestPermissions() {
      // For Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (!hasPermission) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }
      }

      // Notifee's internal permission handling (works for iOS and older Android)
      await notifee.requestPermission();
    }

    async function createNotificationChannel() {
      try {
        const channelId = await notifee.createChannel({
          id: 'budget-alerts',
          name: 'Budget Exceed Alerts',
          importance: AndroidImportance.HIGH,
          vibration: true,
        });
      } catch (error) {
        console.error('Channel creation failed:', error);
      }
    }

    const initializeDatabase = async () => {
      try {
        await initCategoriesTable();
        await Promise.all([
          initTransactionsTable(),
          initNotificationsTable(),
          initOpeningBalanceTable(),
        ]);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
    requestPermissions();
    createNotificationChannel();
    requestNotificationPermission();
  }, []);
  return (
    <GestureHandlerRootView>
      <PaperProvider>
        <TransactionProvider>
          <CurrencyProvider>
            <AppNavigator />
            <Toast />
          </CurrencyProvider>
        </TransactionProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;
