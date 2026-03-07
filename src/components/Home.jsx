import React, { useContext } from 'react'
import { AuthContext } from '../Provider'
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiAward, FiUsers, FiCpu, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

function Home() {
  const { user, loggedUser } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='w-full space-y-10'
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl h-[300px] lg:h-[400px] shadow-2xl">
        <img
          className='absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700'
          src={`/physics_hero_background_1772717112290.png`}
          alt="Physics Background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-center px-8 lg:px-16 space-y-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl lg:text-7xl font-extrabold text-white tracking-tight">
              Elevating <span className="text-teal-400">Physics</span> Standards
            </h1>
            <p className="text-slate-200 max-w-xl text-sm lg:text-xl mt-4 font-light">
              Welcome back, <span className="text-teal-300 font-bold">{loggedUser}</span>. Let's continue the pursuit of excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: <FiAward className="text-teal-500" />, title: "Academic Excellence", desc: "Maintaining the highest standards in physics instruction." },
          { icon: <FiUsers className="text-violet-500" />, title: "Student Engagement", desc: "Fostering a culture of active learning and participation." },
          { icon: <FiCheckCircle className="text-blue-500" />, title: "Integrity & Trust", desc: "Relentless pursuit of excellence and academic integrity." }
        ].map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-start gap-4 transition-all hover:shadow-teal-500/10"
          >
            <div className="p-3 bg-slate-50 rounded-xl text-2xl">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{card.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Philosophy Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-3xl shadow-xl relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <FiTarget className="text-teal-400 text-3xl" />
            <h2 className="text-3xl font-bold tracking-tight">Our Vision</h2>
          </div>
          <p className="text-slate-300 text-lg lg:text-xl leading-relaxed font-light">
            At Sohag Physics, your efforts are not just tasks; they are building blocks that shape the future. We believe in fostering a culture where every team member contributes to our shared mission.
          </p>
        </div>
      </motion.section>
    </motion.div>
  )
}

export default Home
