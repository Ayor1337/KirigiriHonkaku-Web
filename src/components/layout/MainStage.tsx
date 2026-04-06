// src/components/layout/MainStage.tsx
import { InvestigationView } from "../views/InvestigationView";
import { DialogueView } from "../views/DialogueView";
import { FeedbackView } from "../views/FeedbackView";
import { DetectiveBoardView } from "../views/DetectiveBoardView";
import { MapView } from "../views/MapView";
import { PlayerProfileView } from "../views/PlayerProfileView";
import type { SceneSnapshot, StateDeltaSummary } from "../../types/api";
import type { DiscoveredClue } from "../../hooks/useGameSession";

type ViewState =
  | "investigation"
  | "dialogue"
  | "feedback"
  | "board"
  | "map"
  | "profile";

interface MainStageProps {
  viewState: ViewState;
  scene: SceneSnapshot;
  narrativeText?: string | null;
  lastDelta?: StateDeltaSummary | null;
  discoveredClues: DiscoveredClue[];
  activeNpcKey?: string;
  onTalkNpc: (npcKey: string) => void;
  onInvestigate: () => void;
  onMove: (locationKey: string) => void;
  onBackToInvestigation: () => void;
  onFeedbackComplete: () => void;
  onBackFromProfile?: () => void;
  loading?: boolean;
}

export function MainStage({
  viewState,
  scene,
  narrativeText,
  lastDelta,
  discoveredClues,
  activeNpcKey,
  onTalkNpc,
  onInvestigate,
  onMove,
  onBackToInvestigation,
  onFeedbackComplete,
  onBackFromProfile,
  loading,
}: MainStageProps) {
  const details = scene.details;

  return (
    <main className="h-full bg-(--bg-primary) overflow-hidden">
      {viewState === "investigation" && (
        <InvestigationView
          currentLocation={details.current_location}
          visibleNpcs={details.visible_npcs}
          investigableClues={details.investigable_clues}
          narrativeText={narrativeText}
          onTalkNpc={onTalkNpc}
          onInvestigate={onInvestigate}
          loading={loading}
        />
      )}

      {viewState === "dialogue" && (
        <DialogueView
          activeNpcKey={activeNpcKey}
          visibleNpcs={details.visible_npcs}
          narrativeText={narrativeText}
          latestDialogue={details.latest_dialogue}
          onBack={onBackToInvestigation}
        />
      )}

      {viewState === "feedback" && (
        <FeedbackView
          narrativeText={narrativeText}
          lastDelta={lastDelta}
          onComplete={onFeedbackComplete}
        />
      )}

      {viewState === "board" && (
        <DetectiveBoardView
          discoveredClues={discoveredClues}
          currentLocation={details.current_location}
          visibleNpcs={details.visible_npcs}
          onBack={onBackToInvestigation}
        />
      )}

      {viewState === "map" && (
        <MapView
          currentLocation={details.current_location}
          reachableLocations={details.reachable_locations}
          onMove={onMove}
          loading={loading}
        />
      )}

      {viewState === "profile" && (
        <PlayerProfileView
          exposure={details.exposure}
          discoveredClueCount={discoveredClues.length}
          currentTimeMinute={scene.current_time_minute}
          onBack={onBackFromProfile || onBackToInvestigation}
        />
      )}
    </main>
  );
}
