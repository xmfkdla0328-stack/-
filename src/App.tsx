import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FastForward } from 'lucide-react';
import { PASSAGES, KEYWORDS, RECIPES, KEYWORD_UPDATES } from './data/storyData';
import { LogEntry, SaveSlot } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { ChapterIntro } from './components/ChapterIntro';
import { SceneBanner } from './components/SceneBanner';
import { DialogueBox } from './components/DialogueBox';
import { KeywordPopup } from './components/KeywordPopup';
import { MemoryModal } from './components/MemoryModal';
import { BacklogModal } from './components/BacklogModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { SettingsModal } from './components/SettingsModal';
import { TopToolbar } from './components/TopToolbar';
import { EndingScreen } from './components/EndingScreen';
import { soundManager } from './utils/sound';

type GameScreen = 'title' | 'chapter_intro' | 'game' | 'ending';

const AUTO_SAVE_KEY = 'anagnorisis_autosave';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [currentPassageId, setCurrentPassageId] = useState<string>('Intro1');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [historyLog, setHistoryLog] = useState<LogEntry[]>([]);
  const [pendingPopupKeywords, setPendingPopupKeywords] = useState<string[] | null>(null);

  // Alert/Tutorial modal
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

  // Skip feature states
  const [skipToast, setSkipToast] = useState<string | null>(null);
  const [revealChoicesTrigger, setRevealChoicesTrigger] = useState(0);
  const [forceInstantText, setForceInstantText] = useState(false);
  const skipToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [memoryModalTab, setMemoryModalTab] = useState<'list' | 'combo'>('list');
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Preferences
  const [textSpeed, setTextSpeed] = useState<'slow' | 'normal' | 'fast' | 'instant'>('normal');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [hasSave, setHasSave] = useState(false);

  // Check for auto-save on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        setHasSave(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const currentPassage = useMemo(() => {
    return PASSAGES[currentPassageId] || PASSAGES['Intro1'];
  }, [currentPassageId]);

  // Record dialogue to backlog
  const recordHistory = useCallback((passageId: string) => {
    const p = PASSAGES[passageId];
    if (!p) return;
    setHistoryLog((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].text === p.text) return prev;
      return [
        ...prev,
        {
          id: `${passageId}_${Date.now()}`,
          speaker: p.speaker || '',
          text: p.text,
          dayText: p.dayText,
          location: p.location,
        },
      ];
    });
  }, []);

  // Grant keywords and trigger popup if new
  const grantKeywords = useCallback((kwsToGrant: string[]) => {
    setKeywords((prev) => {
      const newItems = kwsToGrant.filter((id) => !prev.includes(id));
      if (newItems.length > 0) {
        setPendingPopupKeywords(newItems);
        return [...prev, ...newItems];
      }
      return prev;
    });
  }, []);

  // Transition to a passage
  const goToPassage = useCallback(
    (targetId: string) => {
      const target = PASSAGES[targetId];
      if (!target) return;

      // Handle screen changes
      if (target.isChapterScreen) {
        setCurrentPassageId(targetId);
        setScreen('chapter_intro');
        return;
      }

      if (target.isEndingScreen) {
        setCurrentPassageId(targetId);
        setScreen('ending');
        recordHistory(targetId);
        setVisitedNodes((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
        return;
      }

      setCurrentPassageId(targetId);
      setScreen('game');
      recordHistory(targetId);

      // Track visited nodes
      setVisitedNodes((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));

      // Check keywords
      if (target.keywordsToGrant && target.keywordsToGrant.length > 0) {
        grantKeywords(target.keywordsToGrant);
      }

      // Check keyword updates
      if (KEYWORD_UPDATES[targetId] && !visitedNodes.includes(targetId)) {
        const update = KEYWORD_UPDATES[targetId];
        setTimeout(() => {
          soundManager.playKeywordChime();
          setAlertInfo({
            title: '단서 정보 갱신',
            message: `[${update.name}]의 새로운 정보가 추가되었습니다!\n\n"${update.desc}"`,
          });
        }, 500);
      }

      // Check tutorial notices
      if (target.tutorialNotice && !visitedNodes.includes(targetId)) {
        setTimeout(() => {
          setAlertInfo({
            title: '💡 튜토리얼',
            message: target.tutorialNotice!,
          });
        }, 500);
      }

      // Auto-save
      try {
        const autoSaveData: SaveSlot = {
          id: 0,
          date: new Date().toLocaleString(),
          dayText: target.dayText || 'DAY 1',
          location: target.location || '엘리사이 에데스',
          passageId: targetId,
          preview: target.text.slice(0, 48),
          keywords: keywords,
          visitedNodes: visitedNodes,
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
        setHasSave(true);
      } catch {
        // ignore
      }
    },
    [grantKeywords, recordHistory, keywords, visitedNodes]
  );

  const handleStartGame = () => {
    goToPassage('Intro1');
  };

  const handleContinueGame = () => {
    try {
      const raw = localStorage.getItem(AUTO_SAVE_KEY);
      if (raw) {
        const data: SaveSlot = JSON.parse(raw);
        setCurrentPassageId(data.passageId);
        setKeywords(data.keywords || []);
        setVisitedNodes(data.visitedNodes || []);
        const passageObj = PASSAGES[data.passageId];
        const screenMode: GameScreen = passageObj?.isChapterScreen
          ? 'chapter_intro'
          : passageObj?.isEndingScreen
          ? 'ending'
          : 'game';
        setScreen(screenMode);
        recordHistory(data.passageId);
        return;
      }
    } catch {
      // fallback
    }
    goToPassage('Intro1');
  };

  const handleChapterAdvance = () => {
    goToPassage('Story1');
  };

  const handleAdvanceDialogue = () => {
    if (currentPassage.nextPassageId) {
      goToPassage(currentPassage.nextPassageId);
    }
  };

  const handleSelectChoice = (targetId: string) => {
    if (targetId === 'ACTION_OPEN_COMBO') {
      soundManager.playBookOpen();
      setMemoryModalTab('combo');
      setIsMemoryModalOpen(true);
      return;
    }
    if (targetId === 'ACTION_TITLE') {
      soundManager.playClick();
      setScreen('title');
      return;
    }
    goToPassage(targetId);
  };

  const handleCombineSuccess = (newKw: string, consumed: string[]) => {
    if (newKw === 'kw_trio') {
      setKeywords(['kw_cyrene', 'kw_trio']);
      setIsMemoryModalOpen(false);
      setAlertInfo({
        title: '핵심 단서 도출 완료!',
        message:
          '모든 단서가 하나의 가능성으로 이어졌습니다!\n\n[셋이 함께 있을 가능성]\n\n(잔여 키워드: 키레네, 셋이 함께 있을 가능성)',
      });
      return;
    }

    setKeywords((prev) => {
      const filtered = prev.filter((k) => !consumed.includes(k));
      if (!filtered.includes(newKw)) {
        filtered.push(newKw);
      }
      return filtered;
    });

    setIsMemoryModalOpen(false);
    setAlertInfo({
      title: '조합 성공!',
      message: `새로운 단서를 얻었습니다!\n\n[${KEYWORDS[newKw]?.name || newKw}]`,
    });
  };

  const handleLoadSaveSlot = (slot: SaveSlot) => {
    setCurrentPassageId(slot.passageId);
    setKeywords(slot.keywords || []);
    setVisitedNodes(slot.visitedNodes || []);
    const passageObj = PASSAGES[slot.passageId];
    const screenMode: GameScreen = passageObj?.isChapterScreen
      ? 'chapter_intro'
      : passageObj?.isEndingScreen
      ? 'ending'
      : 'game';
    setScreen(screenMode);
    recordHistory(slot.passageId);
    soundManager.playAdvance();
  };

  const handleResetGame = () => {
    setCurrentPassageId('Intro1');
    setKeywords([]);
    setVisitedNodes([]);
    setHistoryLog([]);
    setPendingPopupKeywords(null);
    setScreen('title');
  };

  const toggleMute = () => {
    const isNowMuted = soundManager.toggleMute();
    setIsMuted(isNowMuted);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    soundManager.setVolume(vol);
  };

  // Dynamic choices computation for Story11_Hub, Story13, Story21, Story24
  const computedChoices = useMemo(() => {
    if (currentPassageId === 'Story11_Hub') {
      const visited11_1 = visitedNodes.includes('Story11_1');
      const visited11_2 = visitedNodes.includes('Story11_2_2');

      const choices = [
        { text: '>> 언제부터 없었던 거야?', targetId: 'Story11_1' },
        { text: '>> 어디 갔는지 알아?', targetId: 'Story11_2_1' },
      ];

      // If both questions were asked, allow proceeding to search!
      if (visited11_1 && visited11_2) {
        choices.push({ text: '>> 직접 찾으러 가본다.', targetId: 'Story11_3' });
      }

      return choices;
    }

    if (currentPassageId === 'Story13') {
      if (keywords.includes('kw_absent')) {
        return [{ text: '>> 생각 정리 완료 (다음으로 진행)', targetId: 'Story14' }];
      }
      return [
        {
          text: '>> [단서 조합] 열어 파트너의 행방 추리하기',
          targetId: 'ACTION_OPEN_COMBO',
        },
      ];
    }

    if (currentPassageId === 'Story21' || currentPassageId === 'Story21_Hub') {
      const visitedDanheng = visitedNodes.includes('Story22_2');

      const choices = [
        { text: '>> 자리를 비운 사람 중 키레네에 대해 물어본다.', targetId: 'Story22_1' },
        { text: '>> 자리를 비운 사람 중 단항에 대해 물어본다.', targetId: 'Story22_2' },
        { text: '>> 자리를 비운 사람 중 스텔레에 대해 물어본다.', targetId: 'Story22_3_1' },
        { text: '>> 자리를 비운 사람 중 손님에 대해 물어본다.', targetId: 'Story22_4' },
      ];

      // Only activated after Dan Heng script (Story22_2) has been read!
      if (visitedDanheng) {
        choices.push({ text: '>> 이 정도면 충분하다.', targetId: 'Story22_5' });
      }

      return choices;
    }

    if (currentPassageId === 'Story24') {
      if (keywords.includes('kw_trio')) {
        return [{ text: '>> 생각 정리 완료 (다음으로 진행)', targetId: 'Story25' }];
      }
      return [
        {
          text: '>> [단서 조합] 열어 파트너의 행방 추리하기',
          targetId: 'ACTION_OPEN_COMBO',
        },
      ];
    }

    return currentPassage.choices;
  }, [currentPassageId, visitedNodes, keywords, currentPassage.choices]);

  const customKeywordDescs = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [passageId, update] of Object.entries(KEYWORD_UPDATES)) {
      if (visitedNodes.includes(passageId)) {
        map[update.id] = update.desc;
      }
    }
    return map;
  }, [visitedNodes]);

  const showSkipToast = useCallback((msg: string) => {
    if (skipToastTimerRef.current) clearTimeout(skipToastTimerRef.current);
    setSkipToast(msg);
    skipToastTimerRef.current = setTimeout(() => {
      setSkipToast(null);
    }, 1800);
  }, []);

  // Determine if a passage acts as an interactive trigger (choices, tutorial, keywords, endings)
  const isTriggerNode = useCallback((pid: string) => {
    const p = PASSAGES[pid];
    if (!p) return true;

    // 1. Static or hub/combo choices
    if (p.choices && p.choices.length > 0) return true;
    if (['Story11_Hub', 'Story13', 'Story21', 'Story21_Hub', 'Story24'].includes(pid)) return true;

    // 2. Tutorial notices
    if (p.tutorialNotice && p.tutorialNotice.length > 0) return true;

    // 3. New keywords granted
    if (p.keywordsToGrant && p.keywordsToGrant.length > 0) return true;

    // 4. Keyword update notifications
    if (KEYWORD_UPDATES[pid]) return true;

    // 5. Chapter transition screen or ending screen
    if (p.isChapterScreen || p.isEndingScreen) return true;

    // 6. Terminal passage / Ending screen
    if (!p.nextPassageId) return true;

    return false;
  }, []);

  // Fast forward / Skip directly up to the next trigger point
  const handleSkipToTrigger = useCallback(() => {
    if (screen !== 'game') return;

    if (isAutoPlay) {
      setIsAutoPlay(false);
    }

    const currentHasChoices =
      (computedChoices && computedChoices.length > 0) ||
      (currentPassage.choices && currentPassage.choices.length > 0);

    // If already at a passage with choices, reveal them immediately
    if (currentHasChoices) {
      soundManager.playSkip();
      setRevealChoicesTrigger((prev) => prev + 1);
      showSkipToast('선택지가 있는 구간입니다.');
      return;
    }

    // Traverse forward to find the next interactive trigger
    let curr = currentPassage.nextPassageId;
    if (!curr) {
      showSkipToast('더 이상 스킵할 수 있는 구간이 없습니다.');
      return;
    }

    const passedNodes: string[] = [];
    let targetId: string | null = null;
    let steps = 0;

    while (curr && steps < 120) {
      steps++;
      passedNodes.push(curr);
      if (isTriggerNode(curr)) {
        targetId = curr;
        break;
      }
      curr = PASSAGES[curr]?.nextPassageId;
    }

    if (!targetId) {
      showSkipToast('더 이상 스킵할 수 있는 구간이 없습니다.');
      return;
    }

    const intermediateNodes = passedNodes.slice(0, passedNodes.length - 1);

    // Add intermediate dialogues into backlog log so nothing is missed
    if (intermediateNodes.length > 0) {
      setHistoryLog((prev) => {
        const newEntries = [...prev];
        intermediateNodes.forEach((nodeId) => {
          const p = PASSAGES[nodeId];
          if (p) {
            newEntries.push({
              id: `${nodeId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              speaker: p.speaker || '',
              text: p.text,
              dayText: p.dayText,
              location: p.location,
            });
          }
        });
        return newEntries;
      });

      // Mark intermediate nodes as visited
      setVisitedNodes((prev) => {
        const set = new Set([...prev, ...intermediateNodes]);
        return Array.from(set);
      });

      // Grant intermediate keywords
      const intermediateKeywords: string[] = [];
      intermediateNodes.forEach((nodeId) => {
        const p = PASSAGES[nodeId];
        if (p?.keywordsToGrant) {
          intermediateKeywords.push(...p.keywordsToGrant);
        }
      });
      if (intermediateKeywords.length > 0) {
        grantKeywords(intermediateKeywords);
      }
    }

    soundManager.playSkip();
    setForceInstantText(true);
    setRevealChoicesTrigger((prev) => prev + 1);

    const targetObj = PASSAGES[targetId];
    const isChoiceTarget =
      (targetObj?.choices && targetObj.choices.length > 0) ||
      ['Story11_Hub', 'Story13', 'Story21', 'Story21_Hub', 'Story24'].includes(targetId);

    if (isChoiceTarget) {
      showSkipToast('선택지 구간까지 스킵되었습니다.');
    } else if (targetObj?.tutorialNotice) {
      showSkipToast('안내 구간까지 스킵되었습니다.');
    } else {
      showSkipToast('스킵 완료');
    }

    goToPassage(targetId);

    setTimeout(() => {
      setForceInstantText(false);
    }, 400);
  }, [
    screen,
    isAutoPlay,
    computedChoices,
    currentPassage,
    isTriggerNode,
    showSkipToast,
    grantKeywords,
    goToPassage,
  ]);

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#e9e1cf] flex flex-col justify-between py-5 px-3 sm:px-6 select-none relative">
      {/* Skip Feedback Notification Toast */}
      {skipToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in flex items-center gap-2 bg-[#17140f]/95 border border-[#c9a227] text-[#e9e1cf] px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.85)] text-xs font-['Noto_Sans_KR'] tracking-wider rounded-sm">
          <FastForward className="w-3.5 h-3.5 text-[#c9a227] animate-pulse" />
          <span>{skipToast}</span>
        </div>
      )}

      {/* 1) Title Screen overlay */}
      {screen === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          hasSave={hasSave}
          onContinue={handleContinueGame}
        />
      )}

      {/* 2) Chapter 1 Intro overlay */}
      {screen === 'chapter_intro' && (
        <ChapterIntro onAdvance={handleChapterAdvance} />
      )}

      {/* 3) Ending / Chapter Clear Screen overlay (Chapter Title style) */}
      {screen === 'ending' && (
        <EndingScreen
          endingTag={currentPassage.subText || (currentPassageId === 'Story47' ? 'CHAPTER.01 CLEAR' : 'NORMAL ENDING _ 01')}
          title={
            currentPassageId === 'Story47'
              ? (currentPassage.text || '행운의 아이 · Mr. Lucky')
              : (currentPassage.text?.split('\n\n')[1] || '"The only way to harm her is to stay by her side forever."')
          }
          quote={
            currentPassageId === 'Story47'
              ? '뒤늦게 합류한 키레네까지 포함하여, 함께 즐긴 잔치는 무척이나 즐거웠습니다.\n그야말로, 꿈처럼요.'
              : '적어도, 당신이 그녀의 곁에 머무름으로써\n그녀를 해할 일은 없게 되었으니까요♩'
          }
          badgeText={
            currentPassageId === 'Story47'
              ? '✦ CHAPTER 01 클리어 ✦'
              : '✦ 노멀 엔딩 01 달성 ✦'
          }
          onReturnToChoice={() => goToPassage('Story27')}
          onReturnToTitle={() => {
            soundManager.playClick();
            setScreen('title');
          }}
          onOpenLog={() => setIsLogModalOpen(true)}
        />
      )}

      {/* 4) Main Visual Novel Game Screen */}
      {screen === 'game' && (
        <div className="w-full max-w-[720px] mx-auto my-auto flex flex-col">
          {/* Top Control Toolbar */}
          <TopToolbar
            isMuted={isMuted}
            onToggleMute={toggleMute}
            isAutoPlay={isAutoPlay}
            onToggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
            onSkipToTrigger={handleSkipToTrigger}
            onOpenLog={() => setIsLogModalOpen(true)}
            onOpenSave={() => setIsSaveModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />

          {/* Visual Novel Stage */}
          <div className="w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
            {/* Location Banner (Displayed when in story chapters) */}
            {currentPassage.bannerImage && (
              <SceneBanner
                dayText={currentPassage.dayText}
                location={currentPassage.location}
                bannerImage={currentPassage.bannerImage}
                charSprite={currentPassage.charSprite}
                charSpriteLeft={currentPassage.charSpriteLeft}
                keywordCount={keywords.length}
                onOpenCombo={() => {
                  setMemoryModalTab('combo');
                  setIsMemoryModalOpen(true);
                }}
                onOpenKeywords={() => {
                  setMemoryModalTab('list');
                  setIsMemoryModalOpen(true);
                }}
              />
            )}

            {/* Fixed-Size Dialogue Box (270px 고정 높이) */}
            <DialogueBox
              speaker={currentPassage.speaker}
              text={currentPassage.text}
              choices={computedChoices}
              hasAdvance={Boolean(currentPassage.nextPassageId) && (!computedChoices || computedChoices.length === 0)}
              onAdvance={handleAdvanceDialogue}
              onSelectChoice={handleSelectChoice}
              keywords={keywords}
              textSpeed={textSpeed}
              isAutoPlay={isAutoPlay}
              forceInstantText={forceInstantText}
              revealChoicesTrigger={revealChoicesTrigger}
            />
          </div>

          {/* Bottom Controls / Reset */}
          <div className="mt-5 flex justify-center items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                handleResetGame();
              }}
              className="bg-transparent border border-[#3a2f1d] hover:border-[#8a3a30] text-[#6f6350] hover:text-[#e9e1cf] font-['Noto_Sans_KR'] text-xs px-3.5 py-1.5 transition-colors cursor-pointer"
            >
              회차 초기화 (테스트)
            </button>
          </div>

          {/* Dev Note matching original Twine */}
          <footer className="mt-4 font-['Noto_Sans_KR'] text-[11px] text-[#6f6350] leading-relaxed border-t border-dashed border-[#2a2216] pt-3 text-center">
            <strong>DEV NOTE.</strong> &lt;눈 먼 태양의 밤&gt; 붕괴:스타레일 '파이논 × 스텔레' 팬게임.
            대화창 크기는 270px로 안정적으로 고정되어 있습니다. 획득한 단서를 조합하여 실마리를 풀어보세요.
          </footer>
        </div>
      )}

      {/* Alert / Tutorial Modal */}
      {alertInfo && (
        <div
          onClick={() => setAlertInfo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060503]/80 backdrop-blur-sm px-4 select-none animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[380px] bg-gradient-to-b from-[#1d1810] to-[#17140f] border border-[#8a6f1c] shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95)] p-6 text-center animate-card-in"
          >
            <div className="corner-bracket tl" />
            <div className="corner-bracket tr" />
            <div className="corner-bracket bl" />
            <div className="corner-bracket br" />
            <div className="text-xs font-['Noto_Sans_KR'] tracking-[0.2em] text-[#c9a227] uppercase font-semibold mb-3">
              {alertInfo.title}
            </div>
            <div className="text-[13.5px] leading-relaxed text-[#e9e1cf] font-['Noto_Serif_KR'] whitespace-pre-line mb-5">
              {alertInfo.message}
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setAlertInfo(null);
              }}
              className="px-6 py-2 bg-[#c9a227]/20 hover:bg-[#c9a227]/35 border border-[#c9a227] text-[#e9e1cf] text-xs font-['Noto_Sans_KR'] tracking-wider cursor-pointer transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Keyword Acquired Popup */}
      {pendingPopupKeywords && (
        <KeywordPopup
          keywordIds={pendingPopupKeywords}
          onClose={() => setPendingPopupKeywords(null)}
        />
      )}

      {/* Memory Fragments / Keyword & Combo Modal */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        initialTab={memoryModalTab}
        onClose={() => setIsMemoryModalOpen(false)}
        keywords={keywords}
        onCombineSuccess={handleCombineSuccess}
        customKeywordDescs={customKeywordDescs}
      />

      {/* Dialogue Backlog Modal */}
      <BacklogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        history={historyLog}
      />

      {/* Save & Load Modal */}
      <SaveLoadModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentDayText={currentPassage.dayText || 'DAY 1'}
        currentLocation={currentPassage.location || '엘리사이 에데스'}
        currentPassageId={currentPassageId}
        previewText={currentPassage.text}
        keywords={keywords}
        visitedNodes={visitedNodes}
        onLoadSave={handleLoadSaveSlot}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        textSpeed={textSpeed}
        onChangeTextSpeed={setTextSpeed}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        volume={volume}
        onChangeVolume={handleVolumeChange}
        onResetGame={() => {
          handleResetGame();
          setScreen('title');
        }}
      />
    </div>
  );
}
