import { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';

export default function OpeningAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('vayu-animation-seen');
    if (hasSeen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShow(false);
      return;
    }
    
    // Animation duration 2.8s
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('vayu-animation-seen', 'true');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-atmo-bg bg-dot-grid transition-opacity duration-700 ease-in-out pointer-events-none" style={{ animation: 'fadeOut 0.7s ease-in-out 2.1s forwards' }}>
      
      {/* Tricolor trails container */}
      <div className="absolute inset-0 overflow-hidden flex justify-center items-center opacity-0" style={{ animation: 'fadeInOut 2s ease-in-out 0.2s forwards' }}>
        <div className="w-full h-full relative max-w-4xl">
           {/* Saffron trail */}
           <div className="absolute top-1/3 left-0 right-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#FF9933] to-transparent transform -skew-y-12 animate-[drawLine_1s_ease-out_0.2s_forwards]" style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}></div>
           {/* White trail */}
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform animate-[drawLine_1s_ease-out_0.3s_forwards]" style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}></div>
           {/* Green trail */}
           <div className="absolute bottom-1/3 left-1/2 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#138808] to-transparent transform skew-y-12 animate-[drawLine_1s_ease-out_0.4s_forwards]" style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}></div>
        </div>
      </div>

      {/* Logo & Text appearing */}
      <div className="relative z-10 flex flex-col items-center opacity-0 transform translate-y-4" style={{ animation: 'fadeUp 0.8s ease-out 0.8s forwards' }}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center mb-6 shadow-glow-teal">
          <Cloud className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-atmo-deep uppercase mb-2">Vayu Drishti</h1>
        <p className="text-sm md:text-base text-teal tracking-widest uppercase">Intelligent Weather Monitoring</p>
      </div>

      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
