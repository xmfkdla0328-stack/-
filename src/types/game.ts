export interface Keyword {
  id: string;
  name: string;
  desc: string;
}

export interface Recipe {
  id: string;
  ingredients: [string, string];
  result: string;
  dontConsume?: boolean;
}

export interface Choice {
  text: string;
  targetId: string;
  requiredKeyword?: string;
  lockedNote?: string;
}

export interface Passage {
  id: string;
  speaker?: string;
  dayText?: string;
  subText?: string;
  location?: string;
  bannerImage?: string;
  charSprite?: string;
  charSpriteLeft?: string;
  text: string;
  choices?: Choice[];
  keywordsToGrant?: string[];
  nextPassageId?: string;
  tutorialNotice?: string;
  isClickable?: boolean;
  isChapterScreen?: boolean;
  isEndingScreen?: boolean;
  isBlackScreen?: boolean;
}

export interface LogEntry {
  id: string;
  speaker: string;
  text: string;
  dayText?: string;
  location?: string;
}

export interface SaveSlot {
  id: number;
  date: string;
  dayText: string;
  location: string;
  passageId: string;
  preview: string;
  keywords: string[];
  visitedNodes: string[];
}
