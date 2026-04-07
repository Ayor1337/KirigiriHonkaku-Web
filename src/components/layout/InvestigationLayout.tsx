// src/components/layout/InvestigationLayout.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { TopBar } from "./TopBar";
import { ActionColumn } from "./ActionColumn";
import { MainStage } from "./MainStage";
import { CaseColumn } from "./CaseColumn";
import { IntelBar } from "./IntelBar";
import { useGameSession } from "../../hooks/useGameSession";

type ViewState =
  | "investigation"
  | "dialogue"
  | "feedback"
  | "board"
  | "map"
  | "profile";

export function InvestigationLayout() {
  const [searchParams] = useSearchParams();
  const game = useGameSession();

  const [viewState, setViewState] = useState<ViewState>("investigation");
  const [activeNavId, setActiveNavId] = useState<string>("clues");
  const [activeNpcKey, setActiveNpcKey] = useState<string | undefined>();
  const [newClueKeys, setNewClueKeys] = useState<string[]>([]);

  // 初始化：从 URL 参数获取 sessionId/playerId，或创建新游戏
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    const playerId = searchParams.get("playerId");

    if (sessionId && playerId) {
      game.resumeGame(sessionId, playerId);
    }
    // 仅在首次挂载时初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当新线索发现时，更新 newClueKeys
  useEffect(() => {
    if (game.lastDelta?.investigation?.discovered_clues?.length) {
      setNewClueKeys(game.lastDelta.investigation.discovered_clues);
    }
  }, [game.lastDelta]);

  const scene = game.scene;
  const details = scene?.details;

  // 加载中
  if (game.loading && !scene) {
    return (
      <div className="h-screen flex items-center justify-center bg-(--bg-primary)">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-(--accent-primary) border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-(--text-secondary) font-serif">正在加载调查...</p>
        </div>
      </div>
    );
  }

  // 错误
  if (game.error && !scene) {
    return (
      <div className="h-screen flex items-center justify-center bg-(--bg-primary)">
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-(--text-primary) font-serif text-lg">
            调查初始化失败
          </p>
          <p className="text-(--text-secondary) text-sm">{game.error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 border border-(--border-color) text-(--text-secondary) hover:text-(--text-primary) hover:border-(--accent-primary) transition-colors rounded"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 场景未就绪
  if (!scene || !details) {
    return (
      <div className="h-screen flex items-center justify-center bg-(--bg-primary)">
        <p className="text-(--text-secondary)">等待场景数据...</p>
      </div>
    );
  }

  const handleTalkNpc = (npcKey: string) => {
    setActiveNpcKey(npcKey);
    game.talk(npcKey).then(() => {
      setViewState("dialogue");
      setActiveNavId("records");
    });
  };

  const handleInvestigate = () => {
    game.investigate().then(() => {
      setViewState("feedback");
    });
  };

  const handleMove = (locationKey: string) => {
    game.move(locationKey).then(() => {
      setViewState("investigation");
      setActiveNavId("clues");
    });
  };

  const handleBackToInvestigation = () => {
    setViewState("investigation");
    setActiveNpcKey(undefined);
    setActiveNavId("clues");
  };

  const handleFeedbackComplete = () => {
    setViewState("investigation");
    setActiveNavId("clues");
  };

  const handleViewPlayerProfile = () => {
    setViewState("profile");
    setActiveNavId("profile");
  };

  const handleBackFromProfile = () => {
    setViewState("investigation");
    setActiveNavId("clues");
  };

  return (
    <div className="investigation-layout h-screen flex flex-col bg-(--bg-primary)">
      {/* 顶部栏 */}
      <TopBar
        currentTimeMinute={scene.current_time_minute}
        exposure={details.exposure}
        narrativeText={game.narrativeText}
      />

      {/* 中间三栏 */}
      <div className="main-content flex-1 grid grid-cols-[20%_60%_20%] overflow-hidden">
        {/* 左侧行动列 */}
        <ActionColumn
          currentLocation={details.current_location}
          reachableLocations={details.reachable_locations}
          visibleNpcs={details.visible_npcs}
          investigableClues={details.investigable_clues}
          discoveredClueCount={game.discoveredClues.length}
          visitedLocationCount={game.visitedLocations.length}
          onMove={handleMove}
          onTalkNpc={handleTalkNpc}
          onInvestigate={handleInvestigate}
          onViewPlayerProfile={handleViewPlayerProfile}
          activeNpcKey={activeNpcKey}
          loading={game.loading}
        />

        {/* 中央主舞台 */}
        <MainStage
          viewState={viewState}
          scene={scene}
          narrativeText={game.narrativeText}
          lastDelta={game.lastDelta}
          discoveredClues={game.discoveredClues}
          activeNpcKey={activeNpcKey}
          onTalkNpc={handleTalkNpc}
          onInvestigate={handleInvestigate}
          onMove={handleMove}
          onBackToInvestigation={handleBackToInvestigation}
          onFeedbackComplete={handleFeedbackComplete}
          onBackFromProfile={handleBackFromProfile}
          loading={game.loading}
        />

        {/* 右侧案情列 */}
        <CaseColumn
          visibleNpcs={details.visible_npcs}
          discoveredClues={game.discoveredClues}
          newClueKeys={newClueKeys}
          onTalkNpc={handleTalkNpc}
          narrativeText={game.narrativeText}
          loading={game.loading}
        />
      </div>

      {/* 底部情报带 */}
      <IntelBar
        unreadClues={newClueKeys.length}
        mapPoints={details.reachable_locations.length}
        activeNavId={activeNavId}
        onNavigate={(newView, navId) => {
          if (newView !== viewState) {
            setViewState(newView as ViewState);
          }
          setActiveNavId(navId);
        }}
      />
    </div>
  );
}
