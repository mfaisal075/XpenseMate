import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBnlYvnpK0SgvKB9OO6xfhE8Q71hAxWgz8',
  authDomain: 'xpensemate-4e4a5.firebaseapp.com',
  projectId: 'xpensemate-4e4a5',
  storageBucket: 'xpensemate-4e4a5.firebasestorage.app',
  messagingSenderId: '304468207193',
  appId: '1:304468207193:web:529a6d294571cc568f7348',
  measurementId: 'G-8DX3F44PJN',
};

const app = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(app);
export const FIRESTORE_DB = getFirestore(app);
export const FIREBASE_STORAGE = getStorage(app);
