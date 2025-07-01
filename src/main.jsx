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

import PdfUploader from './components/StudentSite/PdfUploader';
import PdfChapters from './components/StudentSite/PdfChapters';
import PdfNotes from './components/StudentSite/PdfNotes';
import PDFViewer from './components/StudentSite/PdfViewer';
import VideoChapters from './components/StudentSite/VideoChapters';
import Videofiles from './components/StudentSite/VideoFiles';
import VideoPlayer from './components/StudentSite/VideoPlayer';
import DownloadCenter from './components/Download/DownloadCenter';
import ManagementContainer from './components/UserManagement/ManagementContainer';
import User from './components/UserManagement/User';






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
const fetchStaff = async ({ params }) => {
  const response = await fetch(`https://spoffice-server.vercel.app/staff/${params.id}`);
  
  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'Staff not found' }), {
      status: 404,
    });
  }

  const staff = await response.json();
  return staff;
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
const fetchUsersFull = async () => {
  const response = await fetch(`https://spoffice-server.vercel.app/getusersfull`);
  
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
        path:'/staffs',
        element:<PrivateRoute><Staffs></Staffs></PrivateRoute>,
        loader:fetchUsersFull
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
        path:'/note',
        element:<PrivateRoute><Note></Note></PrivateRoute>
      }
      ,
      {
        path:'/editor',
        element:<PrivateRoute><EditorDashboard></EditorDashboard></PrivateRoute>
      }
      ,
      {
        path:'/studentoverview',
        element:<PrivateRoute><StudentOverview></StudentOverview></PrivateRoute>
      }
      ,
      {
        path:'/programentry',
        element:<PrivateRoute><Programs></Programs></PrivateRoute>
      }
      ,
      {
        path:'/batch',
        element:<PrivateRoute><Batch></Batch></PrivateRoute>,
        loader:() =>fetch ('https://spoffice-server.vercel.app/students')
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
        path:'/note/:id',
        element:<PrivateRoute><EditNote></EditNote></PrivateRoute>,
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
        path:'/staffs/:id',
        element:<PrivateRoute><StaffDetails></StaffDetails></PrivateRoute>,
        loader:fetchStaff,
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
        element:<PrivateRoute><AttendanceBatch></AttendanceBatch></PrivateRoute>,
     
        
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
        path:'/entry',
        element:<PrivateRoute><MyEntry></MyEntry></PrivateRoute>,
            
      },
      {
        path:'/monitor',
        element:<PrivateRoute><Monitor></Monitor></PrivateRoute>,
        loader:fetchUsersFull
            
      },
      {
        path:'/print-receipt',
        element:<PrivateRoute><PrintReceipt></PrintReceipt></PrivateRoute>,
            
      },
     
      {
        path:'/download',
        element:<PrivateRoute><DownloadCenter></DownloadCenter></PrivateRoute>,
            
      },
      {
        path:'/pdfupload',
        element:<PrivateRoute><PdfUploader></PdfUploader></PrivateRoute>,
            
      },
      {
        path:'/user-management',
        element:<PrivateRoute><ManagementContainer></ManagementContainer></PrivateRoute>,
            
      },
      {
        path:'/user-management/user',
        element:<PrivateRoute><User></User></PrivateRoute>,
            
      },
      {
        path:'/exam/:id',
        element:<PrivateRoute><Exam></Exam></PrivateRoute>,
        loader:({params})=>fetch(`https://spoffice-server.vercel.app/getexam/${params.id}`)
        
      },
      {
        path:'/course/chapters',
        element:<PrivateRoute><VideoChapters></VideoChapters></PrivateRoute>,
       
        
      },
      {
        path:'/pdfcourse/:id',
        element:<PrivateRoute><PdfChapters></PdfChapters></PrivateRoute>,
       
        
      },
      {
        path:'/videocourse/:id',
        element:<PrivateRoute><VideoChapters></VideoChapters></PrivateRoute>,
       
        
      },
      {
        path:'/pdfchapter/:id',
        element:<PrivateRoute><PdfNotes></PdfNotes></PrivateRoute>,
       
        
      },
      {
        path:'/videochapter/:id',
        element:<PrivateRoute><Videofiles></Videofiles></PrivateRoute>,
       
        
      },
      {
        path:'/pdfcourse/chapters/notes',
        element:<PrivateRoute><PdfNotes></PdfNotes></PrivateRoute>,
      
      },
      {
        path:'/videocourse/chapters/files',
        element:<PrivateRoute><Videofiles></Videofiles></PrivateRoute>,
      
      },
      {
        path:'/pdfcourse/chapters/notes/view',
        element:<PrivateRoute><PDFViewer></PDFViewer></PrivateRoute>,
      
      },
      {
        path:'/videocourse/chapters/file/view',
        element:<PrivateRoute><VideoPlayer></VideoPlayer></PrivateRoute>,
      
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <Provider><RouterProvider router={router} /></Provider>
  </React.StrictMode>,
)
