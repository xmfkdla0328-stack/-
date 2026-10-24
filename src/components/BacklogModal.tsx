import React from 'react';
import { LogEntry } from '../types/game';
import { soundManager } from '../utils/sound';

interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: LogEntry[];
}

export const BacklogModal: React.FC<BacklogModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060503]/80 backdrop-blur-sm px-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[540px] bg-gradient-to-b from-[#1d1810] to-[#17140f] border border-[#3a2f1d] shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95)] max-h-[82vh] flex flex-col animate-card-in"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-[2px] bg-[#c9a227]" />
        <div className="corner-bracket tl" />
        <div className="corner-bracket tr" />
        <div className="corner-bracket bl" />
        <div className="corner-bracket br" />

        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2a2216] shrink-0 font-['Noto_Sans_KR']">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c9a227] rotate-45" />
            <h3 className="m-0 text-xs tracking-[0.18em] text-[#c9a227] uppercase font-medium">
              심문 대화 기록 [LOG]
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 border border-[#3a2f1d] hover:border-[#8a6f1c] text-[#a89a7c] hover:text-[#c9a227] flex items-center justify-center cursor-pointer transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 font-['Noto_Serif_KR'] space-y-4 text-left">
          {history.length === 0 ? (
            <div className="text-center text-xs text-[#6f6350] py-8 italic font-['Noto_Sans_KR']">
              기록된 대화가 없습니다.
            </div>
          ) : (
            history.map((entry, idx) => (
              <div key={idx} className="pb-3 border-b border-[#2a2216] last:border-b-0">
                {entry.speaker && (
                  <div className="text-xs font-medium text-[#c9a227] font-['Noto_Sans_KR'] tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-[#c9a227] rotate-45" />
                    <span>{entry.speaker}</span>
                  </div>
                )}
                <p className="text-[14px] leading-relaxed text-[#e9e1cf] m-0 whitespace-pre-line">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
