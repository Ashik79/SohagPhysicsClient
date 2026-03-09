import API_URL from './apiConfig';
import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Layout & Core
import Root from './components/Root';
import Provider from './Provider';
import PrivateRoute from './PrivateRoute';
import Loading from './components/Loading';

// Lazy Loaded Components
const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const Admission = lazy(() => import('./components/Admission'));
const Payment = lazy(() => import('./components/Payment'));
const AddUsers = lazy(() => import('./components/AddUsers'));
const AddPayment = lazy(() => import('./components/AddPayment'));
const NotFound = lazy(() => import('./components/NotFound'));
const Students = lazy(() => import('./components/Students'));
const StudentDetails = lazy(() => import('./components/StudentDetails'));
const UpdateStudent = lazy(() => import('./components/UpdateStudent'));
const PaymentComponent = lazy(() => import('./components/PaymentOverview'));
const TakeAttendance = lazy(() => import('./components/TakeAttendance'));
const Exams = lazy(() => import('./components/Exams'));
const Exam = lazy(() => import('./components/Exam'));
const Message = lazy(() => import('./components/Message'));
const ProgramEntry = lazy(() => import('./components/ProgramEntry'));
const Programs = lazy(() => import('./components/Programs'));
const Coupons = lazy(() => import('./components/Coupons'));
const Note = lazy(() => import('./components/Note'));
const EditNote = lazy(() => import('./components/EditNote'));
const StudentOverview = lazy(() => import('./components/StudentOverview'));
const Batch = lazy(() => import('./components/Batch'));
const PrintReceipt = lazy(() => import('./components/PrintReceipt'));
const MyEntry = lazy(() => import('./components/StuffPart/MyEntry'));
const Monitor = lazy(() => import('./components/StuffPart/Monitor'));
const AttendanceBatch = lazy(() => import('./components/AttendanceBatch'));
const Staffs = lazy(() => import('./components/StuffPart/Staffs'));
const StaffDetails = lazy(() => import('./components/StuffPart/StaffDetails'));
const EditorDashboard = lazy(() => import('./components/StudentSite/EditorDashboard'));
const VideoManager = lazy(() => import('./components/StudentSite/VideoManager'));
const VideoLibrary = lazy(() => import('./components/StudentSite/VideoLibrary'));
const DownloadCenter = lazy(() => import('./components/Download/DownloadCenter'));
const ManagementContainer = lazy(() => import('./components/UserManagement/ManagementContainer'));
const User = lazy(() => import('./components/UserManagement/User'));
const TakeAttendanceId = lazy(() => import('./components/TakeAttendanceId'));


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
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </Provider>
  </React.StrictMode>,
)
