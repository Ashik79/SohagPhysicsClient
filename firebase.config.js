import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwltdIw9Jswhx3dbw0_pnpqpwNpRwKcVM",
  authDomain: "sohagphysics2.firebaseapp.com",
  projectId: "sohagphysics2",
  storageBucket: "sohagphysics2.appspot.com",
  messagingSenderId: "568806338937",
  appId: "1:568806338937:web:655e564a85f1939323bfa8"
};
const app = initializeApp(firebaseConfig);
const auth =getAuth(app);
export default auth;