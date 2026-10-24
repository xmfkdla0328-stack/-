import React, { useState } from 'react';
import { KEYWORDS, RECIPES } from '../data/storyData';
import { soundManager } from '../utils/sound';

interface MemoryModalProps {
  isOpen: boolean;
  initialTab?: 'list' | 'combo';
  onClose: () => void;
  keywords: string[];
  onCombineSuccess: (newKeyword: string, consumedKeywords: string[]) => void;
  customKeywordDescs?: Record<string, string>;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  initialTab = 'list',
  onClose,
  keywords,
  onCombineSuccess,
  customKeywordDescs,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'combo'>(initialTab);
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync tab when opening
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSlot1(null);
      setSlot2(null);
      setStatusMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  const handleToggleSlotKw = (id: string) => {
    soundManager.playClick();
    setStatusMsg(null);
    if (slot1 === id) {
      setSlot1(null);
    } else if (slot2 === id) {
      setSlot2(null);
    } else if (!slot1) {
      setSlot1(id);
    } else if (!slot2) {
      setSlot2(id);
    } else {
      soundManager.playCombineFail();
    }
  };

  const handleClearSlot = (num: 1 | 2) => {
    soundManager.playClick();
    setStatusMsg(null);
    if (num === 1) setSlot1(null);
    if (num === 2) setSlot2(null);
  };

  const bothFilled = !!slot1 && !!slot2;

