// src/api/client.ts
// 后端 API 客户端 — 原生 fetch 封装

import type {
  CreateSessionRequest,
  SessionResponse,
  SessionBootstrapResponse,
  ActionRequest,
  ActionResult,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_PREFIX = `${BASE_URL}/api/v1`;

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
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

/** 创建会话 */
export function createSession(
  req: CreateSessionRequest,
): Promise<SessionResponse> {
  return request<SessionResponse>(`${API_PREFIX}/sessions`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/** 读取会话元数据 */
export function getSession(sessionId: string): Promise<SessionResponse> {
  return request<SessionResponse>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}`,
  );
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

/** 提交动作 */
export function submitAction(req: ActionRequest): Promise<ActionResult> {
  return request<ActionResult>(`${API_PREFIX}/actions`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
