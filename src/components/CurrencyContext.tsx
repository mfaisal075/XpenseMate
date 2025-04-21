import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  getCurrencySymbol: () => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  getCurrencySymbol: () => '$',
});

export const CurrencyProvider = ({children}: {children: React.ReactNode}) => {
  const [currency, setCurrency] = useState('PKR');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved currency on initial mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('@currency');
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } catch (error) {
        console.log('Error loading currency:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCurrency();
  }, []);

  // Save currency whenever it changes
  useEffect(() => {
    const saveCurrency = async () => {
      if (isLoaded) {
        try {
          await AsyncStorage.setItem('@currency', currency);
        } catch (error) {
          console.log('Error saving currency:', error);
        }
      }
    };

    saveCurrency();
  }, [currency, isLoaded]);

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'INR':
        return '₹';
      case 'PKR':
        return 'Rs.';
      default:
        return '$';
    }
  };

  return (
    <CurrencyContext.Provider
      value={{currency, setCurrency, getCurrencySymbol}}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
