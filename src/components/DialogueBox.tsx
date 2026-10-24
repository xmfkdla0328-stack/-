import React, { useState, useEffect, useRef } from 'react';
import { Choice } from '../types/game';
import { soundManager } from '../utils/sound';

interface DialogueBoxProps {
  speaker?: string;
  text: string;
  choices?: Choice[];
  hasAdvance: boolean;
  onAdvance: () => void;
  onSelectChoice: (targetId: string) => void;
  keywords: string[];
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  isAutoPlay: boolean;
  forceInstantText?: boolean;
  revealChoicesTrigger?: number;
}

function renderFormattedMarkdown(str: string): React.ReactNode {
  const regex = /\*\*(.*?)\*\*/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      elements.push(str.slice(lastIndex, match.index));
    }
    elements.push(
      <strong key={match.index} className="font-bold text-[#ffffff] drop-shadow-[0_1px_4px_rgba(201,162,39,0.4)]">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    const remaining = str.slice(lastIndex).replace(/\*\*/g, '');
    elements.push(remaining);
  }

  return elements;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speaker,
  text,
  choices,
  hasAdvance,
  onAdvance,
  onSelectChoice,
  keywords,
  textSpeed,
  isAutoPlay,
  forceInstantText,
  revealChoicesTrigger,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [choicesRevealed, setChoicesRevealed] = useState(false);
  const isTypingComplete = displayedLength >= text.length || textSpeed === 'instant' || Boolean(forceInstantText);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textScrollRef = useRef<HTMLDivElement | null>(null);

  const hasChoices = Boolean(choices && choices.length > 0);
  const showChoices = Boolean(hasChoices && isTypingComplete && choicesRevealed);

  // External trigger (e.g. SKIP button) instantly finishes typing and reveals choices
  useEffect(() => {
    if (revealChoicesTrigger && revealChoicesTrigger > 0) {
      setDisplayedLength(text.length);
      if (hasChoices) {
        setChoicesRevealed(true);
      }
    }
  }, [revealChoicesTrigger, text.length, hasChoices]);

  // Typewriter effect & reset choice reveal on new text
  useEffect(() => {
    setChoicesRevealed(false);

    if (textSpeed === 'instant' || forceInstantText) {
      setDisplayedLength(text.length);
      return;
    }

    setDisplayedLength(0);
    const speedMs = textSpeed === 'slow' ? 40 : textSpeed === 'fast' ? 10 : 20;

    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          return text.length;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, textSpeed]);

  // Auto scroll down if text is longer than box
  useEffect(() => {
    if (textScrollRef.current) {
      textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
    }
  }, [displayedLength]);

  // Auto-play logic
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    if (isAutoPlay && isTypingComplete) {
      if (hasChoices && !choicesRevealed) {
        // Auto-reveal choices after reading delay
        autoPlayTimerRef.current = setTimeout(() => {
          soundManager.playAdvance();
          setChoicesRevealed(true);
        }, 2200);
      } else if (hasAdvance && !hasChoices) {
        // Auto-advance dialogue
        autoPlayTimerRef.current = setTimeout(() => {
          soundManager.playAdvance();
          onAdvance();
        }, 2200);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, isTypingComplete, hasAdvance, hasChoices, choicesRevealed, onAdvance]);

  const handleBoxClick = () => {
    // 1. If typing isn't finished, complete typing instantly
    if (!isTypingComplete) {
      setDisplayedLength(text.length);
      return;
    }

    // 2. If this passage has choices and they aren't shown yet: reveal choices upon click!
    if (hasChoices && !choicesRevealed) {
      soundManager.playAdvance();
      setChoicesRevealed(true);
      return;
    }

    // 3. If there are no choices and there is a next passage: advance dialogue
    if (hasAdvance && !hasChoices) {
      soundManager.playAdvance();
      onAdvance();
    }
  };

  const handleChoiceClick = (choice: Choice) => {
    if (choice.requiredKeyword && !keywords.includes(choice.requiredKeyword)) {
      soundManager.playCombineFail();
      return;
    }
    soundManager.playChoice();
    onSelectChoice(choice.targetId);
  };

  const currentText = textSpeed === 'instant' ? text : text.slice(0, displayedLength);

  return (
    <>
      {/* 1) Full-screen backdrop dimming when choices are active */}
      {showChoices && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClick();
            setChoicesRevealed(false);
          }}
          className="fixed inset-0 z-30 bg-black/65 backdrop-blur-[1.5px] transition-opacity duration-300 cursor-pointer"
          title="클릭하여 대화문 다시 보기"
          aria-hidden="true"
        />
      )}

      {/* 2) Fixed 270px Height Dialogue Box */}
      <div className="relative w-full h-[270px] select-none shrink-0 box-border">
        {/* Base Dialogue Box */}
        <div
          onClick={handleBoxClick}
          className={`relative w-full h-full bg-gradient-to-b from-[#1d1810] to-[#17140f] border border-[#3a2f1d] px-7 py-6 sm:px-8 sm:py-6 box-border shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)] overflow-hidden ${
            (!hasChoices && hasAdvance) || (hasChoices && !choicesRevealed)
              ? 'clickable-box cursor-pointer'
              : ''
          }`}
        >
          {/* Inner border line matching Twine .vn-box::before */}
          <div className="absolute inset-[6px] border border-[#2a2216] pointer-events-none" />

          {/* 4 Corner brackets */}
          <div className="corner-bracket tl" />
          <div className="corner-bracket tr" />
          <div className="corner-bracket bl" />
          <div className="corner-bracket br" />

          {/* Speaker Tag */}
          {speaker ? (
            <div className="speaker-tag font-['Noto_Sans_KR'] text-[14px] text-[#c9a227] font-bold mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#c9a227] rotate-45 shrink-0" />
              <span>{speaker}</span>
            </div>
          ) : (
            <div className="h-1" />
          )}

          {/* Text lines */}
          <div
            ref={textScrollRef}
            className="text-lines font-['Noto_Serif_KR'] text-[15.5px] sm:text-[16px] leading-[1.8] text-[#e9e1cf] h-[calc(100%-36px)] overflow-y-auto whitespace-pre-line pr-1"
          >
            {renderFormattedMarkdown(currentText)}
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#c9a227]/70 animate-pulse align-middle" />
            )}
          </div>

          {/* Click hint at bottom right */}
          {isTypingComplete && !showChoices && (
            <div className="click-hint absolute right-5 bottom-3.5 font-['Noto_Sans_KR'] text-[11px] text-[#6f6350] tracking-[0.08em] flex items-center gap-1.5 pointer-events-none">
              <span className="text-[#c9a227] animate-bob">▶</span>
              <span>{hasChoices ? '클릭하여 선택' : '클릭하여 진행'}</span>
            </div>
          )}
        </div>

        {/* 3) Choice Overlay: Superimposed ON TOP of the 270px dialogue box after click */}
        {showChoices && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 bg-gradient-to-b from-[#1d1810]/95 via-[#17140f]/98 to-[#130f0a]/98 border border-[#c9a227]/80 shadow-[0_0_40px_rgba(0,0,0,0.95),0_0_20px_rgba(201,162,39,0.2)] px-6 py-5 sm:px-8 sm:py-5 flex flex-col justify-center animate-card-in box-border"
          >
            {/* Inner accent line */}
            <div className="absolute inset-[5px] border border-[#c9a227]/20 pointer-events-none" />

            {/* Corner brackets */}
            <div className="corner-bracket tl" style={{ borderColor: '#c9a227' }} />
            <div className="corner-bracket tr" style={{ borderColor: '#c9a227' }} />
            <div className="corner-bracket bl" style={{ borderColor: '#c9a227' }} />
            <div className="corner-bracket br" style={{ borderColor: '#c9a227' }} />

            {/* Prompt Header */}
            <div className="text-center mb-3 shrink-0">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <div className="text-[11px] font-['Noto_Sans_KR'] tracking-[0.22em] text-[#c9a227] uppercase font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a227] rotate-45" />
                  <span>선택 [CHOICE]</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setChoicesRevealed(false);
                  }}
                  className="text-[11px] font-['Noto_Sans_KR'] text-[#6f6350] hover:text-[#a89a7c] tracking-wider transition-colors cursor-pointer"
                  title="대화 다시 읽기"
                >
                  ✕ 대화문 닫기
                </button>
              </div>

              {speaker ? (
                <div className="text-[12px] font-['Noto_Sans_KR'] text-[#a89a7c] tracking-wider text-left px-2">
                  <span className="text-[#e9e1cf] font-medium">[{speaker}]</span>의 말에 어떻게 반응하시겠습니까?
                </div>
              ) : (
                <div className="text-[12px] font-['Noto_Serif_KR'] text-[#a89a7c] italic line-clamp-1 px-2 text-left">
                  {renderFormattedMarkdown(text)}
                </div>
              )}
            </div>

            {/* Choice Buttons List */}
            <div className="flex flex-col gap-2.5 max-h-[175px] overflow-y-auto px-1 font-['Noto_Serif_KR']">
              {choices!.map((choice, idx) => {
                const isLocked = choice.requiredKeyword && !keywords.includes(choice.requiredKeyword);

                if (isLocked) {
                  return (
                    <div
                      key={idx}
                      onClick={() => soundManager.playCombineFail()}
                      className="w-full text-left bg-black/40 border border-[#3a2f1d] text-[#6f6350] text-[14.5px] px-4 py-2.5 sm:py-3 opacity-60 cursor-not-allowed flex flex-col gap-0.5 shadow-inner"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#6f6350] text-xs">🔒</span>
                        <span>{choice.text}</span>
                      </div>
                      {choice.lockedNote && (
                        <span className="text-xs text-[#8a6f1c] ml-5 font-['Noto_Sans_KR']">
                          {choice.lockedNote}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleChoiceClick(choice)}
                    className="group relative w-full text-left bg-[#1f1911]/90 hover:bg-[#2b2114] border border-[#3a2f1d] hover:border-[#c9a227] text-[#e9e1cf] hover:text-white text-[14.5px] sm:text-[15px] px-4 py-2.5 sm:py-3 transition-all duration-150 cursor-pointer hover:pl-6 leading-relaxed flex items-center gap-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                  >
                    {/* Golden left sliding accent bar */}
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c9a227] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />
                    <span className="text-[#c9a227] text-xs transition-transform group-hover:scale-125">◆</span>
                    <span className="drop-shadow-sm font-medium">{choice.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
