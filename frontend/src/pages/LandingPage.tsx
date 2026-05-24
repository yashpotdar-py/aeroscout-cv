import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function MetricBlock({ label, val, unit, desc }: { label: string, val: string, unit: string, desc: string }) {
  return (
    <div className="flex flex-col border-l-2 border-zinc-800/60 pl-6 lg:pl-8 h-full transition-all hover:border-orange-500 duration-300 group">
      <p className="font-sans text-xs tracking-widest text-zinc-500 mb-2 uppercase font-semibold group-hover:text-zinc-300 transition-colors">{label}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-zinc-100">{val}</h3>
        <span className="font-sans text-sm font-semibold text-orange-500">{unit}</span>
      </div>
      <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-[28ch]">{desc}</p>
    </div>
  )
}

function GCSPortfolio() {
  return (
    <div className="relative w-full max-w-7xl mx-auto mt-24 flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 bg-green-500 animate-pulse rounded-full" />
          <span className="font-sans text-xs tracking-[0.2em] text-zinc-400 uppercase font-semibold">Live Simulation feed</span>
        </div>
        <Link 
          to="/command"
          className="flex items-center gap-3 text-orange-500 hover:text-orange-400 font-sans text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Open GCS Terminal
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <path d="M5 12H19M12 5L19 12L12 19" />
          </svg>
        </Link>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 aspect-[16/9] shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
        
        <div className="absolute inset-0 z-0 flex flex-col">
          {/* Top bar */}
          <div className="h-12 border-b border-zinc-800/60 flex items-center px-6 justify-between bg-zinc-950/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
            </div>
            <span className="font-sans text-[10px] tracking-widest text-zinc-500 uppercase font-bold">AeroScout Command OS</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-row">
            <div className="w-1/4 border-r border-zinc-800/60 p-8 flex flex-col gap-8 bg-zinc-950/60 backdrop-blur-sm relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
               <div className="h-3 rounded-full bg-zinc-800/60 w-2/3 relative z-10" />
               <div className="h-20 rounded-lg border border-zinc-800/50 bg-zinc-900/40 relative z-10" />
               <div className="h-20 rounded-lg border border-zinc-800/50 bg-zinc-900/40 relative z-10" />
               <div className="h-20 rounded-lg border border-zinc-800/50 bg-zinc-900/40 relative z-10" />
            </div>
            
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <div className="flex-1 border-b border-zinc-800/60 flex flex-row">
                <div className="w-1/2 border-r border-zinc-800/60 bg-zinc-900/20 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('/assets/ppo_planner.png')] bg-cover bg-center opacity-40 mix-blend-screen" />
                </div>
                <div className="w-1/2 bg-zinc-950 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('/assets/hero_drone_clean.png')] bg-cover bg-center opacity-80 mix-blend-luminosity" />
                   <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                </div>
              </div>
              <div className="h-1/3 bg-zinc-950/90 p-8 flex flex-col justify-end backdrop-blur-md">
                <div className="h-2 rounded-full bg-zinc-800 w-1/3 mb-4" />
                <div className="h-2 rounded-full bg-zinc-800 w-1/4 mb-4" />
                <div className="h-2 rounded-full bg-orange-500/60 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-orange-500 selection:text-white relative">
      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[length:32px_32px]" />
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-orange-500/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-24 md:pb-40 px-6 lg:px-12 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-6xl w-full flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="font-sans text-[11px] font-semibold tracking-widest uppercase text-zinc-300">
              Protocol: Alpha-7 Active
            </span>
          </div>
          
          <h1 className="font-display font-bold leading-tight tracking-tight mb-8 text-zinc-50 text-5xl md:text-7xl xl:text-8xl max-w-5xl">
            Real-time disaster <br className="hidden md:block" /> intelligence <span className="text-zinc-600">at the edge.</span>
          </h1>
          
          <p className="font-sans text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-12">
            AeroScout-CV deploys autonomous UAVs powered by Liquid Neural Networks. Zero cloud dependency. 100% edge-computed flood segmentation and rescue prioritization.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link 
              to="/command"
              className="inline-flex items-center gap-3 bg-zinc-50 text-zinc-950 px-8 py-4 rounded-lg font-sans text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:bg-orange-500 hover:text-white"
            >
              Access Command Center
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link 
              to="/research"
              className="inline-flex items-center gap-3 bg-transparent text-zinc-300 border border-zinc-700 px-8 py-4 rounded-lg font-sans text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:bg-zinc-800"
            >
              Read the Research
            </Link>
          </div>

          <GCSPortfolio />
        </div>
      </section>

      {/* Breakthrough Metrics Section */}
      <section className="py-24 md:py-40 px-6 lg:px-12 border-t border-zinc-900 relative z-10 bg-zinc-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-3xl">
            <h2 className="font-display font-bold tracking-tight leading-tight mb-6 text-zinc-50 text-4xl md:text-5xl">
              Engineered for <span className="text-orange-500">the extremes.</span>
            </h2>
            <p className="font-sans text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Based on the AeroScout-CV research paper. Our architecture shatters the constraints of traditional cloud-based disaster management by bringing severe-computation models directly onto embedded hardware.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            <MetricBlock 
              label="Efficiency Gain" val="14.8" unit="&times;" 
              desc="Smaller parameter count compared to standard U-Net architecture, achieving inference entirely on a Raspberry Pi 3."
            />
            <MetricBlock 
              label="Real-time Compute" val="5.2" unit="fps" 
              desc="Continuous Liquid Neural Network execution directly on the drone. Faster than baseline CNNs which struggle below 1 fps."
            />
            <MetricBlock 
              label="Area Surveyed" val="91.2" unit="%" 
              desc="Coverage achieved by our PPO Reinforcement Learning planner, outperforming static boustrophedon patterns."
            />
            <MetricBlock 
              label="Operational Risk" val="0" unit="vltns" 
              desc="Safety violations across 100 simulated disaster missions, thanks to a strict 5-layer hierarchical execution."
            />
          </div>
        </div>
      </section>

      {/* Core Architecture Section */}
      <section className="py-24 md:py-40 px-6 lg:px-12 border-t border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-32 md:gap-48">
          
          {/* Perception block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-5 flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="font-sans text-[11px] font-semibold text-purple-400 tracking-widest uppercase">Phase 01 / Perception</span>
              </div>
              <h2 className="font-display font-bold tracking-tight leading-tight mb-6 text-zinc-50 text-4xl md:text-5xl">
                Liquid neural networks.
              </h2>
              <p className="font-sans text-lg text-zinc-400 leading-relaxed mb-8">
                Standard Convolutional Neural Networks (CNNs) treat each frame independently, missing critical temporal cues in evolving flood scenes. Our LNN uses continuous-time ODE dynamics to understand the flow of water over time.
              </p>
              <ul className="flex flex-col gap-4 font-sans text-base text-zinc-300 border-l border-zinc-800 pl-6">
                <li className="flex gap-4 items-center"><span className="text-orange-500 font-bold">&bull;</span> 2.14 Million parameters</li>
                <li className="flex gap-4 items-center"><span className="text-orange-500 font-bold">&bull;</span> 91.0% pixel accuracy on FloodNet</li>
                <li className="flex gap-4 items-center"><span className="text-orange-500 font-bold">&bull;</span> INT8 Quantization for edge deployment</li>
              </ul>
            </div>
            <div className="lg:col-span-7">
              <div className="w-full rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/30 relative aspect-[4/3] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent z-10 mix-blend-overlay" />
                <img src="/assets/lnn_graphic.png" alt="Liquid Neural Network Visualization" className="w-full h-full object-cover mix-blend-luminosity opacity-90 transition-all duration-700 hover:mix-blend-normal hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Planning block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-5 lg:col-start-8 flex flex-col order-1 lg:order-2">
              <div className="mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span className="font-sans text-[11px] font-semibold text-blue-400 tracking-widest uppercase">Phase 02 / Planning</span>
              </div>
              <h2 className="font-display font-bold tracking-tight leading-tight mb-6 text-zinc-50 text-4xl md:text-5xl">
                Reinforcement routing.
              </h2>
              <p className="font-sans text-lg text-zinc-400 leading-relaxed mb-8">
                Static coverage algorithms fail when disaster boundaries shift. AeroScout-CV utilizes Proximal Policy Optimization (PPO) to dynamically route the UAV, balancing battery limits against the urgency of mapping high-severity zones.
              </p>
              <ul className="flex flex-col gap-4 font-sans text-base text-zinc-300 border-l border-zinc-800 pl-6">
                <li className="flex gap-4 items-center"><span className="text-orange-500 font-bold">&bull;</span> Evaluates temporal map confidence decay</li>
                <li className="flex gap-4 items-center"><span className="text-orange-500 font-bold">&bull;</span> 17.9% reduction in flight energy usage</li>
                <li className="flex gap-4 items-center"><span className="text-orange-500 font-bold">&bull;</span> Adaptable to dynamic obstacles and wind</li>
              </ul>
            </div>
            <div className="lg:col-span-7 lg:col-start-1 order-2 lg:order-1">
              <div className="w-full rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/30 relative aspect-[4/3] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent z-10 mix-blend-overlay" />
                <img src="/assets/ppo_planner.png" alt="PPO Routing Visualization" className="w-full h-full object-cover mix-blend-luminosity opacity-90 transition-all duration-700 hover:mix-blend-normal hover:scale-105" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Validation Pipeline */}
      <section className="py-24 md:py-40 px-6 lg:px-12 border-b border-zinc-900 relative z-10 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[length:32px_32px]" />
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
          <h2 className="font-display font-bold tracking-tight leading-tight mb-8 text-zinc-50 text-5xl md:text-7xl uppercase">
            Five-stage safety<br />validation.
          </h2>
          <p className="font-sans text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-3xl mb-16">
            AeroScout-CV employs a rigorous validation ladder before any autonomous flight. We progress from offline datasets through Software-in-the-Loop (SITL) and Hardware-in-the-Loop (HITL) before attempting tethered flights.
          </p>
          <div className="w-full rounded-2xl overflow-hidden border border-zinc-800/60 relative bg-zinc-900/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent z-10 pointer-events-none mix-blend-overlay" />
            <img src="/assets/testing_ladder.png" alt="Testing Validation Ladder" className="w-full h-auto object-contain mix-blend-luminosity opacity-90 transition-all duration-700 hover:mix-blend-normal" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-zinc-900 bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-[1.5px] border-orange-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-zinc-50" />
            </div>
            <span className="font-sans text-sm font-bold tracking-widest uppercase text-zinc-50">
              AeroScout
            </span>
          </div>
          <p className="font-sans text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            &copy; 2026 AeroScout Systems.
          </p>
        </div>
      </footer>
    </div>
  )
}
