# Historical Sessions HomeView Entry Point Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "historical sessions" case-file drawer entry point on the HomeView that fetches, displays, and allows resuming past game sessions, with localStorage-based `playerId` recovery.

**Architecture:** We extend the API client with `getSessions()`, persist `(sessionId, playerId)` pairs in localStorage on successful `startGame()`, and build a slide-in "case drawer" panel on HomeView using existing Gothic Midnight Wine Red Tailwind patterns (ghost buttons, border hover transitions, glow shadows, noise-safe backgrounds). The drawer uses CSS transforms for a theatrical "memory corridor" reveal.

**Tech Stack:** React 19, TypeScript, Vite, TailwindCSS v4, React Router 7 (BrowserRouter), native fetch.

---

## File Structure Map

- `src/types/api.ts` — Add `SessionListItem` type for `GET /api/v1/sessions` response items (without `data_directories`).
- `src/api/client.ts` — Add `getSessions()` fetch wrapper.
- `src/hooks/useGameSession.ts` —
  - Add `saveSessionPlayerMapping(sessionId, playerId)` and `getKnownPlayerId(sessionId)` helpers backed by `localStorage`.
  - Call save on `startGame()` success.
  - Export `localStorage` key constant.
- `src/components/ui/SessionCard.tsx` — New small presentational card for a single session (title, status badge, time).
- `src/components/ui/SessionDrawer.tsx` — New slide-in drawer component (backdrop + panel + scrollable list + empty state).
- `src/components/views/HomeView.tsx` — Add "历史档案" ghost button, wire drawer open/close, integrate `getSessions`, cross-reference localStorage for `playerId`, handle resume navigation.

---

### Task 1: Extend API types with `SessionListItem`

**Files:**
- Modify: `src/types/api.ts:26-35`

Add a dedicated list-item type because `GET /api/v1/sessions` omits `data_directories`.

- [ ] **Step 1: Add `SessionListItem` interface**

```typescript
export interface SessionListItem {
  id: string;
  uuid: string;
  title: string | null;
  status: string;
  start_time_minute: number;
  current_time_minute: number;
}
```

Insert directly after `SessionResponse` and before `SessionBootstrapResponse`. Keep `SessionResponse` untouched for single-session endpoints that still return `data_directories`.

- [ ] **Step 2: Commit**

```bash
git add src/types/api.ts
git commit -m "feat(types): add SessionListItem for GET /sessions response"
```

---

### Task 2: Add `getSessions()` to API client

**Files:**
- Modify: `src/api/client.ts`

- [ ] **Step 1: Import `SessionListItem` and add function**

Update the import from `../types/api`:

```typescript
import type {
  SessionResponse,
  SessionListItem,
  SessionBootstrapResponse,
  ActionRequest,
  ActionResult,
} from "../types/api";
```

Append below `getSession`:

```typescript
/** 查询全部会话列表 */
export function getSessions(): Promise<SessionListItem[]> {
  return request<SessionListItem[]>(`${API_PREFIX}/sessions`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/client.ts
git commit -m "feat(api): add getSessions client wrapper"
```

---

### Task 3: Implement `playerId` localStorage persistence in `useGameSession.ts`

**Files:**
- Modify: `src/hooks/useGameSession.ts`

We need two helpers: one to write `(sessionId, playerId)` on `startGame()` success, and one to read back a known `playerId` for resume.

- [ ] **Step 1: Define storage key and helpers at top of file**

Insert after imports, before `DiscoveredClue`:

```typescript
const SESSION_PLAYER_STORAGE_KEY = "kirigiri:sessionPlayers";

function saveSessionPlayerMapping(sessionId: string, playerId: string) {
  try {
    const raw = localStorage.getItem(SESSION_PLAYER_STORAGE_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[sessionId] = playerId;
    localStorage.setItem(SESSION_PLAYER_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function getKnownPlayerId(sessionId: string): string | null {
  try {
    const raw = localStorage.getItem(SESSION_PLAYER_STORAGE_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    return map[sessionId] ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Persist mapping inside `startGame()` after bootstrap succeeds**

In the `startGame()` callback, after:

```typescript
      const playerId = bootstrap.root_ids.player_id;
      sessionIdRef.current = sessionId;
      playerIdRef.current = playerId;
```

Add:

```typescript
      saveSessionPlayerMapping(sessionId, playerId);
```

- [ ] **Step 3: Export helpers/constants for consumers**

At the bottom of the hook return object, add:

```typescript
    getKnownPlayerId,
    SESSION_PLAYER_STORAGE_KEY,
```

Update the return block at the end of `useGameSession` to:

```typescript
  return {
    ...state,
    startGame,
    resumeGame,
    move,
    talk,
    investigate,
    gather,
    accuse,
    getKnownPlayerId,
    SESSION_PLAYER_STORAGE_KEY,
  };
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGameSession.ts
git commit -m "feat(session): persist and recover playerId via localStorage"
```

---

### Task 4: Build `SessionCard` component

**Files:**
- Create: `src/components/ui/SessionCard.tsx`

This is the single row/card for a historical session. It uses existing Midnight Wine Red variables and border-hover patterns.

- [ ] **Step 1: Create file with full component**

```tsx
import type { SessionListItem } from "../../types/api";

