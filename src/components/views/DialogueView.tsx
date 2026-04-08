// src/components/views/DialogueView.tsx
import { useState, useRef, useEffect } from "react";
import { InkButton } from "../ui/InkButton";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { VisibleNpc, DialogueDetail } from "../../types/api";

interface DialogueViewProps {
  activeNpcKey?: string;
  visibleNpcs: VisibleNpc[];
  currentDialogue?: DialogueDetail | null;
  dialogueLoading?: boolean;
  onBack: () => void;
  onSendMessage?: (text: string) => void;
}

export function DialogueView({
  activeNpcKey,
  visibleNpcs,
  currentDialogue,
  dialogueLoading,
  onBack,
  onSendMessage,
}: DialogueViewProps) {
  const activeNpc = visibleNpcs.find((n) => n.key === activeNpcKey);
  const npcName =
    activeNpc?.display_name ?? currentDialogue?.target_npc_name ?? "未知人物";

  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentDialogue?.utterances, dialogueLoading]);

  const handleSend = () => {
    if (!inputText.trim() || !onSendMessage) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const hasHistory = (currentDialogue?.utterances?.length ?? 0) > 0;

  return (
    <div className="h-full flex flex-col">
      {/* 对话头部 */}
      <header className="p-4 border-b border-(--border-color) flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-(--bg-secondary) border border-(--border-color) flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-(--text-muted)"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-xl text-(--text-primary)">
              {npcName}
            </h2>
            {currentDialogue?.tag_flags?.tone && (
              <span className="text-xs text-(--text-muted)">
                语气: {currentDialogue.tag_flags.tone}
              </span>
            )}
          </div>
        </div>
        <InkButton variant="ghost" size="sm" onClick={onBack}>
          ← 返回调查
        </InkButton>
      </header>

      {/* 对话内容区 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {!hasHistory && !dialogueLoading && (
          <div className="flex justify-center">
            <div className="bg-(--bg-tertiary) text-(--text-secondary) italic p-4 rounded-lg max-w-[80%] text-center">
              {npcName}看着你，等待你的提问。
            </div>
          </div>
        )}

        {currentDialogue?.utterances.map((u, idx) => (
          <div
            key={`${u.sequence_no}-${idx}`}
            className={`flex ${
              u.speaker_role === "player"
                ? "justify-end"
                : u.speaker_role === "narrator" || u.speaker_role === "system"
                  ? "justify-center"
                  : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                u.speaker_role === "player"
                  ? "bg-(--accent-primary) text-white rounded-br-none"
                  : u.speaker_role === "narrator" || u.speaker_role === "system"
                    ? "bg-(--bg-tertiary) text-(--text-muted) italic"
                    : "bg-(--bg-secondary) text-(--text-primary) border border-(--border-color) rounded-bl-none"
              }`}
            >
              {u.speaker_role !== "player" &&
                u.speaker_role !== "narrator" &&
                u.speaker_role !== "system" && (
                  <div className="text-xs text-(--accent-secondary) mb-1">
                    {u.speaker_name}
                  </div>
                )}
              <p>{u.content}</p>
            </div>
          </div>
        ))}

        {dialogueLoading && (
          <div className="flex justify-start">
            <div className="bg-(--bg-secondary) border border-(--border-color) px-4 py-3 rounded-lg flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-(--text-muted)">
                {npcName}正在思考...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 底部输入区 */}
      <div className="p-4 border-t border-(--border-color) bg-(--bg-secondary) shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={dialogueLoading}
            placeholder="输入你想说的话..."
            className="flex-1 px-4 py-2 bg-(--bg-primary) border border-(--border-color) rounded-lg text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--accent-primary) disabled:opacity-50"
          />
          <InkButton
            onClick={handleSend}
            disabled={dialogueLoading || !inputText.trim()}
          >
            发送
          </InkButton>
        </div>
        <p className="text-xs text-(--text-muted) text-center mt-2">
          对话内容由 AI 根据角色性格和当前情境生成
        </p>
      </div>
    </div>
  );
}
