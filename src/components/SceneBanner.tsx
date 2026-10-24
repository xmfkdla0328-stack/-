import React from 'react';
import { Puzzle, GitMerge } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SceneBannerProps {
  dayText?: string;
  location?: string;
  bannerImage?: string;
  charSprite?: string;
  charSpriteLeft?: string;
  keywordCount: number;
  onOpenCombo: () => void;
  onOpenKeywords: () => void;
}

export const SceneBanner: React.FC<SceneBannerProps> = ({
  dayText = 'DAY 1',
  location = '엘리사이 에데스',
  bannerImage = '/banner.png',
  charSprite,
  charSpriteLeft,
  keywordCount,
  onOpenCombo,
  onOpenKeywords,
}) => {
  const showSprite = Boolean(charSprite && charSprite !== 'none' && charSprite !== '');
  const showSpriteLeft = Boolean(charSpriteLeft && charSpriteLeft !== 'none' && charSpriteLeft !== '');
  const hasBoth = showSprite && showSpriteLeft;

  return (
    <div className="relative w-full h-[140px] sm:h-[160px] border border-[#3a2f1d] overflow-hidden select-none bg-[#141009] shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
      {/* Layer 1: Background image */}
      <img
        src={bannerImage || '/banner.png'}
        alt="지역 배경"
        className="w-full h-full object-cover object-center block brightness-[0.85] contrast-[1.05]"
      />

      {/* Layer 1.5: Soft radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(201,162,39,0.18),transparent_75%)]" />

      {/* Decorative corner brackets */}
      <div className="scene-corner tl" />
      <div className="scene-corner tr" />
      <div className="scene-corner bl" />
      <div className="scene-corner br" />

      {/* Layer 2: Character Sprite Layer (Dynamic Sliding Animation when joined by companion) */}
      <div className="absolute inset-0 z-[2] flex justify-center items-end pointer-events-none overflow-hidden">
        <div className="relative flex justify-center items-end h-full w-full max-w-[480px]">
          {/* Left Character (e.g. Dan Heng sliding in from the left) */}
          {showSpriteLeft && (
            <div
              key={charSpriteLeft}
              className="absolute bottom-0 flex justify-center items-end h-full z-[2] -translate-x-[36px] sm:-translate-x-[48px]"
            >
              <div className="animate-char-slide-in-left flex justify-center items-end h-full">
                <img
                  src={charSpriteLeft}
                  alt="좌측 동행 캐릭터"
                  className="h-[92%] sm:h-[97%] w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>
          )}

          {/* Main / Existing Character (e.g. Stelle: slides smoothly to the right when companion appears) */}
          {showSprite && (
            <div
              className={`absolute bottom-0 flex justify-center items-end h-full z-[3] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                showSpriteLeft ? 'translate-x-[36px] sm:translate-x-[48px]' : 'translate-x-0'
              }`}
            >
              <img
                src={charSprite}
                alt="메인 캐릭터 스탠딩"
                className="h-[95%] sm:h-full w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] transition-opacity duration-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Left HUD: Day Badge & Location */}
      <div className="absolute left-3.5 bottom-3.5 z-10 flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-2 text-[11.5px] font-mono tracking-[0.2em] text-[#e9e1cf] bg-[#0b0a08]/80 border border-[#8a6f1c] px-2.5 py-0.5 uppercase backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          <span className="w-1.5 h-1.5 bg-[#c9a227] rotate-45 shrink-0" />
          <span>{dayText}</span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-[13px] tracking-[0.06em] text-[#e9e1cf] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-['Noto_Sans_KR']">
          <span className="w-1.5 h-1.5 bg-[#c9a227] rotate-45 shrink-0" />
          <span>{location}</span>
        </div>
      </div>

      {/* Layer 3: Top-Right / Bottom-Right Menu Buttons */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            soundManager.playBookOpen();
            onOpenCombo();
          }}
          className="bg-[#0f0f14]/85 hover:bg-black/95 text-[#f0f0f0] hover:text-[#c9a227] border border-white/30 hover:border-[#c9a227] backdrop-blur-sm px-3 py-1.5 text-xs font-medium rounded-none font-['Noto_Sans_KR'] tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-200 flex items-center gap-1.5"
          title="단서 조합"
        >
          <GitMerge className="w-3.5 h-3.5 text-[#c9a227]" />
          <span>단서 조합</span>
        </button>

        <button
          onClick={() => {
            soundManager.playBookOpen();
            onOpenKeywords();
          }}
          className="bg-[#0f0f14]/85 hover:bg-black/95 text-[#f0f0f0] hover:text-[#c9a227] border border-white/30 hover:border-[#c9a227] backdrop-blur-sm px-3 py-1.5 text-xs font-medium rounded-none font-['Noto_Sans_KR'] tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-200 flex items-center gap-1.5"
          title="키워드 목록 (퍼즐)"
        >
          <Puzzle className="w-3.5 h-3.5 text-[#c9a227]" />
          <span>키워드 목록</span>
          <span className="bg-[#c9a227] text-[#0b0a08] font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {keywordCount}
          </span>
        </button>
      </div>
    </div>
  );
};
