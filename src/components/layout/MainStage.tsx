// src/components/layout/MainStage.tsx

import { InvestigationView } from '../views/InvestigationView';
import { DialogueView } from '../views/DialogueView';
import { FeedbackView } from '../views/FeedbackView';
import { DetectiveBoardView } from '../views/DetectiveBoardView';
import { MapView } from '../views/MapView';
import { PlayerProfileView } from '../views/PlayerProfileView';
import type { GameState, ViewState, NPC, Item, Clue } from '../../types/game';

interface MainStageProps {
  gameState: GameState;
  viewState: ViewState;
  activeNPC?: NPC;
  investigatedItem?: Item;
  investigationResult?: {
    description: string;
    cluesFound: Clue[];
    timeAdvanced: number;
    exposureChange: number;
  };
  onSelectNPC: (npc: NPC) => void;
  onSelectItem: (item: Item) => void;
  onBackToInvestigation: () => void;
  onFeedbackComplete: () => void;
  onBackFromProfile?: () => void;
}

export function MainStage({
  gameState,
  viewState,
  activeNPC,
  investigatedItem,
  investigationResult,
  onSelectNPC,
  onSelectItem,
  onBackToInvestigation,
  onFeedbackComplete,
  onBackFromProfile,
}: MainStageProps) {
  return (
    <main className="h-full bg-(--bg-primary) overflow-hidden">
      {viewState === 'investigation' && (
        <InvestigationView
          gameState={gameState}
          onSelectNPC={onSelectNPC}
          onSelectItem={onSelectItem}
        />
      )}

      {viewState === 'dialogue' && activeNPC && (
        <DialogueView
          npc={activeNPC}
          onBack={onBackToInvestigation}
        />
      )}

      {viewState === 'feedback' && investigatedItem && investigationResult && (
        <FeedbackView
          item={investigatedItem}
          result={investigationResult}
          onComplete={onFeedbackComplete}
        />
      )}

      {viewState === 'board' && (
        <DetectiveBoardView
          gameState={gameState}
          onBack={onBackToInvestigation}
        />
      )}

      {viewState === 'map' && (
        <MapView
          onSelectLocation={(tile) => console.log('Selected location:', tile)}
        />
      )}

      {viewState === 'profile' && (
        <PlayerProfileView
          gameState={gameState}
          onBack={onBackFromProfile || onBackToInvestigation}
        />
      )}
    </main>
  );
}
