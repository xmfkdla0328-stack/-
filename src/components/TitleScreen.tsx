import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/sound';

interface TitleScreenProps {
  onStart: () => void;
  hasSave: boolean;
  onContinue?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, hasSave, onContinue }) => {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const rayLines = Array.from({ length: 36 }).map((_, i) => {
    const angle = (i / 36) * Math.PI * 2;
    const x1 = (100 + Math.cos(angle) * 72).toFixed(2);
    const y1 = (100 + Math.sin(angle) * 72).toFixed(2);
    const x2 = (100 + Math.cos(angle) * 98).toFixed(2);
    const y2 = (100 + Math.sin(angle) * 98).toFixed(2);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });

  const handleStart = () => {
    soundManager.playClick();
    onStart();
  };

  const handleContinue = () => {
    if (onContinue) {
      soundManager.playClick();
      onContinue();
    }
  };

  return (
    <div
      onClick={handleStart}
      className={`fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#0b0a08] transition-opacity duration-1000 cursor-pointer ${
        faded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-[340px] max-w-[85vw] h-[340px] flex items-center justify-center select-none">
        {/* Sun rays graphic */}
        <div className="absolute inset-0 opacity-70 pointer-events-none -translate-y-12">
          <svg viewBox="0 0 200 200" className="w-full h-full block">
            <g className="animate-spin-slow origin-center" stroke="#c9a227" strokeWidth="0.5" opacity="0.6">
              <circle cx="100" cy="100" r="70" fill="none" strokeWidth="0.6" />
              <circle cx="100" cy="100" r="92" fill="none" strokeWidth="0.3" />
              <g>{rayLines}</g>
            </g>
          </svg>
        </div>

        {/* Title text */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center justify-center gap-1.5">
          <p className="text-[10.5px] tracking-[0.3em] text-[#6f6350] uppercase font-['Noto_Sans_KR'] mb-1">
            Honkai: Star Rail fan game
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#e9e1cf] tracking-[0.02em] font-['Cinzel',serif] my-0.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
            ΑΝΑΓΝΩΡΙΣΙΣ
          </h1>
          <p className="text-[18px] tracking-[0.12em] text-[#c9a227] font-['Noto_Serif_KR'] font-medium mt-1">
            역광의 깨달음
          </p>
          <p className="text-[12px] tracking-[0.16em] text-[#a89a7c] font-['Noto_Serif_KR'] italic">
            눈 먼 태양의 밤
          </p>

          <div
            className="mt-7 flex flex-col sm:flex-row gap-2.5 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleStart}
              className="px-6 py-2 border border-[#c9a227]/60 bg-[#c9a227]/10 hover:bg-[#c9a227]/25 text-[#e9e1cf] hover:text-[#fff] hover:border-[#c9a227] text-xs tracking-[0.16em] transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(201,162,39,0.12)] font-['Noto_Sans_KR']"
            >
              이야기 시작 [START]
            </button>
            {hasSave && (
              <button
                onClick={handleContinue}
                className="px-6 py-2 border border-[#3a2f1d] bg-[#17140f] hover:border-[#c9a227]/60 text-[#a89a7c] hover:text-[#e9e1cf] text-xs tracking-[0.16em] transition-all duration-200 cursor-pointer font-['Noto_Sans_KR']"
              >
                이어하기 [CONTINUE]
              </button>
            )}
          </div>

          <p className="mt-4 text-[11px] text-[#6f6350] tracking-wider animate-pulse font-['Noto_Sans_KR']">
            화면을 눌러 게임 시작
          </p>
        </div>
      </div>
    </div>
  );
};
