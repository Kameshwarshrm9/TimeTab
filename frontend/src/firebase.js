import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBl_aOLSq_Nl5yEy-d8gObEDfLCrewd2Ig",
  authDomain: "timetable-generation-c24a9.firebaseapp.com",
  projectId: "timetable-generation-c24a9",
  storageBucket: "timetable-generation-c24a9.firebasestorage.app",
  messagingSenderId: "105808855394",
  appId: "1:105808855394:web:6ebaf395bd92e3be236c3b",
  measurementId: "G-NBNEJN2Q1B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);