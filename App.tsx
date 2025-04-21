import React, {useEffect} from 'react';
import AppNavigator from './src/components/AppNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {initTransactionsTable, initCategoriesTable} from './database';
import Toast from 'react-native-toast-message';
import {TransactionProvider} from './src/components/TransactionContext';
import {CurrencyProvider} from './src/components/CurrencyContext';

const App = () => {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initTransactionsTable();
        await initCategoriesTable();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
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
