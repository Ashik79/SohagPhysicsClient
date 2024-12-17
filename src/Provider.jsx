import React, { useEffect, useState, createContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import auth from '../firebase.config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

export const AuthContext = createContext(null);

function Provider({ children }) {
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().getDate());

 

  const getMonth = (m) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[m - 1];
  }

  const login = (email, pass) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const [loading, setloading] = useState(true);
  const [user, setUser] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [loggedPhoto, setLoggedPhoto] = useState('profile.jpg');
  const [role, setRole] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loggedEmail, setLoggedEmail] = useState(null);

  const logout = () => {
    setloading(false);
    localStorage.removeItem("loggedPhoto");
    localStorage.removeItem("loggedUser");
    return signOut(auth);
  }

  useEffect(() => {
    const storedPhoto = localStorage.getItem("loggedPhoto");
    const storedUser = localStorage.getItem("loggedUser");
    if (storedPhoto) {
      setLoggedPhoto(storedPhoto);
    }
    if (storedUser) {
      setLoggedUser(storedUser);
    }

    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoggedEmail(currentUser?.email);
      setloading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loggedEmail) {
      fetch(`https://spoffice-server.vercel.app/getuser/${loggedEmail}`)
        .then(res => res.json())
        .then(data => {
          
          setRole(data.role);
          setStaff(data)
        
          localStorage.setItem("loggedPhoto", data.photo);
          localStorage.setItem("loggedUser", data.name);
        })
        .catch(error => {
          notifyFailed("Failed to connect with server");
        });
    }
  }, [loggedEmail]);

  const notifySuccess = (message) => {
    toast.success(message);
  }

  const notifyFailed = (message) => {
    toast.error(message);
  }
console.log(role)
  const providerInfo = {
    login,
    user,
    setUser,
    auth,
    loading,
    setloading,
    logout,
    loggedUser,
    role,
    staff,
    month,
    year,
    date,
    getMonth,
    notifySuccess,
    notifyFailed,
    loggedPhoto
  };

  return (
    <AuthContext.Provider value={providerInfo}>
      {children}
      <ToastContainer />
    </AuthContext.Provider>
  );
}

export default Provider;
