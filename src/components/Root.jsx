import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import LargeNav from './LargeNav';
import { AuthContext } from '../Provider';
import Login from './Login';

function Root() {
  const { user } = useContext(AuthContext)
  return (
    <div className='w-full min-h-screen bg-slate-100'>
      <div className='max-w-7xl rounded-lg  p-5 bg-slate-100 mx-auto'>
        {
          user ? <> <Nav></Nav>
            <div className='flex'>
              <div className='hidden lg:block lg:w-1/4'><LargeNav></LargeNav></div>
              <div className='lg:w-3/4 w-11/12 mx-auto'><Outlet></Outlet></div>
            </div></> : <div><Login></Login>
            </div>
        }
     

      </div>
    </div>
  )
}

export default Root;