import { useContext, useEffect, useState } from "react";
import { openDatabase } from "../../database";
import { Transaction, Categories } from "../components/Interface";
import React from "react";

interface DataContextProps {
    transactions: Transaction[];
    categories: Categories[];
    incomeCategories: Categories[];
    expenseCategories: Categories[];
    fetchTransactions: () => Promise<void>;
    fetchCategories: () => Promise<void>;
}

export const TransactionContext = React.createContext<DataContextProps | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [incomeCategories, setIncomeCategories] = useState<Categories[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<Categories[]>([]);

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
            t.created_at AS date,
            t.updated_at AS updated_at, 
            c.image AS categoryImage 
          FROM transactions t
          LEFT JOIN categories c ON t.category = c.name
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
                    `SELECT * FROM categories ORDER BY id DESC`,
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
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactionContext = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactionContext must be used within a TransactionProvider');
    }
    return context;
};
