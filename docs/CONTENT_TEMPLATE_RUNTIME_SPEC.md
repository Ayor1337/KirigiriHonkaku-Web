# Step 6 内容模板运行时规范

> 本文档描述 Step 6 第一版的内部运行时接口。
> 目标是把当前系统从单一默认 seed 推进到可注册、可校验、可扩展的多模板装配结构。
> 固定指令：Implementation Plan, Task List and Thought in Chinese

## 1. 目标

当前内部运行时需要解决三件事：

- 如何注册多套案件内容模板
- 如何校验 `case/map/truth` 组合是否合法
- 如何在不改动作接口的前提下支持受限路径与条件线索

## 2. 模板注册表

当前采用 Python 注册表模式，不使用外部 JSON 文件。

### 2.1 模板分类

运行时将模板分成三类：

- `case template`
  - 玩家初始状态
  - NPC 列表与日程
  - 线索列表
  - 初始事件
- `map template`
  - 地图名
  - 地点列表
  - 连接列表
- `truth template`
  - 真凶 key
  - 必要证据 key
  - 伪解目标
  - 公开 / 私下指认相关 truth payload

### 2.2 注册粒度

注册表内部不直接暴露给 HTTP。

当前运行时只要求：

- 每个模板 key 唯一
- 组合映射稳定
- bootstrap 时能从会话 key 找到唯一 seed 结果

## 3. 模板组合校验

### 3.1 输入

- `session.case_template_key`
- `session.map_template_key`
- `session.truth_template_key`

### 3.2 规则

- 运行时先查三元组组合映射
- 命中则解析到 canonical 模板组合
- 未命中则抛出未注册组合错误

### 3.3 当前约束

第一版不开放任意自由混搭。

这意味着：

- `case-manor + map-manor + truth-manor` 可以
- `case-theater + map-theater + truth-theater` 可以
- `case-manor + map-theater + truth-manor` 不可以

## 4. Bootstrap 装配接口

### 4.1 输入

- 一个处于 `draft` 的 `Session`

### 4.2 输出

- 统一 seed 结构，继续由 `WorldBootstrapService` 消费

统一 seed 至少包含：

- `map`
- `locations`
- `connections`
- `player`
- `npcs`
- `clues`
- `events`
- `truth`

### 4.3 失败条件

- 会话不存在
- 会话已 bootstrap
- 模板组合未注册

## 5. 最小复杂规则接口

### 5.1 地点发放访问 token

字段位置：

- `Location.status_flags.investigate_grants_access_tokens`

语义：

- 玩家在该地点执行 `investigate` 时，会把配置里的 token 加入 `PlayerState.unlocked_access`
- 只有新增 token 才写入状态

### 5.2 连接访问规则

字段位置：

- `Connection.access_rule.required_token`

语义：

- 若连接配置了 `required_token`，则只有当玩家 `unlocked_access` 包含该 token 时，这条连接才视为可用
- 该规则同时影响：
  - `move` 预校验
  - `scene_snapshot.reachable_locations`

### 5.3 条件线索规则

字段位置：

- `Clue.discovery_rule`

当前支持：

- `required_access_tokens`
- `min_time_minute`

语义：

- `required_access_tokens` 不满足时，线索仍留在世界中，但不允许被发现
- `min_time_minute` 未到时，线索同样不显现

## 6. 调查动作判定顺序

`investigate` 的最小判定顺序固定为：

1. 确认玩家当前位置
2. 从地点 `status_flags` 发放 access token
3. 读取该地点所有线索
4. 逐条判断 `discovery_rule`
5. 将满足条件的线索转移给玩家并写入知识池
6. 用更新后的 token 和线索状态生成场景快照

## 7. 第一版边界

当前明确不做：

- 模板查询 API
- 模板编辑器
- 侦探板运行时接口
- 更复杂的社会压力派生规则
- 条件线索之外的新动作系统

## 8. 当前结论

Step 6 第一版的内部运行时核心不是重写主循环，而是补出三条稳定边界：

- 模板注册边界
- 模板组合校验边界
- access token / 条件线索的最小规则边界
