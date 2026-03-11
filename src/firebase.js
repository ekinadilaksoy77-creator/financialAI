import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7ObN1jfY5zmKTqnjiqCsK_V2QCjupgAk",
  authDomain: "spendsmart-78612.firebaseapp.com",
  projectId: "spendsmart-78612",
  storageBucket: "spendsmart-78612.firebasestorage.app",
  messagingSenderId: "375121104630",
  appId: "1:375121104630:web:4ea44bf27a9ef8437aa6d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);