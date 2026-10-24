import React from 'react';
import { BookOpen } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EndingScreenProps {
  endingTag?: string;
  title?: string;
  quote?: string;
  badgeText?: string;
  onReturnToChoice: () => void;
  onReturnToTitle: () => void;
  onOpenLog: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  endingTag = 'NORMAL ENDING _ 01',
  title = '"The only way to harm her is to stay by her side forever."',
  quote = '적어도, 당신이 그녀의 곁에 머무름으로써\n그녀를 해할 일은 없게 되었으니까요♩',
  badgeText = '✦ 노멀 엔딩 01 달성 ✦',
  onReturnToChoice,
  onReturnToTitle,
  onOpenLog,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/95 px-6 select-none animate-fade-in transition-opacity duration-700">
      <div className="text-center max-w-[580px] w-full py-8 animate-card-in">
        {/* Top Header Monospace Badge */}
        <div className="text-[#c9a227] text-xs sm:text-sm tracking-[0.35em] uppercase mb-4 font-['IBM_Plex_Mono',monospace] font-semibold drop-shadow-[0_2px_8px_rgba(201,162,39,0.3)]">
          {endingTag}
        </div>

        {/* Main Title Heading with Golden Divider Line */}
        <div className="relative font-semibold text-xl sm:text-2xl md:text-[26px] text-[#e9e1cf] tracking-[0.04em] mb-7 pb-6 font-['Noto_Serif_KR'] leading-relaxed max-w-xl mx-auto">
          {title}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-14 h-[1px] bg-[#8a6f1c]" />
        </div>

        {/* Quote / Subtext in Serifs */}
        <div className="font-['Noto_Serif_KR'] italic text-sm sm:text-[14.5px] text-[#a89a7c] leading-[2] max-w-md mx-auto whitespace-pre-line mb-8">
          {quote}
        </div>

        {/* Ending Achieved Sub-badge */}
        <div className="inline-block px-3 py-1 border border-[#8a6f1c]/40 bg-[#1f1911]/60 text-[11px] text-[#c9a227] font-['Noto_Sans_KR'] tracking-widest mb-8 uppercase">
          {badgeText}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 max-w-[340px] mx-auto">
          <button
            onClick={() => {
              soundManager.playChoice();
              onReturnToChoice();
            }}
            className="group relative w-full text-center bg-[#1f1911]/90 hover:bg-[#2b2114] border border-[#3a2f1d] hover:border-[#c9a227] text-[#e9e1cf] hover:text-white text-xs sm:text-[13px] px-5 py-3 transition-all duration-200 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.6)] font-['Noto_Sans_KR'] tracking-wider"
          >
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c9a227] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />
            &gt;&gt; 선택의 순간으로 돌아가기 (28번)
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToTitle();
            }}
            className="group relative w-full text-center bg-[#14120e]/80 hover:bg-[#1d1810] border border-[#2a2216] hover:border-[#8a6f1c] text-[#8a806d] hover:text-[#e9e1cf] text-xs sm:text-[13px] px-5 py-2.5 transition-all duration-200 cursor-pointer font-['Noto_Sans_KR'] tracking-wider"
          >
            &gt;&gt; 타이틀 화면으로 돌아가기
          </button>
        </div>

        {/* View Backlog button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLog();
            }}
            className="text-[11px] text-[#6f6350] hover:text-[#c9a227] transition-colors flex items-center gap-1.5 font-['Noto_Sans_KR'] tracking-wider cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            대화 로그(LOG) 확인하기
          </button>
        </div>
      </div>
    </div>
  );
};
