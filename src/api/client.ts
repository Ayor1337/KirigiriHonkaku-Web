// src/api/client.ts
// 后端 API 客户端 — 原生 fetch 封装

import type {
  SessionResponse,
  SessionBootstrapResponse,
  ActionRequest,
  ActionResult,
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

/** 创建会话（Step 6 改为空请求体） */
export function createSession(): Promise<SessionResponse> {
  return request<SessionResponse>(`${API_PREFIX}/sessions`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/** 读取会话元数据 */
export function getSession(sessionId: string): Promise<SessionResponse> {
  return request<SessionResponse>(
    `${API_PREFIX}/sessions/${encodeURIComponent(sessionId)}`,
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

/** 提交动作 */
export function submitAction(req: ActionRequest): Promise<ActionResult> {
  return request<ActionResult>(`${API_PREFIX}/actions`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
