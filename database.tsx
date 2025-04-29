import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabase({
      name: 'XpenseTracker.db',
      location: 'default',
    });
    return db;
  } catch (error) {
    console.log('Error in opening database', error);
    throw error;
  }
};

const initTransactionsTable = async () => {
  const db = await openDatabase();
  try {
    await db.transaction(async tx => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    amount REAL NOT NULL,
                    categoryType TEXT NOT NULL,
                    category TEXT NOT NULL,
                    description TEXT NOT NULL,
                    status TEXT NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                    )`,
      );
    });
  } catch (error) {
    console.log('Error in creating expense table', error);
    throw error;
  }
};

const initCategoriesTable = async () => {
  const db = await openDatabase();
  try {
    await db.transaction(async tx => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    budget TEXT,
                    description TEXT,
                    image TEXT,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                    )`,
      );
    });
  } catch (error) {
    console.log('Error in creating categories table', error);
    throw error;
  }
};

const initNotificationsTable = async () => {
  const db = await openDatabase();
  try {
    await db.transaction(async tx => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            readStatus BOOLEAN DEFAULT 0,
            categoryId INTEGER,
            FOREIGN KEY(categoryId) REFERENCES categories(id)
          )`,
      );
    });
  } catch (error) {
    console.log('Error creating notifications table', error);
    throw error;
  }
};

export {
  openDatabase,
  initTransactionsTable,
  initCategoriesTable,
  initNotificationsTable,
};
