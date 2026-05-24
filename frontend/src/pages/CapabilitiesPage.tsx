import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function CapabilitiesPage() {
  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      
      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[length:32px_32px]" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <Navbar />

      <section className="pt-32 md:pt-48 pb-24 lg:pb-32 px-6 lg:px-12 border-b border-zinc-900 relative z-10 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
            <span className="font-sans text-[11px] font-semibold tracking-widest uppercase text-zinc-400">
              Technical Documentation
            </span>
          </div>
          <h1 className="font-display font-bold leading-tight tracking-tight mb-8 text-zinc-50 text-5xl md:text-7xl xl:text-8xl">
            Capabilities &amp;<br /><span className="text-zinc-600">research.</span>
          </h1>
          <p className="font-sans text-lg lg:text-xl text-zinc-400 max-w-3xl leading-relaxed font-medium">
            AeroScout-CV is built on peer-reviewed research integrating edge computing and aerial surveillance for disaster management. Below is a deep dive into the operational capabilities and academic architecture that powers the platform.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 lg:px-12 border-b border-zinc-900 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-24 md:gap-32">
          
          <div className="border border-zinc-800/60 rounded-2xl bg-zinc-900/30 p-8 lg:p-16 shadow-2xl relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-950 border border-zinc-800 mb-8">
              <span className="font-sans text-[11px] font-semibold text-zinc-300 tracking-widest uppercase">Abstract</span>
            </div>
            <p className="font-sans text-xl text-zinc-300 leading-relaxed max-w-4xl">
              Flood disasters cause rapid and widespread damage that fixed sensor networks are too slow to assess. AeroScout-CV is an autonomous aerial platform that combines a Liquid Neural Network (LNN) for onboard flood perception with a Proximal Policy Optimization (PPO) reinforcement-learning (RL) planner for mission control. The system runs entirely on a Raspberry Pi 3 without cloud connectivity, communicating with a Pixhawk autopilot over MAVLink.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="flex flex-col gap-6">
              <div className="h-px w-12 bg-zinc-700 mb-2" />
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-50 uppercase">LNN Perception</h3>
              <p className="font-sans text-lg text-zinc-400 leading-relaxed max-w-lg">
                The LNN, trained on the FloodNet and INRIA datasets, achieves a Dice coefficient of 0.794, an IoU of 0.682, and a pixel accuracy of 91.0%, while running at 5.2 frames per second on the target hardware. This is faster than U-Net (0.8 fps) and DeepLabV3+ (&lt;0.3 fps) at a 14.8&times; lower parameter count (2.14 M vs. 31.0 M for U-Net).
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="h-px w-12 bg-zinc-700 mb-2" />
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-50 uppercase">RL Flight Planner</h3>
              <p className="font-sans text-lg text-zinc-400 leading-relaxed max-w-lg">
                The PPO planner reaches 91.2% area coverage and a priority rescue score of 0.87, improving on boustrophedon and greedy baselines by 6.9 and 3.6 percentage points in coverage while cutting energy use by 17.9% and recording zero safety violations across 100 simulated missions.
              </p>
            </div>
          </div>

          <div className="pt-24 border-t border-zinc-900">
            <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-16 text-zinc-50">The Five-Layer Hierarchy</h3>
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {[
                { n: '01', title: 'Sensor Input', desc: 'RGB camera, IMU, barometer, and GPS data fused for environment state.' },
                { n: '02', title: 'LNN Perception', desc: 'Continuous-time ODE dynamics process spatial features and temporal changes.' },
                { n: '03', title: 'Geo-Referencing', desc: 'Projects pixel detections to world coordinates using a pinhole camera model.' },
                { n: '04', title: 'RL Planning', desc: 'Proximal Policy Optimization calculates optimal flight paths based on map confidence decay.' },
                { n: '05', title: 'Safety Execution', desc: 'Enforces geo-fences, battery reserves, and command-rate limiting prior to MAVLink dispatch.' }
              ].map((layer, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 lg:gap-16 p-8 lg:p-12 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-300 group">
                  <span className="font-display text-4xl lg:text-5xl font-bold text-zinc-800 group-hover:text-orange-500 transition-colors duration-300 w-20 shrink-0">{layer.n}</span>
                  <div className="flex-1">
                    <h4 className="font-sans text-xl lg:text-2xl font-bold text-zinc-50 mb-3 tracking-wide">{layer.title}</h4>
                    <p className="font-sans text-lg text-zinc-400 max-w-2xl leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 font-sans bg-zinc-950 relative z-10">
        <div className="font-bold text-xs tracking-widest uppercase text-zinc-500">&copy; 2026 AeroScout Systems</div>
        <Link to="/" className="text-xs tracking-widest uppercase text-zinc-400 hover:text-orange-500 transition-colors font-bold flex items-center gap-2">
          Return to Platform 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </footer>
    </div>
  )
}
