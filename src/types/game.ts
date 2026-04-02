// src/types/game.ts

export interface Location {
  id: string;
  name: string;
  description: string;
  weather: string;
  timeOfDay: string;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  isPresent: boolean;
  dialogueAvailable: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isInvestigated: boolean;
}

export interface Clue {
  id: string;
  title: string;
  summary: string;
  details: string;
  relatedClues: string[];
  discoveredAt: Date;
}

export interface GameState {
  currentLocation: Location;
  currentTime: Date;
  timePeriod: string;
  weather: string;
  exposureLevel: number; // 0-100
  availableLocations: Location[];
  presentNPCs: NPC[];
  availableItems: Item[];
  discoveredClues: Clue[];
  recentEvents: string[];
  situation: string;
}

export type ViewState = 'investigation' | 'dialogue' | 'feedback' | 'board';

export interface DialogueOption {
  id: string;
  text: string;
  npcId: string;
  timeCost: number;
}

export interface InvestigationResult {
  itemId: string;
  description: string;
  cluesFound: Clue[];
  timeAdvanced: number;
  newLocations?: Location[];
  newNPCs?: NPC[];
  exposureChange: number;
}
