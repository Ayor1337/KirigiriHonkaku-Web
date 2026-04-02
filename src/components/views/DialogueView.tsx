// src/components/views/DialogueView.tsx
import { useState } from 'react';
import { InkButton } from '../ui/InkButton';
import type { NPC } from '../../types/game';

interface DialogueOption {
  id: string;
  text: string;
  response: string;
}

interface DialogueViewProps {
  npc: NPC;
  onBack: () => void;
}

const mockDialogueOptions: DialogueOption[] = [
  { id: '1', text: '你昨晚看到了什么？', response: '我...我不能说。那个人警告过我。' },
  { id: '2', text: '你认识受害者吗？', response: '只见过几次。他总是独来独往。' },
  { id: '3', text: '这里的钢琴是你的吗？', response: '是的，我每晚都在这里演奏。直到那晚...' },
];

export function DialogueView({ npc, onBack }: DialogueViewProps) {
  const [dialogue, setDialogue] = useState<string[]>([
    `${npc.name}看着你，眼神中带着警惕。`,
  ]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelectOption = (option: DialogueOption) => {
    if (selectedOptions.includes(option.id)) return;

    setDialogue(prev => [
      ...prev,
      `你问："${option.text}"`,
      `${npc.name}回答："${option.response}"`,
    ]);
    setSelectedOptions(prev => [...prev, option.id]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 对话头部 */}
      <header className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--text-muted)]" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-[var(--text-primary)]">{npc.name}</h2>
            <span className="text-sm text-[var(--text-muted)]">{npc.title}</span>
          </div>
        </div>
        <InkButton variant="ghost" size="sm" onClick={onBack}>
          ← 返回调查
        </InkButton>
      </header>

      {/* 对话内容区 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {dialogue.map((line, index) => {
          const isPlayer = line.startsWith('你问：');
          return (
            <div
              key={index}
              className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  isPlayer
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                }`}
              >
                <p className="leading-relaxed">{line.replace(/^(你问：|.+回答：)/, '')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 话题选项 */}
      <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          可追问的话题
        </h3>
        <div className="flex flex-wrap gap-2">
          {mockDialogueOptions.map((option) => (
            <InkButton
              key={option.id}
              variant={selectedOptions.includes(option.id) ? 'ghost' : 'default'}
              size="sm"
              onClick={() => handleSelectOption(option)}
            >
              {option.text}
              {selectedOptions.includes(option.id) && ' ✓'}
            </InkButton>
          ))}
        </div>
      </div>
    </div>
  );
}
