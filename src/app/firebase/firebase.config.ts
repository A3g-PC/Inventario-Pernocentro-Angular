import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBI9MguwXzhKn4d-og-v8AYpbV9Qgprj8s",
  authDomain: "pernocentro-inventario-angular.firebaseapp.com",
  projectId: "pernocentro-inventario-angular",
  storageBucket: "pernocentro-inventario-angular.firebasestorage.app",
  messagingSenderId: "415154595870",
  appId: "1:415154595870:web:977631599a49ca612de60f"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);