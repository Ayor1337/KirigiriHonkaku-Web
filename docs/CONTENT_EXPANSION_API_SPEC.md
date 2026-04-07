# Step 6 内容扩展 API 规范

> 本文档描述当前对外 HTTP 接口约定。
> 当前版本已将会话 bootstrap 从模板装配改为多轮 AGENT 生成。
> 固定指令：Implementation Plan, Task List and Thought in Chinese

## 1. 范围

当前对外使用以下接口：

- `POST /api/v1/sessions`
- `GET /api/v1/sessions`
- `POST /api/v1/sessions/{session_id}/bootstrap`
- `GET /api/v1/sessions/{session_id}`
- `POST /api/v1/actions`

当前版本不新增：

- 模板列表查询接口
- 侦探板接口
- 知识池接口
- 隐藏区域专用动作接口
- 独立后台任务接口

## 2. 会话创建

### 2.1 `POST /api/v1/sessions`

请求体：

- 空请求体
- 不再接收 `title`
- 不再接收 `case_template_key / map_template_key / truth_template_key`

示例：

```http
POST /api/v1/sessions
```

成功响应语义：

- 创建最小会话根记录
- 生成 `uuid`
- 初始化运行时目录
- 返回当前状态 `draft`
- `title` 初始允许为 `null`
- `root_ids` 初始为空对象 `{}`

成功响应示例：

```json
{
  "id": "...",
  "uuid": "...",
  "title": null,
  "status": "draft",
  "start_time_minute": 0,
  "current_time_minute": 0,
  "data_directories": {
    "session_root": "...",
    "story": "...",
    "history": "...",
    "truth": "...",
    "npc": "...",
    "dialogue": "...",
    "clue": "..."
  },
  "root_ids": {}
}
```

## 3. 会话列表查询

### 3.1 `GET /api/v1/sessions`

说明：

- 返回全部会话的基础状态列表
- 响应体为数组，不额外包裹 `items/total`
- 默认按 `created_at` 倒序（最新创建的会话在前）
- 列表项不包含 `data_directories`
- 列表项不包含 `root_ids`

示例：

```http
GET /api/v1/sessions
```

成功响应示例：

```json
[
  {
    "id": "...",
    "uuid": "...",
    "title": null,
    "status": "draft",
    "start_time_minute": 0,
    "current_time_minute": 0
  },
  {
    "id": "...",
    "uuid": "...",
    "title": "Generated Case 4f26c2ad",
    "status": "ready",
    "start_time_minute": 0,
    "current_time_minute": 15
  }
]
```

## 4. 世界初始化

### 4.1 `POST /api/v1/sessions/{session_id}/bootstrap`

作用：

- 将指定 `draft` 会话切换到 `generating`
- 通过多轮 AGENT 生成完整可玩的游戏世界
- 生成正式 `title`
- 生成地图、NPC、线索、事件与 truth payload
- 校验结构合法性后一次性落库
- 成功后将会话状态切为 `ready`

成功响应示例：

```json
{
  "session_id": "...",
  "status": "ready",
  "created_counts": {
    "characters": 3,
    "players": 1,
    "npcs": 2,
    "locations": 3,
    "connections": 2,
    "clues": 2,
    "events": 1,
    "dialogues": 0
  },
  "root_ids": {
    "player_id": "...",
    "map_id": "..."
  }
}
```

失败语义：

- `404`：会话不存在
- `409`：会话已 `ready`
- `409`：会话当前处于 `generating`
- `422`：AGENT 返回结构可解析，但未通过本地业务校验
- `502`：AGENT 返回内容无法解析为结构化结果
- `503`：模型 provider 不可用、超时或调用失败

`422` 示例：

```json
{
  "detail": {
    "message": "Generated world blueprint failed validation.",
    "errors": [
      "truth.required_clue_keys must contain at least one clue key."
    ]
  }
}
```

## 5. 会话读取

### 5.1 `GET /api/v1/sessions/{session_id}`

说明：

- 返回会话基础状态、目录信息与根 ID 信息
- `title` 在 `draft / generating` 阶段允许为 `null`
- `root_ids` 在会话未完成 bootstrap 时允许为空对象 `{}`
- bootstrap 成功后会返回 AGENT 生成的正式标题与根 ID
- 可用于确认 bootstrap 失败后状态是否已回退为 `draft`

成功响应示例（`draft`）：

```json
{
  "id": "...",
  "uuid": "...",
  "title": null,
  "status": "draft",
  "start_time_minute": 0,
  "current_time_minute": 0,
  "data_directories": {
    "session_root": "...",
    "story": "...",
    "history": "...",
    "truth": "...",
    "npc": "...",
    "dialogue": "...",
    "clue": "..."
  },
  "root_ids": {}
}
```

成功响应示例（`ready`）：

```json
{
  "id": "...",
  "uuid": "...",
  "title": "Generated Case 4f26c2ad",
  "status": "ready",
  "start_time_minute": 0,
  "current_time_minute": 15,
  "data_directories": {
    "session_root": "...",
    "story": "...",
    "history": "...",
    "truth": "...",
    "npc": "...",
    "dialogue": "...",
    "clue": "..."
  },
  "root_ids": {
    "player_id": "...",
    "map_id": "..."
  }
}
```

当前会话状态包括：

- `draft`
- `generating`
- `ready`
- `ended`

## 6. 动作提交

### 6.1 `POST /api/v1/actions`

当前仍支持：

- `move`
- `talk`
- `investigate`
- `gather`
- `accuse`

### 6.2 状态前置约束

动作提交前会校验会话状态：

- `draft`：返回 `409`，detail 为 `Session world state has not been bootstrapped.`
- `generating`：返回 `409`，detail 为 `Session world state is currently being generated.`
- `ended`：返回 `409`，detail 为 `Session has already ended.`

### 6.3 其他动作语义

当前 `move / talk / investigate / gather / accuse` 的引擎语义保持不变。

现阶段变化重点在于：

- 世界来源已从模板装配切换为 AGENT 生成
- truth、地点、角色和线索的具体内容不再由固定模板 key 决定
- 动作层仍消费同一套运行态数据库结构

## 7. 当前结论

当前版本对外 API 的关键变化是：

- `POST /sessions` 改为空请求体
- 新增 `GET /sessions` 查询全部会话
- `GET /sessions/{id}` 补充返回 `root_ids`，用于前端继续游戏
- `bootstrap` 改为多轮 AGENT 生成完整游戏
- 会话新增 `generating` 状态
- `title` 改为在 bootstrap 成功后生成并回写
