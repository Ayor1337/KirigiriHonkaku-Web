// src/api/client.ts
// 后端 API 客户端 — 原生 fetch 封装

import type {
  SessionResponse,
  SessionStateResponse,
  SessionPlayer,
  SessionMap,
  SessionNpc,
  SessionBootstrapErrorEvent,
  SessionBootstrapResponse,
  SessionBootstrapStageEvent,
  ActionRequest,
  ActionResult,
  DialogueDetail,
  LatestDialogue,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_PREFIX = `${BASE_URL}/api/v1`;

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class BootstrapStreamError extends Error {
  code: string;
  sessionId?: string;
  failedPlaceholder?: string;

  constructor(payload: SessionBootstrapErrorEvent) {
    super(payload.message);
    this.name = "BootstrapStreamError";
    this.code = payload.code;
    this.sessionId = payload.session_id;
    this.failedPlaceholder = payload.failed_placeholder;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      // 无法解析 JSON，使用 HTTP 状态码
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

interface BootstrapSessionStreamOptions {
  onStage?: (event: SessionBootstrapStageEvent) => void;
}

interface ParsedSseEvent {
  event: string;
  data: unknown;
}

/** 创建会话（Step 6 改为空请求体） */
export function createSession(): Promise<SessionResponse> {
  return request<SessionResponse>(`${API_PREFIX}/sessions`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/** 流式创建并生成世界 */
export async function bootstrapSessionStream(
  options: BootstrapSessionStreamOptions = {},
): Promise<SessionBootstrapResponse> {
  const res = await fetch(`${API_PREFIX}/sessions/bootstrap-stream`, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
    },
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  if (!res.body) {
    throw new Error("浏览器不支持流式响应读取");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    let delimiterIndex = buffer.indexOf("\n\n");
    while (delimiterIndex >= 0) {
      const block = buffer.slice(0, delimiterIndex);
      buffer = buffer.slice(delimiterIndex + 2);
      const parsed = parseSseBlock(block);
      if (parsed) {
        if (parsed.event === "stage") {
          options.onStage?.(parsed.data as SessionBootstrapStageEvent);
        } else if (parsed.event === "complete") {
          return parsed.data as SessionBootstrapResponse;
        } else if (parsed.event === "error") {
          throw new BootstrapStreamError(parsed.data as SessionBootstrapErrorEvent);
        }
      }
      delimiterIndex = buffer.indexOf("\n\n");
    }

    if (done) {
      break;
    }
  }

  throw new Error("创建流程在完成前中断");
}

function parseSseBlock(block: string): ParsedSseEvent | null {
  const trimmed = block.trim();
  if (!trimmed) {
    return null;
  }

  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of trimmed.split("\n")) {
    if (line.startsWith("event: ")) {
      eventName = line.slice(7).trim();
    }
    if (line.startsWith("data: ")) {
      dataLines.push(line.slice(6));
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return {
    event: eventName,
    data: JSON.parse(dataLines.join("\n")),
  };
}

/** 读取会话元数据 */
export function getSession(sessionId: string): Promise<SessionResponse> {
  return request<SessionResponse>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}`,
  );
}

/** 读取会话状态（暴露度） */
export function getSessionState(sessionId: string): Promise<SessionStateResponse> {
  return request<SessionStateResponse>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/state`,
  );
}

/** 读取会话玩家详情 */
export function getSessionPlayer(sessionId: string): Promise<SessionPlayer> {
  return request<SessionPlayer>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/player`,
  );
}

/** 读取会话地图详情 */
export function getSessionMap(sessionId: string): Promise<SessionMap> {
  return request<SessionMap>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/map`,
  );
}

/** 读取会话已遇见的 NPC 列表 */
export function getSessionNPCs(sessionId: string): Promise<SessionNpc[]> {
  return request<SessionNpc[]>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/npcs`,
  );
}

/** 查询全部会话列表 */
export function getSessions(): Promise<SessionResponse[]> {
  return request<SessionResponse[]>(`${API_PREFIX}/sessions`);
}

/** 世界初始化 */
export function bootstrapSession(
  sessionId: string,
): Promise<SessionBootstrapResponse> {
  return request<SessionBootstrapResponse>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/bootstrap`,
    { method: "POST" },
  );
}

/** 读取单条对话详情 */
export function getDialogue(
  sessionId: string,
  dialogueId: string,
): Promise<DialogueDetail> {
  return request<DialogueDetail>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/dialogues/${encodeURIComponent(dialogueId)}`,
  );
}

/** 读取会话对话列表 */
export function getSessionDialogues(sessionId: string): Promise<LatestDialogue[]> {
  return request<LatestDialogue[]>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}/dialogues`,
  );
}

/** 提交动作 */
export function submitAction(req: ActionRequest): Promise<ActionResult> {
  return request<ActionResult>(`${API_PREFIX}/actions`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
