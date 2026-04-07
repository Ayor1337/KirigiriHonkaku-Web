// src/components/views/DialogueView.tsx
import { InkButton } from "../ui/InkButton";
import type { VisibleNpc, LatestDialogue } from "../../types/api";

interface DialogueViewProps {
  activeNpcKey?: string;
  visibleNpcs: VisibleNpc[];
  narrativeText?: string | null;
  latestDialogue?: LatestDialogue | null;
  onBack: () => void;
}

export function DialogueView({
  activeNpcKey,
  visibleNpcs,
  narrativeText,
  latestDialogue,
  onBack,
}: DialogueViewProps) {
  const activeNpc = visibleNpcs.find((n) => n.key === activeNpcKey);
  const npcName = activeNpc?.display_name ?? "未知人物";

  // 构建对话内容
  const dialogueLines: { speaker: "npc" | "narrator"; text: string }[] = [];

  if (narrativeText) {
    dialogueLines.push({ speaker: "npc", text: narrativeText });
  }

  if (dialogueLines.length === 0) {
    dialogueLines.push({
      speaker: "narrator",
      text: `${npcName}看着你，等待你的提问。`,
    });
  }

  return (
    <div className="h-full flex flex-col">
      {/* 对话头部 */}
      <header className="p-6 border-b border-(--border-color) flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-(--bg-secondary) border border-(--border-color) flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-(--text-muted)"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-(--text-primary)">
              {npcName}
            </h2>
            {latestDialogue?.target_npc_key && (
              <span className="text-sm text-(--text-muted)">
                {latestDialogue.target_npc_key}
              </span>
            )}
          </div>
        </div>
        <InkButton variant="ghost" size="sm" onClick={onBack}>
          ← 返回调查
        </InkButton>
      </header>

      {/* 对话内容区 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {dialogueLines.map((line, index) => (
          <div
            key={index}
            className={`flex ${line.speaker === "narrator" ? "justify-center" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                line.speaker === "npc"
                  ? "bg-(--bg-secondary) text-(--text-primary)"
                  : "bg-(--bg-tertiary) text-(--text-secondary) italic"
              }`}
            >
              <p className="leading-relaxed">{line.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="p-6 border-t border-(--border-color) bg-(--bg-secondary)">
        <p className="text-xs text-(--text-muted) text-center">
          对话内容由 AI 根据角色性格和当前情境生成
        </p>
      </div>
    </div>
  );
}
