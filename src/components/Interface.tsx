export interface Categories {
  id: number;
  name: string;
  type: string;
  description: string;
  budget: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}
