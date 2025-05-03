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

const initOpeningBalanceTable = async () => {
  try {
    const db = await openDatabase();
    await db.transaction(async tx => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS opening_balance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    amount TEXT NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                    )`,
      );
    });
  } catch (error) {
    console.log('Error creating opening balance table', error);
    throw error;
  }
};

const initSettingsTable = async () => {
  try {
    const db = await openDatabase();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_name TEXT UNIQUE,
        setting_value TEXT
      );
    `);
    console.log('Settings table initialized');
  } catch (error) {
    console.error('Error initializing settings table:', error);
    throw error;
  }
};

const initMonthlyBudgetTable = async () => {
  try {
    const db = await openDatabase();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS monthly_budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        budget REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    console.log('Monthly budget table initialized');
  } catch (error) {
    console.error('Error initializing monthly budget table:', error);
    throw error;
  }
};

export {
  openDatabase,
  initTransactionsTable,
  initCategoriesTable,
  initNotificationsTable,
  initOpeningBalanceTable,
  initSettingsTable,
  initMonthlyBudgetTable,
};
