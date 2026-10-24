import React, { useEffect } from 'react';
import { KEYWORDS } from '../data/storyData';
import { soundManager } from '../utils/sound';

interface KeywordPopupProps {
  keywordIds: string[];
  onClose: () => void;
}

export const KeywordPopup: React.FC<KeywordPopupProps> = ({ keywordIds, onClose }) => {
  useEffect(() => {
    soundManager.playKeywordChime();
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060503]/80 backdrop-blur-sm px-6 select-none animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-gradient-to-b from-[#1d1810] to-[#17140f] border border-[#8a6f1c] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(201,162,39,0.08)] px-7 py-7 text-center animate-card-in"
      >
        {/* Top gold bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#c9a227]" />

        {/* 4 corner brackets */}
        <div className="corner-bracket tl" />
        <div className="corner-bracket tr" />
        <div className="corner-bracket bl" />
        <div className="corner-bracket br" />

        <div className="text-[11.5px] font-['Noto_Sans_KR'] tracking-[0.22em] text-[#a89a7c] uppercase my-2">
          <span className="text-[#c9a227]">◆ </span>단서 키워드 획득
        </div>

        {/* Tags list */}
        <div className="flex flex-wrap gap-2 justify-center mt-3 mb-5">
          {keywordIds.map((id, index) => {
            const kw = KEYWORDS[id];
            const numStr = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
            return (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-1.5 border border-[#8a6f1c] bg-[#c9a227]/[0.12] text-[#c9a227] font-mono text-[13px] tracking-wider shadow-sm"
              >
                <span className="text-[#6f6350]">#{numStr}</span>
                <span className="font-semibold text-[#e9e1cf]">{kw ? kw.name : id}</span>
              </div>
            );
          })}
        </div>

        {/* Descriptions */}
        <div className="text-left bg-black/30 border border-[#2a2216] p-3.5 text-xs text-[#a89a7c] leading-relaxed space-y-2 max-h-36 overflow-y-auto mb-4 font-['Noto_Serif_KR']">
          {keywordIds.map((id) => {
            const kw = KEYWORDS[id];
            if (!kw) return null;
            return (
              <div key={id}>
                <span className="text-[#c9a227] font-medium mr-1.5">[{kw.name}]</span>
                <span>{kw.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Close hint */}
        <div className="pt-3 border-t border-dashed border-[#2a2216]">
          <button
            onClick={handleClose}
            className="text-[11.5px] font-['Noto_Sans_KR'] tracking-[0.16em] text-[#a89a7c] hover:text-[#c9a227] transition-colors cursor-pointer py-1 px-4"
          >
            탭하여 닫기 [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
};
