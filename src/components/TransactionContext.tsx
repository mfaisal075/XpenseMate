import {useContext, useEffect, useState} from 'react';
import {openDatabase} from '../../database';
import {Transaction, Categories} from '../components/Interface';
import React from 'react';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import {Alert} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

interface DataContextProps {
  transactions: Transaction[];
  categories: Categories[];
  incomeCategories: Categories[];
  expenseCategories: Categories[];
  fetchTransactions: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  exportToExcel: () => Promise<void>;
  importDataFromExcel: () => Promise<void>;
}

export const TransactionContext = React.createContext<
  DataContextProps | undefined
>(undefined);

export const TransactionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Categories[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Categories[]>([]);

  const exportDataToExcel = async () => {
    try {
      // Prepare Transactions sheet
      const exportTransactions = transactions.map(tx => ({
        ID: tx.id,
        Amount: tx.amount,
        Type: tx.type,
        Category: tx.category,
        Description: tx.description,
        Date: tx.date,
        UpdatedAt: tx.updated_at,
        CreatedAt: tx.created_at,
      }));
      const transactionSheet = XLSX.utils.json_to_sheet(exportTransactions);

      // Prepare Categories sheet
      const exportCategories = categories.map(cat => ({
        ID: cat.id,
        Name: cat.name,
        Type: cat.type,
        Image: cat.image,
        Budget: cat.budget,
        CreatedAt: cat.created_at,
        UpdatedAt: cat.updated_at,
      }));
      const categorySheet = XLSX.utils.json_to_sheet(exportCategories);

      // Create workbook and append both sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, transactionSheet, 'Transactions');
      XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');

      const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
      const path = `${
        RNFS.DownloadDirectoryPath
      }/FinanceData_${Date.now()}.xlsx`;

      await RNFS.writeFile(path, wbout, 'ascii');
      console.log('Exported to', path);
      Alert.alert(`Data exported to:\n${path}`);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Failed to export data.');
    }
  };

  const importDataFromExcel = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const fileContents = await RNFS.readFile(res[0].uri, 'base64');
      const workbook = XLSX.read(fileContents, {type: 'base64'});

      const db = await openDatabase();

      db.transaction(
        tx => {
          const categorySheet = workbook.Sheets['Categories'];
          if (categorySheet) {
            const categoryData: any[] = XLSX.utils.sheet_to_json(categorySheet);

            categoryData.forEach(item => {
              tx.executeSql(
                `INSERT OR IGNORE INTO categories (id, name, type, image, budget, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.ID,
                  item.Name,
                  item.Type,
                  item.Image ?? null,
                  item.Budget,
                  item.CreatedAt ?? new Date().toISOString(),
                  item.UpdatedAt ?? new Date().toISOString(),
                ],
              );
            });
          }

          // 2. Import Transactions (from "Transactions" sheet)
          const transactionSheet = workbook.Sheets['Transactions'];
          if (transactionSheet) {
            const transactionData: any[] =
              XLSX.utils.sheet_to_json(transactionSheet);

            transactionData.forEach(item => {
              tx.executeSql(
                `INSERT OR IGNORE INTO transactions (id, amount, categoryType, category, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.ID,
                  item.Amount,
                  item.Type,
                  item.Category,
                  item.Description,
                  item.CreatedAt ?? new Date().toISOString(),
                  item.UpdatedAt ?? new Date().toISOString(),
                ],
              );
            });
          }
        },
        error => {
          console.error('Transaction error while importing:', error);
          Alert.alert('Failed to import data.');
        },
        () => {
          fetchTransactions();
          fetchCategories();
          Alert.alert('Data imported successfully!');
        },
      );
    } catch (err) {
      if (
        err instanceof Error &&
        err.message !== 'User canceled document picker'
      ) {
        console.error('Import error:', err);
        Alert.alert('Failed to import data.');
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const db = await openDatabase();
      db.transaction(tx => {
        tx.executeSql(
          `SELECT 
            t.id, 
            t.amount, 
            t.categoryType AS type, 
            t.category, 
            t.description, 
            t.date AS date,
            t.status AS status,
            t.created_at AS created_at,
            t.updated_at AS updated_at, 
            c.image AS categoryImage 
          FROM transactions t
          LEFT JOIN categories c ON t.category = c.name
          WHERE t.status = 'Y'
          ORDER BY t.id DESC`,
          [],
          (_, results) => {
            const transactionsData = [];
            for (let i = 0; i < results.rows.length; i++) {
              transactionsData.push(results.rows.item(i));
            }
            setTransactions(transactionsData);
          },
          (_, error) => console.error('Error fetching transactions:', error),
        );
      });
    } catch (error) {
      console.error('Error fetching transactions from SQLite:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const db = await openDatabase();
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM categories WHERE status = 'Y' ORDER BY id DESC`,
          [],
          (_, results) => {
            const allCategories: Categories[] = [];
            const incomeData: Categories[] = [];
            const expenseData: Categories[] = [];

            for (let i = 0; i < results.rows.length; i++) {
              const category = results.rows.item(i);
              allCategories.push(category);

              if (category.type?.toLowerCase() === 'income') {
                incomeData.push(category);
              } else if (category.type?.toLowerCase() === 'expense') {
                expenseData.push(category);
              }
            }

            setCategories(allCategories);
            setIncomeCategories(incomeData);
            setExpenseCategories(expenseData);
          },
          (_, error) => console.error('Error fetching categories:', error),
        );
      });
    } catch (error) {
      console.error('Error fetching categories from SQLite:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        incomeCategories,
        expenseCategories,
        fetchTransactions,
        fetchCategories,
        exportToExcel: exportDataToExcel,
        importDataFromExcel,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      'useTransactionContext must be used within a TransactionProvider',
    );
  }
  return context;
};
