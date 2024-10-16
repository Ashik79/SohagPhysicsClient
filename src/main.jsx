import React, { Children } from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from './components/Root';
import Provider from './Provider';
import Home from './components/Home';

import Login from './components/Login';
import PrivateRoute from './PrivateRoute';
import Admission from './components/Admission';
import Payment from './components/Payment';
import AddUsers from './components/AddUsers';
import AddPayment from './components/AddPayment';
import NotFound from './components/NotFound';
import Students from './components/Students';
import StudentDetails from './components/StudentDetails';
import UpdateStudent from './components/UpdateStudent';
import PaymentComponent from './components/PaymentOverview';
import Attendance from './components/Attendance';
import TakeAttendance from './components/TakeAttendance';
import Exams from './components/Exams';
import Exam from './components/Exam';
import Message from './components/Message';
import Download from './components/Download';
import ProgramEntry from './components/ProgramEntry';
import Programs from './components/Programs';
import Coupons from './components/Coupons';


const fetchStudent = async ({ params }) => {
  const response = await fetch(`https://spoffice-server.vercel.app/student/${params.id}`);
  
  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'Student not found' }), {
      status: 404,
    });
  }

  const student = await response.json();
  return student;
};


const fetchUsers = async () => {
  const response = await fetch(`https://spoffice-server.vercel.app/getusers`);
  
  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'users not found' }), {
      status: 404,
    });
  }

  const users = await response.json();
  return users;
};


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement:<NotFound></NotFound>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      }
      ,
      {
        path:'/login',
        element:<Login></Login>
      }
      ,
      {
        path:'/register',
        element:<PrivateRoute><Admission></Admission></PrivateRoute>
      }
      ,
     
      {
        path:'/adduser',
        element:<PrivateRoute><AddUsers></AddUsers></PrivateRoute>
      }
      ,
      {
        path:'/payment',
        element:<PrivateRoute><Payment></Payment></PrivateRoute>
      }
      ,
      {
        path:'/programentry',
        element:<PrivateRoute><Programs></Programs></PrivateRoute>
      }
      ,
      {
        path:'/finder',
        element:<PrivateRoute><Students></Students></PrivateRoute>
      }
      ,
      {
        path:'/payment/:id',
        element:<PrivateRoute><AddPayment></AddPayment></PrivateRoute>,
        loader:fetchStudent,
      }
      ,
      {
        path:'/programentry/:id',
        element:<PrivateRoute><ProgramEntry></ProgramEntry></PrivateRoute>,
        loader:fetchStudent,
      }
      ,
      {
        path:'/students/:id',
        element:<PrivateRoute><StudentDetails></StudentDetails></PrivateRoute>,
        loader:fetchStudent,
      }
      ,
      {
        path:'/overview',
        element:<PrivateRoute><PaymentComponent></PaymentComponent></PrivateRoute>,
        loader:fetchUsers,
        
      }
      ,
      {
        path:'/student/update/:id',
        element:<PrivateRoute><UpdateStudent></UpdateStudent></PrivateRoute>,
        loader:fetchStudent,
      }
      ,
      {
        path:'/attendance/:id',
        element:<PrivateRoute><TakeAttendance></TakeAttendance></PrivateRoute>,
        loader:fetchStudent,
      }
      ,
      {
        path:'/attendance',
        element:<PrivateRoute><Attendance></Attendance></PrivateRoute>,
        loader:() =>fetch ('https://spoffice-server.vercel.app/students')
        
      },
      {
        path:'/exams',
        element:<PrivateRoute><Exams></Exams></PrivateRoute>,
        loader:()=>fetch('https://spoffice-server.vercel.app/getexams')
        
      },
      {
        path:'/coupons',
        element:<PrivateRoute><Coupons></Coupons></PrivateRoute>,
        loader:()=>fetch('https://spoffice-server.vercel.app/getcoupons')
        
      },
      {
        path:'/message',
        element:<PrivateRoute><Message></Message></PrivateRoute>,
            
      },
      {
        path:'/download',
        element:<PrivateRoute><Download></Download></PrivateRoute>,
            
      },
      {
        path:'/exam/:id',
        element:<PrivateRoute><Exam></Exam></PrivateRoute>,
        loader:({params})=>fetch(`https://spoffice-server.vercel.app/getexam/${params.id}`)
        
      }
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <Provider><RouterProvider router={router} /></Provider>
  </React.StrictMode>,
)
