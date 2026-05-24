import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[length:32px_32px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <main className="pt-40 pb-32 px-6 lg:px-12 max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-24"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            <span className="font-sans text-[11px] font-semibold text-orange-400 tracking-widest uppercase">Our Mission</span>
          </div>
          <h1 className="font-display font-bold leading-tight tracking-tight mb-8 text-zinc-50 text-5xl md:text-7xl">
            Empowering rescue teams with <span className="text-zinc-500">autonomous intelligence.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl">
            When disasters strike, communication networks fail and seconds count. We build edge-native aerospace solutions that give first responders immediate, actionable data when they need it most.
          </p>
        </motion.div>

        {/* Big Image Section */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-32 border border-zinc-800/60 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent z-10 mix-blend-overlay" />
          <img 
            src="/assets/about_team_clean.png" 
            alt="Engineering team analyzing data" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-80"
          />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-px w-12 bg-zinc-700 mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-50 mb-6 tracking-tight">The Problem We Solve</h2>
            <p className="text-zinc-400 leading-relaxed text-lg mb-6">
              Traditional disaster management relies heavily on manual surveillance and cloud-dependent AI. But during severe weather events, cloud infrastructure is the first to go offline. Rescue teams are left operating in the dark, measuring response times in hours rather than seconds.
            </p>
            <p className="text-zinc-400 leading-relaxed text-lg">
              We realized that to truly make an impact, the intelligence couldn't live in a data center thousands of miles away. It had to fly with the drone.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-px w-12 bg-zinc-700 mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-50 mb-6 tracking-tight">Built for the Edge</h2>
            <p className="text-zinc-400 leading-relaxed text-lg mb-6">
              AeroScout was engineered from the ground up for zero-connectivity environments. By deploying Liquid Neural Networks (LNNs) and Reinforcement Learning directly onto lightweight edge compute modules, our drones process visual data, identify critical zones, and navigate autonomously.
            </p>
            <p className="text-zinc-400 leading-relaxed text-lg">
              No internet. No cloud. Just pure, localized intelligence delivering precise GPS coordinates of affected areas straight to the Command OS of rescue operators on the ground.
            </p>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-orange-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-zinc-50" />
            </div>
            <span className="font-sans text-sm font-bold tracking-widest uppercase text-zinc-50">
              AeroScout
            </span>
          </div>
          <span className="font-sans text-xs tracking-widest text-zinc-500 uppercase">&copy; 2026 AeroScout Systems.</span>
        </div>
      </footer>
    </div>
  )
}