  const handleTryCombine = () => {
    if (!slot1 || !slot2) {
      soundManager.playCombineFail();
      return;
    }

    const recipe = RECIPES.find(
      (r) =>
        (r.ingredients[0] === slot1 && r.ingredients[1] === slot2) ||
        (r.ingredients[0] === slot2 && r.ingredients[1] === slot1)
    );

    if (recipe) {
      if (keywords.includes(recipe.result)) {
        soundManager.playCombineFail();
        setStatusMsg('이미 도출해 낸 결론입니다.');
        return;
      }
      soundManager.playCombineSuccess();
      const resultKw = recipe.result;
      const consumed = recipe.dontConsume ? [] : [slot1, slot2];
      setSlot1(null);
      setSlot2(null);
      setStatusMsg(null);
      onCombineSuccess(resultKw, consumed);
    } else {
      soundManager.playCombineFail();
      setStatusMsg('두 단서 사이에 특별한 연결고리가 없는 것 같습니다.');
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060503]/80 backdrop-blur-sm px-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-gradient-to-b from-[#1d1810] via-[#141009] to-[#17140f] border border-[#8a6f1c] shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95)] max-h-[85vh] flex flex-col animate-card-in"
        style={{
          clipPath:
            'polygon(0 14px, 14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
        }}
      >
        {/* Top gold bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-[2px] bg-[#c9a227]" />

        {/* 4 Corner brackets */}
        <div className="corner-bracket tl" />
        <div className="corner-bracket tr" />
        <div className="corner-bracket bl" />
        <div className="corner-bracket br" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2216] shrink-0 font-['Noto_Sans_KR']">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c9a227] rotate-45" />
            <h3 className="m-0 text-xs tracking-[0.25em] text-[#c9a227] uppercase font-semibold">
              {activeTab === 'list' ? '키워드 목록 (단서 사전)' : '단서 조합 (DEDUCTION)'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 border border-[#3a2f1d] hover:border-[#8a6f1c] text-[#a89a7c] hover:text-[#c9a227] flex items-center justify-center cursor-pointer transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#2a2216] shrink-0 font-['Noto_Sans_KR'] text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('list');
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'list'
                ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/[0.05] font-medium'
                : 'border-transparent text-[#6f6350] hover:text-[#a89a7c]'
            }`}
          >
            단서 열람 ({keywords.length})
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('combo');
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'combo'
                ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/[0.05] font-medium'
                : 'border-transparent text-[#6f6350] hover:text-[#a89a7c]'
            }`}
          >
            단서 조합
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-['Noto_Sans_KR'] text-center">
          {activeTab === 'list' ? (
            <div className="space-y-3 text-left">
              {keywords.length === 0 ? (
                <div className="text-center text-xs text-[#6f6350] py-8 italic">
                  획득한 키워드가 없습니다.
                </div>
              ) : (
                keywords.map((id) => {
                  const kw = KEYWORDS[id];
                  if (!kw) return null;
                  return (
                    <div
                      key={id}
                      className="p-3.5 bg-black/30 border border-[#2a2216] border-b-[#3a2f1d]"
                    >
                      <div className="font-semibold text-sm text-[#c9a227] mb-1">
                        [{kw.name}]
                      </div>
                      <div className="text-xs text-[#a89a7c] leading-relaxed font-['Noto_Serif_KR']">
                        {customKeywordDescs?.[id] || kw.desc}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div>
              <p className="combo-subtitle text-[11px] tracking-[0.08em] text-[#6f6350] mb-5">
                두 개의 키워드를 선택하여 새로운 단서를 추론합니다
              </p>

              {/* 2 Slots + Connecting Diamond */}
              <div className="flex items-center justify-center gap-0 mb-6">
                {/* Slot 1 */}
                <div
                  onClick={() => handleClearSlot(1)}
                  className={`w-32 h-[82px] border ${
                    slot1
                      ? 'border-[#c9a227] bg-[#c9a227]/[0.08] shadow-[0_0_18px_-4px_rgba(201,162,39,0.55),inset_0_0_14px_rgba(201,162,39,0.12)]'
                      : 'border-[#3a2f1d] bg-black/35'
                  } flex flex-col items-center justify-center gap-1.5 p-2 text-center cursor-pointer transition-all`}
                  style={{
                    clipPath:
                      'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                  }}
                >
                  <span
                    className={`text-[9.5px] tracking-[0.2em] font-mono ${
                      slot1 ? 'text-[#c9a227]' : 'text-[#6f6350]'
                    }`}
                  >
                    SLOT 01
                  </span>
                  <span
                    className={`text-[12.5px] leading-tight line-clamp-2 ${
                      slot1 ? 'text-[#e9e1cf] font-semibold' : 'text-[#8a6f1c]'
                    }`}
                  >
                    {slot1 ? KEYWORDS[slot1]?.name || slot1 : '키워드 선택'}
                  </span>
                </div>

                {/* Connecting Line with Diamond */}
                <div className="relative w-11 h-[1px] bg-[#3a2f1d] flex items-center justify-center shrink-0">
                  <span
                    className={`text-[10px] px-1 bg-[#17140f] transition-all ${
                      bothFilled
                        ? 'text-[#c9a227] shadow-[0_0_6px_#c9a227]'
                        : 'text-[#6f6350]'
                    }`}
                  >
                    ◆
                  </span>
                </div>

                {/* Slot 2 */}
                <div
                  onClick={() => handleClearSlot(2)}
                  className={`w-32 h-[82px] border ${
                    slot2
                      ? 'border-[#c9a227] bg-[#c9a227]/[0.08] shadow-[0_0_18px_-4px_rgba(201,162,39,0.55),inset_0_0_14px_rgba(201,162,39,0.12)]'
                      : 'border-[#3a2f1d] bg-black/35'
                  } flex flex-col items-center justify-center gap-1.5 p-2 text-center cursor-pointer transition-all`}
                  style={{
                    clipPath:
                      'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                  }}
                >
                  <span
                    className={`text-[9.5px] tracking-[0.2em] font-mono ${
                      slot2 ? 'text-[#c9a227]' : 'text-[#6f6350]'
                    }`}
                  >
                    SLOT 02
                  </span>
                  <span
                    className={`text-[12.5px] leading-tight line-clamp-2 ${
                      slot2 ? 'text-[#e9e1cf] font-semibold' : 'text-[#8a6f1c]'
                    }`}
                  >
                    {slot2 ? KEYWORDS[slot2]?.name || slot2 : '키워드 선택'}
                  </span>
                </div>
              </div>

              {/* Inventory Label */}
              <div className="flex justify-between items-baseline text-[11px] tracking-[0.15em] text-[#6f6350] border-b border-[#2a2216] pb-1.5 mb-2.5 text-left">
                <span>보유 키워드 (탭하여 선택/해제)</span>
                <span className="font-mono">{keywords.length}</span>
              </div>

              {/* Inventory Chip Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto mb-5 text-left">
                {keywords.length === 0 ? (
                  <div className="col-span-2 text-center text-xs text-[#6f6350] py-4">
                    획득한 키워드가 없습니다.
                  </div>
                ) : (
                  keywords.map((k) => {
                    const isSelected = slot1 === k || slot2 === k;
                    const kw = KEYWORDS[k];
                    if (!kw) return null;
                    return (
                      <button
                        key={k}
                        onClick={() => handleToggleSlotKw(k)}
                        className={`relative border text-left p-2.5 pr-6 text-xs leading-snug cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#c9a227] bg-[#c9a227]/[0.15] text-[#e9e1cf] shadow-[0_0_10px_-2px_rgba(201,162,39,0.5)]'
                            : 'border-[#3a2f1d] bg-black/25 text-[#a89a7c] hover:border-[#8a6f1c] hover:text-[#e9e1cf]'
                        }`}
                        style={{
                          clipPath:
                            'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
                        }}
                      >
                        <span>{kw.name}</span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-[#c9a227] text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {statusMsg && (
                <div className="text-[#e2b73f] text-xs mb-3 font-medium bg-black/40 border border-[#8a6f1c]/40 py-1.5 px-3 rounded">
                  {statusMsg}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleTryCombine}
                  disabled={!bothFilled}
                  className={`flex-1 py-2.5 border text-xs tracking-wider transition-all cursor-pointer font-medium ${
                    bothFilled
                      ? 'border-[#c9a227] bg-[#c9a227]/20 hover:bg-[#c9a227]/30 text-[#e9e1cf] shadow-[0_0_15px_rgba(201,162,39,0.4)]'
                      : 'border-[#2a2216] bg-black/20 text-[#6f6350] cursor-not-allowed opacity-50'
                  }`}
                >
                  조합하기 [COMBINE]
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 border border-[#3a2f1d] bg-transparent text-[#a89a7c] hover:text-[#e9e1cf] text-xs cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
