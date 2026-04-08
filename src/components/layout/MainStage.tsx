// src/components/layout/MainStage.tsx
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { InvestigationView } from "../views/InvestigationView";
import { DialogueView } from "../views/DialogueView";
import { FeedbackView } from "../views/FeedbackView";
import { DetectiveBoardView } from "../views/DetectiveBoardView";
import { MapView } from "../views/MapView";
import { PlayerProfileView } from "../views/PlayerProfileView";
import type {
  SceneSnapshot,
  StateDeltaSummary,
  SessionPlayer,
  SessionMap,
  SessionNpc,
  DialogueDetail,
} from "../../types/api";
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
  playerProfile: SessionPlayer | null;
  mapData: SessionMap | null;
  npcs?: SessionNpc[];
  currentDialogue?: DialogueDetail | null;
  dialogueLoading?: boolean;
  onTalkNpc: (npcKey: string) => void;
  onInvestigate: () => void;
  onMove: (locationKey: string) => void;
  onBackToInvestigation: () => void;
  onFeedbackComplete: () => void;
  onBackFromProfile?: () => void;
  onSendTalkMessage?: (text: string) => void;
  loading?: boolean;
}

export function MainStage({
  viewState,
  scene,
  narrativeText,
  lastDelta,
  discoveredClues,
  activeNpcKey,
  playerProfile,
  mapData,
  npcs,
  currentDialogue,
  dialogueLoading,
  onTalkNpc,
  onInvestigate,
  onMove,
  onBackToInvestigation,
  onFeedbackComplete,
  onBackFromProfile,
  onSendTalkMessage,
  loading,
}: MainStageProps) {
  const details = scene.details;

  return (
    <main className="relative h-full bg-(--bg-primary) overflow-hidden">
      {loading && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-(--accent-primary) to-transparent animate-pulse z-30" />
          <div className="absolute top-3 right-3 z-30">
            <LoadingSpinner size="sm" />
          </div>
        </>
      )}
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
          currentDialogue={currentDialogue}
          dialogueLoading={dialogueLoading}
          onBack={onBackToInvestigation}
          onSendMessage={onSendTalkMessage}
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
          npcs={npcs ?? []}
          onBack={onBackToInvestigation}
        />
      )}

      {viewState === "map" && (
        <MapView
          currentLocation={details.current_location}
          reachableLocations={details.reachable_locations}
          mapSnapshot={details.map_snapshot}
          knownLocations={
            mapData?.locations.map((loc) => ({
              key: loc.key,
              name: loc.name,
            })) ?? undefined
          }
          mapName={mapData?.display_name ?? undefined}
          onMove={onMove}
          loading={loading}
        />
      )}

      {viewState === "profile" && (
        <PlayerProfileView
          playerProfile={playerProfile}
          exposure={details.exposure}
          discoveredClueCount={discoveredClues.length}
          currentTimeMinute={scene.current_time_minute}
          onBack={onBackFromProfile || onBackToInvestigation}
        />
      )}
    </main>
  );
}
