import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdTGx098oNGpVnGcdLFRJUtPH4gr0Bsb0",
  authDomain: "mainframe-mentor-31163.firebaseapp.com",
  projectId: "mainframe-mentor-31163",
  storageBucket: "mainframe-mentor-31163.firebasestorage.app",
  messagingSenderId: "241391085489",
  appId: "1:241391085489:web:c4c1cc467ac56e3d727f90"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);