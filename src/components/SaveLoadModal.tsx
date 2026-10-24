import React, { useState, useEffect } from 'react';
import { SaveSlot } from '../types/game';
import { soundManager } from '../utils/sound';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDayText?: string;
  currentLocation: string;
  currentPassageId: string;
  previewText: string;
  keywords: string[];
  visitedNodes: string[];
  onLoadSave: (save: SaveSlot) => void;
}

const STORAGE_KEY = 'anagnorisis_save_slots';

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  currentDayText = 'DAY 1',
  currentLocation,
  currentPassageId,
  previewText,
  keywords,
  visitedNodes,
  onLoadSave,
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([null, null, null, null]);
  const [notice, setNotice] = useState<string>('');
  const [confirmSlotIdx, setConfirmSlotIdx] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSlots(parsed);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    soundManager.playClick();
    setConfirmSlotIdx(null);
    onClose();
  };

  const handleSlotClick = (slotIdx: number, slot: SaveSlot | null) => {
    if (activeTab === 'save') {
      soundManager.playClick();
      setConfirmSlotIdx(slotIdx);
    } else if (slot) {
      handleLoadFromSlot(slot);
    }
  };

  const handleExecuteSave = (slotIdx: number) => {
    soundManager.playClick();
    const newSlot: SaveSlot = {
      id: slotIdx,
      date: new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dayText: currentDayText,
      location: currentLocation,
      passageId: currentPassageId,
      preview: previewText.slice(0, 48) + '...',
      keywords: [...keywords],
      visitedNodes: [...visitedNodes],
    };

    const updated = [...slots];
    updated[slotIdx] = newSlot;
    setSlots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNotice(`슬롯 ${slotIdx + 1}에 저장되었습니다.`);
    setConfirmSlotIdx(null);
    setTimeout(() => setNotice(''), 2500);
  };

  const handleLoadFromSlot = (slot: SaveSlot | null) => {
    if (!slot) return;
    soundManager.playClick();
    onLoadSave(slot);
    onClose();
  };

  const handleDeleteSlot = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    if (confirmSlotIdx === slotIdx) {
      setConfirmSlotIdx(null);
    }
    const updated = [...slots];
    updated[slotIdx] = null;
    setSlots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060503]/80 backdrop-blur-sm px-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] bg-gradient-to-b from-[#1d1810] to-[#17140f] border border-[#3a2f1d] shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95)] max-h-[82vh] flex flex-col animate-card-in"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-[2px] bg-[#c9a227]" />
        <div className="corner-bracket tl" />
        <div className="corner-bracket tr" />
        <div className="corner-bracket bl" />
        <div className="corner-bracket br" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2a2216] shrink-0 font-['Noto_Sans_KR']">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#c9a227] rotate-45" />
            <h3 className="m-0 text-xs tracking-[0.18em] text-[#c9a227] uppercase font-medium">
              기록 관리 [SAVES &amp; LOAD]
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 border border-[#3a2f1d] hover:border-[#8a6f1c] text-[#a89a7c] hover:text-[#c9a227] flex items-center justify-center cursor-pointer transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2216] shrink-0 font-['Noto_Sans_KR']">
          <button
            onClick={() => {
              soundManager.playClick();
              setConfirmSlotIdx(null);
              setActiveTab('save');
            }}
            className={`flex-1 py-3 text-xs tracking-[0.1em] border-b-2 transition-colors cursor-pointer ${
              activeTab === 'save'
                ? 'text-[#c9a227] border-[#c9a227] bg-[#c9a227]/[0.04]'
                : 'text-[#6f6350] border-transparent hover:text-[#a89a7c]'
            }`}
          >
            진행 상황 저장
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setConfirmSlotIdx(null);
              setActiveTab('load');
            }}
            className={`flex-1 py-3 text-xs tracking-[0.1em] border-b-2 transition-colors cursor-pointer ${
              activeTab === 'load'
                ? 'text-[#c9a227] border-[#c9a227] bg-[#c9a227]/[0.04]'
                : 'text-[#6f6350] border-transparent hover:text-[#a89a7c]'
            }`}
          >
            불러오기
          </button>
        </div>

        {notice && (
          <div className="text-center text-xs text-[#c9a227] py-2 bg-[#c9a227]/10 font-['Noto_Sans_KR']">
            {notice}
          </div>
        )}

        {/* Slots List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 font-['Noto_Sans_KR']">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              onClick={() => handleSlotClick(idx, slot)}
              className={`p-3.5 border transition-all text-left ${
                slot
                  ? 'border-[#3a2f1d] hover:border-[#c9a227] bg-black/30 hover:bg-[#c9a227]/[0.06] cursor-pointer'
                  : activeTab === 'save'
                  ? 'border-dashed border-[#2a2216] hover:border-[#8a6f1c] bg-black/10 cursor-pointer'
                  : 'border-dashed border-[#2a2216] bg-black/10 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs text-[#c9a227] font-semibold">
                  SLOT {idx + 1}
                </span>
                {slot && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6f6350] font-mono">{slot.date}</span>
                    <button
                      onClick={(e) => handleDeleteSlot(idx, e)}
                      title="삭제"
                      className="text-[#6f6350] hover:text-[#8a3a30] text-xs px-1 cursor-pointer"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {slot ? (
                <div>
                  <div className="text-[11px] text-[#a89a7c] flex gap-3 mb-1 font-mono">
                    <span>{slot.dayText}</span>
                    <span>{slot.location}</span>
                    <span>키워드 {slot.keywords.length}개</span>
                  </div>
                  <p className="text-xs text-[#e9e1cf] line-clamp-1 m-0 font-['Noto_Serif_KR']">
                    {slot.preview}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-[#6f6350] italic py-1">
                  {activeTab === 'save' ? '클릭하여 현재 위치 저장' : '저장된 데이터 없음'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Confirmation Dialog Overlay */}
        {confirmSlotIdx !== null && (
          <div
            onClick={() => {
              soundManager.playClick();
              setConfirmSlotIdx(null);
            }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] bg-gradient-to-b from-[#1d1810] to-[#15120c] border border-[#c9a227] p-6 text-center shadow-[0_20px_40px_rgba(0,0,0,0.95)] animate-card-in"
            >
              <div className="corner-bracket tl" style={{ borderColor: '#c9a227' }} />
              <div className="corner-bracket tr" style={{ borderColor: '#c9a227' }} />
              <div className="corner-bracket bl" style={{ borderColor: '#c9a227' }} />
              <div className="corner-bracket br" style={{ borderColor: '#c9a227' }} />

              <div className="text-[11px] font-mono tracking-[0.25em] text-[#c9a227] uppercase font-semibold mb-2">
                SLOT {confirmSlotIdx + 1}
              </div>

              <div className="text-[15px] sm:text-[16px] text-[#e9e1cf] font-['Noto_Serif_KR'] font-medium mb-1.5">
                저장하시겠습니까?
              </div>

              {slots[confirmSlotIdx] && (
                <p className="text-[11.5px] text-[#a89a7c] font-['Noto_Sans_KR'] mb-4">
                  기존에 저장된 기록 위에 덮어씁니다.
                </p>
              )}

              <div className="flex gap-3 justify-center mt-5 font-['Noto_Sans_KR']">
                <button
                  onClick={() => handleExecuteSave(confirmSlotIdx)}
                  className="px-6 py-2 bg-[#c9a227]/20 hover:bg-[#c9a227]/35 border border-[#c9a227] text-[#e9e1cf] hover:text-white text-xs font-semibold tracking-widest transition-colors cursor-pointer"
                >
                  네
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setConfirmSlotIdx(null);
                  }}
                  className="px-6 py-2 bg-black/40 hover:bg-[#2b2114] border border-[#3a2f1d] hover:border-[#8a6f1c] text-[#a89a7c] hover:text-[#e9e1cf] text-xs tracking-widest transition-colors cursor-pointer"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
