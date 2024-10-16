import React, { useContext, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate } from 'react-router-dom';


function Login() {
  const { login, setloading,notifyFailed,notifySuccess } = useContext(AuthContext);

  const [nevi, setnevi] = useState(false);
  const [loading, setLoading] = useState(false)
  //signup er logic
  const handleSignIn = (e) => {
    setLoading(true)
    e.preventDefault()
    const email = e.target.email.value;
    console.log(email);
    const pass = e.target.pass.value;
    console.log(pass);

    login(email, pass)

      .then((userCredential) => {
        // Signed up success hole
        const user = userCredential.user
        console.log(user)
        setLoading(false);

        setnevi(true);
        notifySuccess("Login Successful !")


      })
      //failed hole
      .catch((error) => {
        console.log(error);
        notifyFailed("Login Failed !")
        setLoading(false)

      })

  }

  // Enter dile jno submit na hoy
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }



  return (
    <div className="bg-slate-100 text-slate-700 p-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-5 items-center">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <img className='w-48 lg:w-72 mx-auto  ' src={`/logo.png`} alt="" />
          <h1 className="text-4xl font-bold mb-2">Welcome to <span className='text-cyan-700'>Sohag Physics</span></h1>
          <p className="text-lg mb-6">
            At <span className='font-bold text-cyan-700'>Sohag Physics</span>, we believe in fostering a culture where every team member contributes to our shared mission of empowering students to achieve their fullest potential. Your dedication and commitment are integral to creating an environment where learning thrives. </p>
        </div>
        <div className="w-full md:w-1/2 bg-white text-black p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Official Login</h2>
          <form onSubmit={handleSignIn}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name='email'
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name='pass'
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <input
              type="submit"
              className="w-full h-11 cursor-pointer bg-cyan-100 text-cyan-700 p-2 rounded-md font-bold hover:bg-cyan-200 transition duration-200"

              value={`${loading ? '' : "Login"}`}
            />
            <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
          </form>
        </div>
      </div>
    </div>

  )
}

export default Login;