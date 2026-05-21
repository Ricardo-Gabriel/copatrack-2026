import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciais reais do projeto do usuário
const firebaseConfig = {
  apiKey: "AIzaSyBOc7APCKlHsg63nj36WTHLF_NRmtOTGLI",
  authDomain: "copatrack-2026.firebaseapp.com",
  projectId: "copatrack-2026",
  storageBucket: "copatrack-2026.firebasestorage.app",
  messagingSenderId: "608559116906",
  appId: "1:608559116906:web:cd18b09bb5baf8bdc4d013",
  measurementId: "G-8LMS1W1DWV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
