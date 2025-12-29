
import React from 'react';
import { JobEntry } from '../types';

interface JobTickerProps {
  jobs: JobEntry[];
}

const JobTicker: React.FC<JobTickerProps> = ({ jobs }) => {
  const latest = jobs.slice(0, 10);

  return (
    <div className="bg-blue-950 text-white py-3 flex items-center overflow-hidden whitespace-nowrap border-b-[3px] border-yellow-500 shadow-lg relative">
      <div className="bg-red-600 px-6 py-2 font-black italic animate-pulse shrink-0 z-10 shadow-xl border-r-4 border-yellow-400 text-sm tracking-tighter">
        BREAKING NEWS
      </div>
      <div className="flex animate-marquee hover:pause whitespace-nowrap items-center">
        {latest.length > 0 ? latest.map(job => (
          <div key={job.id} className="mx-10 flex items-center gap-2 group cursor-pointer">
            <span className="text-yellow-400 font-black text-lg">⚡</span>
            <span className="font-black text-[13px] uppercase tracking-wide group-hover:text-yellow-400 transition-colors">
              {job.title} ({job.category})
            </span>
          </div>
        )) : (
          <span className="mx-8 font-black uppercase text-xs text-blue-300">Loading latest examination updates for 2024-25...</span>
        )}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 40s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default JobTicker;
