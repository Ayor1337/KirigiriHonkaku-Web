# Step 6 内容扩展 API 规范

> 本文档描述 Step 6 第一版对外 HTTP 接口约定。
> 当前版本不新增新端点，重点是说明模板组合、bootstrap 校验和最小复杂规则对现有接口语义的影响。
> 固定指令：Implementation Plan, Task List and Thought in Chinese

## 1. 范围

当前对外仍只使用以下接口：

- `POST /api/v1/sessions`
- `POST /api/v1/sessions/{session_id}/bootstrap`
- `GET /api/v1/sessions/{session_id}`
- `POST /api/v1/actions`

Step 6 第一版不新增：

- 模板列表查询接口
- 侦探板接口
- 知识池接口
- 隐藏区域专用动作接口

## 2. 会话创建

### 2.1 `POST /api/v1/sessions`

请求体：

```json
{
  "title": "Theater Demo",
  "case_template_key": "case-theater",
  "map_template_key": "map-theater",
  "truth_template_key": "truth-theater"
}
```

说明：

- 这三个 key 在 Step 6 中不再只是占位。
- 它们共同决定后续 bootstrap 时要装配哪一组内容模板。
- 创建会话阶段不校验组合是否合法。
- 真正的模板组合校验发生在 bootstrap 阶段。

成功响应仍返回：

- 会话基础字段
- 当前状态 `draft`
- 运行时数据目录

## 3. 世界初始化

### 3.1 `POST /api/v1/sessions/{session_id}/bootstrap`

作用：

- 按会话上的 `case/map/truth` key 解析模板组合
- 校验组合是否合法
- 装配地图、NPC、线索、事件和 truth payload

成功响应示例：

```json
{
  "session_id": "...",
  "status": "ready",
  "created_counts": {
    "characters": 4,
    "players": 1,
    "npcs": 3,
    "locations": 5,
    "connections": 5,
    "clues": 3,
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
- `409`：会话已经 bootstrap 过
- `422`：模板组合未注册

`422` 示例：

```json
{
  "detail": "Template combination is not registered."
}
```

## 4. 会话读取

### 4.1 `GET /api/v1/sessions/{session_id}`

说明：

- 只返回会话基础状态与目录信息
- 不展开模板详情
- 可用于确认 bootstrap 失败后状态是否仍为 `draft`

## 5. 动作提交

### 5.1 `POST /api/v1/actions`

当前仍支持：

- `move`
- `talk`
- `investigate`
- `gather`
- `accuse`

Step 6 第一版只增强现有动作语义，不新增动作类型。

### 5.2 `move`

`payload` 示例：

```json
{
  "target_location_key": "trap-storage"
}
```

新增语义：

- 引擎会结合连接上的 `access_rule.required_token` 判断目标是否可达。
- 如果玩家还没有所需 token，动作会被拒绝。

### 5.3 `investigate`

`payload` 可以为空对象：

```json
{}
```

新增语义：

- 当前地点可能通过调查发放访问 token。
- 当前地点上的线索只有在满足 `discovery_rule` 时才会被收集。
- 未满足条件的线索不会进入知识池，也不会出现在 `investigable_clues` 中。

调查结果示例关注字段：

- `state_delta_summary.investigation.discovered_clues`
- `state_delta_summary.investigation.granted_access_tokens`
- `scene_snapshot.details.reachable_locations`

### 5.4 `gather`

说明：

- 仍用于主动形成公开场合。
- Step 6 第一版没有新增 gather 参数，只继续复用当前结构。

### 5.5 `accuse`

说明：

- Step 6 第一版不新增新的结案模式。
- 通过不同模板下的 truth 配置和场景结构，拉开案件差异。

## 6. Scene Snapshot 关键补充

### 6.1 `reachable_locations`

含义：

- 只返回当前时间、当前地点、当前访问 token 条件下真正可走的地点。
- 默认不会包含未解锁的受限连接目标。

### 6.2 `investigable_clues`

含义：

- 只返回当前地点、当前条件下可见且可收集的线索。
- 条件线索在条件未满足时不会出现在这里。

## 7. 当前结论

Step 6 第一版对外 API 的变化重点不是“端点变多”，而是：

- 模板组合开始具有真实语义
- bootstrap 会拒绝非法组合
- move 开始受访问 token 约束
- investigate 开始驱动隐藏路径开放与条件线索显现
