import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import LargeNav from './LargeNav';
import { AuthContext } from '../Provider';
import Login from './Login';

function Root() {
  const { user } = useContext(AuthContext)
  return (
    <div className='w-full min-h-screen bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-700'>
      {
        user ? (
          <div className='max-w-[1600px] mx-auto min-h-screen flex flex-col'>
            <Nav />
            <div className='flex-1 flex flex-col lg:flex-row gap-0 lg:gap-8 p-4 lg:p-8 lg:pt-0'>
              <aside className='lg:w-[280px] shrink-0'>
                <LargeNav />
              </aside>
              <main className='flex-1 py-8 lg:py-10 outline-none'>
                <div className="page-transition min-h-[80vh]">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        ) : (
          <div className='min-h-screen flex items-center justify-center p-4 bg-mesh animate-mesh'>
            <div className="mesh-sphere w-[500px] h-[500px] top-[-10%] left-[-10%] bg-indigo-400/20"></div>
            <div className="mesh-sphere w-[400px] h-[400px] bottom-[-10%] right-[-10%] bg-purple-400/20 shadow-[0_0_100px_rgba(168,85,247,0.2)]"></div>
            <Login />
          </div>
        )
      }
    </div>
  )
}

export default Root;