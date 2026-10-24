import React from 'react';
import { soundManager } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  onChangeTextSpeed: (speed: 'slow' | 'normal' | 'fast' | 'instant') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  textSpeed,
  onChangeTextSpeed,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
  onResetGame,
}) => {
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
        className="relative w-full max-w-[440px] bg-gradient-to-b from-[#1d1810] to-[#17140f] border border-[#3a2f1d] shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95)] max-h-[82vh] flex flex-col animate-card-in"
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
              환경 설정 [SETTINGS]
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 border border-[#3a2f1d] hover:border-[#8a6f1c] text-[#a89a7c] hover:text-[#c9a227] flex items-center justify-center cursor-pointer transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 font-['Noto_Sans_KR'] space-y-5 text-left text-xs">
          {/* Sound Mute & Volume */}
          <div>
            <div className="text-[#c9a227] font-medium tracking-wider mb-2 flex items-center justify-between">
              <span>효과음 (SFX)</span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleMute();
                }}
                className={`px-2.5 py-1 border text-[11px] font-mono cursor-pointer transition-colors ${
                  isMuted
                    ? 'border-[#8a3a30] text-[#8a3a30] bg-[#8a3a30]/10'
                    : 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/10'
                }`}
              >
                {isMuted ? '음소거 됨 (OFF)' : '활성화 (ON)'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#6f6350] text-[11px]">음량</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangeVolume(val);
                }}
                className="flex-1 accent-[#c9a227] h-1.5 bg-[#2a2216] rounded cursor-pointer"
              />
              <span className="text-[#a89a7c] font-mono text-[11px] w-8 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Text speed */}
          <div className="border-t border-[#2a2216] pt-4">
            <div className="text-[#c9a227] font-medium tracking-wider mb-2">
              텍스트 출력 속도
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['slow', 'normal', 'fast', 'instant'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeTextSpeed(spd);
                  }}
                  className={`py-1.5 border text-center transition-all cursor-pointer ${
                    textSpeed === spd
                      ? 'border-[#c9a227] bg-[#c9a227]/20 text-[#e9e1cf] font-medium'
                      : 'border-[#2a2216] bg-black/20 text-[#6f6350] hover:text-[#a89a7c]'
                  }`}
                >
                  {spd === 'slow' ? '느림' : spd === 'normal' ? '보통' : spd === 'fast' ? '빠름' : '즉시'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset progress */}
          <div className="border-t border-[#2a2216] pt-4">
            <div className="text-[#8a3a30] font-medium tracking-wider mb-1">
              회차 초기화
            </div>
            <p className="text-[#6f6350] text-[11px] leading-relaxed mb-3">
              현재 진행 중인 심문을 처음(0일차 서장)부터 다시 시작합니다.
            </p>
            <button
              onClick={() => {
                soundManager.playClick();
                if (window.confirm('서장 처음부터 다시 시작하시겠습니까?')) {
                  onResetGame();
                  onClose();
                }
              }}
              className="w-full py-2 border border-[#8a3a30]/60 hover:border-[#8a3a30] bg-[#8a3a30]/10 hover:bg-[#8a3a30]/20 text-[#e9e1cf] text-xs tracking-wider transition-colors cursor-pointer"
            >
              처음부터 다시 시작 (RESET)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
