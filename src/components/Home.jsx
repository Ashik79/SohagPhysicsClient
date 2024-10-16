import React, { useContext } from 'react'
import { AuthContext } from '../Provider'
import { useNavigate } from 'react-router-dom';


function Home() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext);
  return (
    <div className='w-full'>
      <div className="max-w-7xl mx-auto flex flex-col  items-center">
        
        <div className='w-3/4 mb-10 mx-auto rounded-lg'>
          <img className='rounded-lg' src={`/banner.jpg`} alt="" />
          
        </div>
        <div className="w-full  mb-8 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">Welcome to <span className='text-cyan-700'>Sohag Physics</span></h1>
          <p className="text-lg mb-6">
            At <span className='font-bold text-cyan-700'>Sohag Physics</span>,we believe in fostering a culture where every team member contributes to our shared mission of empowering students to achieve their fullest potential. Your dedication and commitment are integral to creating an environment where learning thrives. We encourage each of you to treat this institution as your own, taking pride in the impact we collectively make on the lives of our students. Together, let's uphold honesty, integrity, and a relentless pursuit of excellence in every task we undertake. Your efforts are not just tasks; they are building blocks that shape the future of our students and our institution. </p>
        </div>


      </div>



    </div>
  )
}

export default Home