import API_URL from './apiConfig';
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
import TakeAttendance from './components/TakeAttendance';
import Exams from './components/Exams';
import Exam from './components/Exam';
import Message from './components/Message';

import ProgramEntry from './components/ProgramEntry';
import Programs from './components/Programs';
import Coupons from './components/Coupons';

import Note from './components/Note';
import EditNote from './components/EditNote';
import StudentOverview from './components/StudentOverview';
import Batch from './components/Batch';
import PrintReceipt from './components/PrintReceipt';
import MyEntry from './components/StuffPart/MyEntry';
import Monitor from './components/StuffPart/Monitor';
import AttendanceBatch from './components/AttendanceBatch';

import Staffs from './components/StuffPart/Staffs';
import StaffDetails from './components/StuffPart/StaffDetails';
import EditorDashboard from './components/StudentSite/EditorDashboard';
import VideoManager from './components/StudentSite/VideoManager';
import VideoLibrary from './components/StudentSite/VideoLibrary';

import DownloadCenter from './components/Download/DownloadCenter';
import ManagementContainer from './components/UserManagement/ManagementContainer';
import User from './components/UserManagement/User';
import TakeAttendanceId from './components/TakeAttendanceId';






const fetchStudent = async ({ params }) => {
  const response = await fetch(`${API_URL}/student/${params.id}`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'Student not found' }), {
      status: 404,
    });
  }

  const student = await response.json();
  return student;
};
const fetchStaff = async ({ params }) => {
  const response = await fetch(`${API_URL}/staff/${params.id}`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'Staff not found' }), {
      status: 404,
    });
  }

  const staff = await response.json();
  return staff;
};


const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/getusers`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'users not found' }), {
      status: 404,
    });
  }

  const users = await response.json();
  return users;
};
const fetchUsersFull = async () => {
  const response = await fetch(`${API_URL}/getusersfull`);

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
    errorElement: <NotFound></NotFound>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      }
      ,
      {
        path: '/login',
        element: <Login></Login>
      }
      ,
      {
        path: '/register',
        element: <PrivateRoute><Admission></Admission></PrivateRoute>
      }
      ,
      {
        path: '/staffs',
        element: <PrivateRoute><Staffs></Staffs></PrivateRoute>,
        loader: fetchUsersFull
      }
      ,

      {
        path: '/adduser',
        element: <PrivateRoute><AddUsers></AddUsers></PrivateRoute>
      }
      ,
      {
        path: '/payment',
        element: <PrivateRoute><Payment></Payment></PrivateRoute>
      }
      ,
      {
        path: '/paymententry',
        element: <PrivateRoute><Payment></Payment></PrivateRoute>
      }
      ,
      {
        path: '/note',
        element: <PrivateRoute><Note></Note></PrivateRoute>
      }
      ,
      {
        path: '/editor',
        element: <PrivateRoute><EditorDashboard></EditorDashboard></PrivateRoute>
      }
      ,
      {
        path: '/studentoverview',
        element: <PrivateRoute><StudentOverview></StudentOverview></PrivateRoute>
      }
      ,
      {
        path: '/programentry',
        element: <PrivateRoute><Programs></Programs></PrivateRoute>
      }
      ,
      {
        path: '/batch',
        element: <PrivateRoute><Batch></Batch></PrivateRoute>,
        loader: () => fetch(`${API_URL}/students`)
      }
      ,
      {
        path: '/finder',
        element: <PrivateRoute><Students></Students></PrivateRoute>
      }
      ,
      {
        path: '/payment/:id',
        element: <PrivateRoute><AddPayment></AddPayment></PrivateRoute>,
        loader: fetchStudent,
      }
      ,
      {
        path: '/note/:id',
        element: <PrivateRoute><EditNote></EditNote></PrivateRoute>,
        loader: fetchStudent,
      }
      ,
      {
        path: '/programentry/:id',
        element: <PrivateRoute><ProgramEntry></ProgramEntry></PrivateRoute>,
        loader: fetchStudent,
      }
      ,
      {
        path: '/students/:id',
        element: <PrivateRoute><StudentDetails></StudentDetails></PrivateRoute>,
        loader: fetchStudent,
      }
      ,
      {
        path: '/staffs/:id',
        element: <PrivateRoute><StaffDetails></StaffDetails></PrivateRoute>,
        loader: fetchStaff,
      }
      ,
      {
        path: '/overview',
        element: <PrivateRoute><PaymentComponent></PaymentComponent></PrivateRoute>,
        loader: fetchUsers,

      }
      ,
      {
        path: '/student/update/:id',
        element: <PrivateRoute><UpdateStudent></UpdateStudent></PrivateRoute>,
        loader: fetchStudent,
      }
      ,
      {
        path: '/attendance/:id',
        element: <PrivateRoute><TakeAttendanceId></TakeAttendanceId></PrivateRoute>,
        loader: fetchStudent,
      }
      ,
      {
        path: '/attendance',
        element: <PrivateRoute><AttendanceBatch></AttendanceBatch></PrivateRoute>,


      },
      {
        path: '/exams',
        element: <PrivateRoute><Exams></Exams></PrivateRoute>,

      },
      {
        path: '/coupons',
        element: <PrivateRoute><Coupons></Coupons></PrivateRoute>,
        loader: () => fetch(`${API_URL}/getcoupons`)

      },
      {
        path: '/message',
        element: <PrivateRoute><Message></Message></PrivateRoute>,

      },
      {
        path: '/entry',
        element: <PrivateRoute><MyEntry></MyEntry></PrivateRoute>,

      },
      {
        path: '/monitor',
        element: <PrivateRoute><Monitor></Monitor></PrivateRoute>,
        loader: fetchUsersFull

      },
      {
        path: '/print-receipt',
        element: <PrivateRoute><PrintReceipt></PrintReceipt></PrivateRoute>,

      },

      {
        path: '/download',
        element: <PrivateRoute><DownloadCenter></DownloadCenter></PrivateRoute>,

      },

      {
        path: '/user-management',
        element: <PrivateRoute><ManagementContainer></ManagementContainer></PrivateRoute>,

      },
      {
        path: '/user-management/user',
        element: <PrivateRoute><User></User></PrivateRoute>,

      },
      {
        path: '/exam/:id',
        element: <PrivateRoute><Exam></Exam></PrivateRoute>,
        loader: ({ params }) => fetch(`${API_URL}/getexam/${params.id}`)

      },
      {
        path: '/videos',
        element: <PrivateRoute><VideoManager></VideoManager></PrivateRoute>,
      },
      {
        path: '/video-library',
        element: <VideoLibrary></VideoLibrary>,
      },

    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider><RouterProvider router={router} /></Provider>
  </React.StrictMode>,
)
