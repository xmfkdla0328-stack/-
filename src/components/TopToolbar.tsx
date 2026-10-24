import React from 'react';
import { Volume2, VolumeX, BookOpen, Save, Settings, Play, Pause, FastForward } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TopToolbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  onSkipToTrigger: () => void;
  onOpenLog: () => void;
  onOpenSave: () => void;
  onOpenSettings: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  isMuted,
  onToggleMute,
  isAutoPlay,
  onToggleAutoPlay,
  onSkipToTrigger,
  onOpenLog,
  onOpenSave,
  onOpenSettings,
}) => {
  return (
    <div className="w-full max-w-[720px] mx-auto mb-2 px-1 flex items-center justify-between text-xs font-['Noto_Sans_KR'] text-[#6f6350] select-none">
      <div className="flex items-center gap-2">
        <span className="font-['Cinzel',serif] tracking-[0.16em] text-[#a89a7c] text-xs font-semibold">
          ΑΝΑΓΝΩΡΙΣΙΣ
        </span>
        <span className="text-[#3a2f1d]">|</span>
        <span className="text-[11px] text-[#6f6350] tracking-wider hidden sm:inline">
          Phainon × Stelle
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Auto-play toggle */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleAutoPlay();
          }}
          className={`flex items-center gap-1 px-2 py-1 border transition-all cursor-pointer ${
            isAutoPlay
              ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/10'
              : 'border-[#2a2216] text-[#6f6350] hover:text-[#a89a7c]'
          }`}
          title="자동 진행 (Auto)"
        >
          {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span className="text-[10px] tracking-wider">AUTO</span>
        </button>

        {/* Skip to Trigger button */}
        <button
          onClick={() => {
            onSkipToTrigger();
          }}
          className="flex items-center gap-1 px-2 py-1 border border-[#2a2216] hover:border-[#c9a227] text-[#6f6350] hover:text-[#c9a227] transition-all cursor-pointer"
          title="선택지 / 안내 트리거까지 스킵"
        >
          <FastForward className="w-3 h-3 text-[#c9a227]" />
          <span className="text-[10px] tracking-wider">SKIP</span>
        </button>

        {/* Backlog */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenLog();
          }}
          className="flex items-center gap-1 px-2 py-1 border border-[#2a2216] hover:border-[#8a6f1c] text-[#6f6350] hover:text-[#e9e1cf] transition-all cursor-pointer"
          title="대화 로그 (Log)"
        >
          <BookOpen className="w-3 h-3" />
          <span className="text-[10px] tracking-wider hidden xs:inline">LOG</span>
        </button>

        {/* Save / Load */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSave();
          }}
          className="flex items-center gap-1 px-2 py-1 border border-[#2a2216] hover:border-[#8a6f1c] text-[#6f6350] hover:text-[#e9e1cf] transition-all cursor-pointer"
          title="저장 및 불러오기 (Save / Load)"
        >
          <Save className="w-3 h-3" />
          <span className="text-[10px] tracking-wider hidden xs:inline">SAVE</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            onToggleMute();
          }}
          className="p-1 border border-[#2a2216] hover:border-[#8a6f1c] text-[#6f6350] hover:text-[#c9a227] transition-all cursor-pointer"
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-1 border border-[#2a2216] hover:border-[#8a6f1c] text-[#6f6350] hover:text-[#e9e1cf] transition-all cursor-pointer"
          title="설정"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
