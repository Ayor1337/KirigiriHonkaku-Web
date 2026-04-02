// src/components/layout/InvestigationLayout.tsx
import { useState } from 'react';
import { TopBar } from './TopBar';
import { ActionColumn } from './ActionColumn';
import { MainStage } from './MainStage';
import { CaseColumn } from './CaseColumn';
import { IntelBar } from './IntelBar';
import { mockGameState } from '../../data/mock';
import type { ViewState, NPC, Item, Clue } from '../../types/game';

export function InvestigationLayout() {
  const [gameState] = useState(mockGameState);
  const [viewState, setViewState] = useState<ViewState>('investigation');
  const [activeNPC, setActiveNPC] = useState<NPC | undefined>();
  const [investigatedItem, setInvestigatedItem] = useState<Item | undefined>();
  const [newClueIds, setNewClueIds] = useState<string[]>([]);

  const [investigationResult, setInvestigationResult] = useState<{
    description: string;
    cluesFound: Clue[];
    timeAdvanced: number;
    exposureChange: number;
  } | undefined>();

  const handleSelectNPC = (npc: NPC) => {
    setActiveNPC(npc);
    setViewState('dialogue');
  };

  const handleSelectItem = (item: Item) => {
    // 模拟调查结果
    setInvestigatedItem(item);
    setInvestigationResult({
      description: `你仔细检查了${item.name}，发现了一些有趣的细节...`,
      cluesFound: gameState.discoveredClues.slice(0, 1),
      timeAdvanced: 10,
      exposureChange: 5,
    });
    setNewClueIds(gameState.discoveredClues.slice(0, 1).map(c => c.id));
    setViewState('feedback');
  };

  const handleBackToInvestigation = () => {
    setViewState('investigation');
    setActiveNPC(undefined);
  };

  const handleFeedbackComplete = () => {
    setViewState('investigation');
    setInvestigatedItem(undefined);
    setInvestigationResult(undefined);
  };

  return (
    <div className="investigation-layout h-screen flex flex-col bg-(--bg-primary)">
      {/* 顶部栏 */}
      <TopBar gameState={gameState} />

      {/* 中间三栏 */}
      <div className="main-content flex-1 grid grid-cols-[20%_60%_20%] overflow-hidden">
        {/* 左侧行动列 */}
        <ActionColumn
          gameState={gameState}
          onSelectLocation={() => {}}
          onSelectNPC={handleSelectNPC}
          onSelectItem={handleSelectItem}
          activeNPCId={activeNPC?.id}
        />

        {/* 中央主舞台 */}
        <MainStage
          gameState={gameState}
          viewState={viewState}
          activeNPC={activeNPC}
          investigatedItem={investigatedItem}
          investigationResult={investigationResult}
          onSelectNPC={handleSelectNPC}
          onSelectItem={handleSelectItem}
          onBackToInvestigation={handleBackToInvestigation}
          onFeedbackComplete={handleFeedbackComplete}
        />

        {/* 右侧案情列 */}
        <CaseColumn
          gameState={gameState}
          onSelectNPC={handleSelectNPC}
          newClueIds={newClueIds}
        />
      </div>

      {/* 底部情报带 */}
      <IntelBar
        unreadClues={newClueIds.length}
        mapPoints={2}
        connectableClues={1}
      />
    </div>
  );
}
