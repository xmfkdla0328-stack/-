import React from 'react';
import { soundManager } from '../utils/sound';

interface ChapterIntroProps {
  onAdvance: () => void;
}

export const ChapterIntro: React.FC<ChapterIntroProps> = ({ onAdvance }) => {
  const handleClick = () => {
    soundManager.playAdvance();
    onAdvance();
  };

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/95 px-6 cursor-pointer select-none transition-opacity duration-700"
    >
      <div className="text-center max-w-[560px] w-full py-8">
        <div className="text-[#c9a227] text-sm tracking-[0.3em] uppercase mb-3.5 font-['IBM_Plex_Mono',monospace]">
          Chapter.1
        </div>
        <div className="relative font-semibold text-2xl sm:text-3xl text-[#e9e1cf] tracking-[0.05em] mb-7 pb-5 font-['Noto_Serif_KR']">
          행운의 아이
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-10 h-[1px] bg-[#8a6f1c]" />
        </div>
        <div className="font-['Noto_Serif_KR'] italic text-sm text-[#8a806d] leading-[1.9] max-w-md mx-auto">
          &ldquo;But I account myself a child of Fortune, beneficent Fortune, and I shall not be dishonored.&rdquo;
        </div>
        <div className="mt-10 text-[11px] text-[#6f6350] tracking-[0.1em] font-['Noto_Sans_KR'] flex items-center justify-center gap-1.5 hover:text-[#c9a227] transition-colors">
          <span>클릭하여 계속</span>
          <span className="text-[#c9a227] animate-bob">▼</span>
        </div>
      </div>
    </div>
  );
};