interface SessionCardProps {
  session: SessionListItem;
  onResume: () => void;
}

function formatGameTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "草稿";
    case "generating":
      return "生成中";
    case "ready":
      return "进行中";
    case "ended":
      return "已结案";
    default:
      return status;
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "draft":
      return "text-(--text-muted) border-(--border-color)";
    case "generating":
      return "text-(--warning) border-(--warning)/40";
    case "ready":
      return "text-(--accent-primary) border-(--accent-primary)/40";
    case "ended":
      return "text-(--success) border-(--success)/40";
    default:
      return "text-(--text-secondary) border-(--border-color)";
  }
}

export function SessionCard({ session, onResume }: SessionCardProps) {
  const title = session.title ?? `未命名案件 #${session.id.slice(-4)}`;

  return (
    <button
      onClick={onResume}
      className={`
        w-full text-left
        group relative
        p-4
        bg-(--bg-secondary)
        border border-(--border-color)
        rounded-lg
        transition-all duration-300
        hover:border-(--accent-primary)
        hover:shadow-[0_0_20px_rgba(190,75,219,0.12)]
      `}
    >
      {/* subtle ink pulse on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(190, 75, 219, 0.08), transparent 60%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-serif text-base text-(--text-primary) truncate tracking-wide">
            {title}
          </h4>
          <div className="mt-1 flex items-center gap-2 text-xs text-(--text-muted)">
            <span className="font-mono">{formatGameTime(session.current_time_minute)}</span>
            <span className="text-(--border-color)">·</span>
            <span>第 {session.start_time_minute} 分钟开始</span>
          </div>
        </div>

        <span
          className={`
            shrink-0
            px-2 py-0.5
            text-[10px] tracking-wider uppercase
            border rounded
            ${statusBadgeClass(session.status)}
          `}
        >
          {statusLabel(session.status)}
        </span>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SessionCard.tsx
git commit -m "feat(ui): add SessionCard component for historical sessions"
```

---

### Task 5: Build `SessionDrawer` component

**Files:**
- Create: `src/components/ui/SessionDrawer.tsx`

A slide-in right panel with backdrop, meant to feel like opening a case-file drawer.

- [ ] **Step 1: Create file with full component**

```tsx
import { useEffect, useRef } from "react";
import type { SessionListItem } from "../../types/api";
import { SessionCard } from "./SessionCard";

interface SessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionListItem[];
  loading: boolean;
  onResume: (sessionId: string) => void;
}

export function SessionDrawer({
  isOpen,
  onClose,
  sessions,
  loading,
  onResume,
}: SessionDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <div
      className={`
        fixed inset-0 z-50
        transition-opacity duration-500
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="关闭历史档案"
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        className={`
          absolute top-0 right-0 h-full
          w-full max-w-md
          bg-(--bg-primary)
          border-l border-(--border-color)
          shadow-[-20px_0_60px_rgba(0,0,0,0.5)]
          transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--border-color)">
          <h2 className="font-serif text-xl tracking-[0.2em] text-(--text-primary)">
            历史档案
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-(--text-muted) hover:text-(--text-primary) transition-colors duration-200"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Decor line */}
        <div className="h-px bg-linear-to-r from-transparent via-(--accent-primary)/30 to-transparent" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-(--text-muted)">
              <div className="w-6 h-6 border-2 border-(--accent-primary) border-t-transparent rounded-full animate-spin" />
              <span className="text-sm tracking-wider">读取卷宗中…</span>
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-(--text-muted)">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="opacity-50">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="text-sm tracking-wide">暂无历史案件记录</p>
            </div>
          )}

          {!loading && sessions.length > 0 && (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className={`
                    transition-all duration-500
                    ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
                  `}
                  style={{ transitionDelay: `${Math.min(index * 60, 400)}ms` }}
                >
                  <SessionCard
                    session={session}
                    onResume={() => onResume(session.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer corner ornament */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-(--border-color) opacity-40" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SessionDrawer.tsx
git commit -m "feat(ui): add SessionDrawer slide-in panel for case files"
```

---

### Task 6: Integrate drawer and session loading into `HomeView.tsx`

**Files:**
- Modify: `src/components/views/HomeView.tsx`

- [ ] **Step 1: Add imports**

```tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useGameSession } from "../../hooks/useGameSession";
import { getSessions } from "../../api/client";
import type { SessionListItem } from "../../types/api";
import { SessionDrawer } from "../ui/SessionDrawer";
```

- [ ] **Step 2: Add drawer/sessions state**

Inside `HomeView` body, after existing state:

```typescript
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
```

- [ ] **Step 3: Add fetch callback**

After state declarations, add:

```typescript
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const list = await getSessions();
      setSessions(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取历史会话失败";
      setSessionsError(message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);
```

- [ ] **Step 4: Auto-fetch when drawer opens**

```typescript
  useEffect(() => {
    if (drawerOpen) {
      fetchSessions();
    }
  }, [drawerOpen, fetchSessions]);
```

- [ ] **Step 5: Implement resume handler**

```typescript
  const handleResume = async (sessionId: string) => {
    const playerId = game.getKnownPlayerId(sessionId);
    if (!playerId) {
      setSessionsError("无法恢复该会话：缺少玩家身份记录");
      return;
    }
    try {
      await game.resumeGame(sessionId, playerId);
      navigate(`/game?sessionId=${sessionId}&playerId=${playerId}`);
    } catch {
      // error already stored in game.error
    }
  };
```

- [ ] **Step 6: Insert "历史档案" ghost button next to the start button**

Replace the current absolute bottom button block (lines 151-179) with:

```tsx
      {/* 按钮组 */}
      <div
        className={`
          absolute bottom-[20%] left-1/2 -translate-x-1/2
          flex flex-col sm:flex-row items-center gap-4
          transition-all duration-700
          ${buttonVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
        `}
      >
        <button
          onClick={handleStartGame}
          disabled={game.loading}
          className={`
            group flex items-center gap-3
            px-8 py-4
            font-serif text-sm tracking-[0.3em] uppercase
            text-(--text-secondary)
            border border-(--border-color)
            bg-transparent
            transition-all duration-500
            hover:border-(--accent-primary) hover:text-(--text-primary)
            hover:shadow-[0_0_30px_rgba(190,75,219,0.2)]
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span>进入调查</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className={`
            group flex items-center gap-3
            px-6 py-3
            font-serif text-xs tracking-[0.25em] uppercase
            text-(--text-muted)
            border border-transparent
            bg-transparent
            transition-all duration-500
            hover:border-(--border-color) hover:text-(--text-secondary)
          `}
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>历史档案</span>
        </button>
      </div>
```

- [ ] **Step 7: Render the drawer and session-level error**

Inside the root `div`, after the corner ornaments, append:

```tsx
      <SessionDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSessionsError(null);
        }}
        sessions={sessions}
        loading={sessionsLoading}
        onResume={handleResume}
      />

      {/* Drawer-level error toast */}
      {sessionsError && (
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 px-4 py-2 text-sm text-red-400 border border-red-400/30 bg-red-900/20 rounded">
          {sessionsError}
        </div>
      )}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/views/HomeView.tsx
git commit -m "feat(home): integrate SessionDrawer and historical session resume"
```

---

### Task 7: Verify and test

- [ ] **Step 1: Run TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. Fix any missing imports or type mismatches.

- [ ] **Step 2: Run dev server and manually test flow**

```bash
npm run dev
```

Do the following in the browser:
1. Open `http://localhost:5173` (or the displayed port).
2. Click **"进入调查"** — start a new session, verify navigation to `/game?sessionId=...&playerId=...` succeeds.
3. Return to `/` (use browser back or type the URL).
4. Open browser DevTools > Application > Local Storage and confirm key `kirigiri:sessionPlayers` exists and contains a mapping from the `sessionId` to the `playerId`.
5. Click **"历史档案"** — drawer should slide in from the right with:
   - Header "历史档案"
   - Loading spinner briefly
   - The previously created session card showing status "进行中" or "ready" and time
6. Click the session card — should navigate back to `/game?sessionId=...&playerId=...`.
7. Clear local storage key `kirigiri:sessionPlayers`, refresh, open drawer, and click the card again.
   - Expected red toast: "无法恢复该会话：缺少玩家身份记录".

- [ ] **Step 3: Check responsive layout**

Resize viewport to mobile width (375px). Confirm:
- Both buttons stack vertically (`flex-col` on small screens).
- Drawer occupies full width (`w-full max-w-md`).
- Session cards don't overflow horizontally.

- [ ] **Step 4: Keyboard / a11y check**

With drawer open:
- Press `Escape` — drawer should close.
- Click backdrop — drawer should close.
- Tab through buttons — focus rings should be visible (Tailwind default focus styles).

- [ ] **Step 5: Commit verification notes (optional)**

If you fixed anything from the verification steps, commit those fixes before finishing.

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| API `GET /api/v1/sessions` support | Task 1 + Task 2 |
| `playerId` localStorage persistence/recovery | Task 3 |
| Gothic aesthetic cohesion (colors, shadows, borders, serif font) | Task 4 + Task 5 + Task 6 |
| "Memory corridor" / case-file drawer UX | Task 5 (`SessionDrawer` slide-in) + Task 6 (trigger button) |
| Session list with title/status/time | Task 4 (`SessionCard`) + Task 5 |
| Resume session functionality | Task 6 (`handleResume`) |
| Loading and empty states | Task 5 (drawer content states) |
| Tailwind class specifics documented | Embedded inline in all UI tasks |

## Self-Review: Placeholder Scan

- No TBD/TODO placeholders.
- No "add appropriate error handling" vagueness — concrete `saveSessionPlayerMapping`/`getKnownPlayerId` and toast rendering provided.
- No "write tests for the above" without code — manual verification steps are explicit, and the codebase currently has no frontend test harness, so we use dev server manual checks.

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-07-historical-sessions-homeview.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you like to use?
