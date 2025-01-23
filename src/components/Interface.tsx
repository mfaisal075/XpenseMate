export interface Categories {
    id: number;
    name: string;
    type: 'income' | 'expense';
    description: string;
}

export interface Transaction {
    id: number;
    amount: number;
    category: string;
    description: string;
    date: string;
    type: string; // Added to differentiate transactions
}
