# Walkthrough_2（后端设计优化版）

## 1. 目标说明
基于 `walkthrough.md` 中的前端改造现状与后端建议（B01~B06），本轮完成了后端能力增强，并保留兼容性，避免影响现有功能。

- 文档新增到 `walkthrough_2.md`，不覆盖原文档，便于差异维护。
- 本轮重点：分页、限流、上传防护、验证码安全、批量写入兜底。

---

## 2. 任务清单（逐步修改）

- [x] T1. 配置层升级（分页/限流/验证码/图片大小）
- [x] T2. 接口限流（全局 + Auth + 敏感接口）
- [x] T3. `/app/state` 与 `/memories` 可选分页化
- [x] T4. 图片上传大小校验与失败回滚清理
- [x] T5. 验证码策略加固（重置冷却 + 尝试上限配置化）
- [x] T6. 前端同步适配分页拉取（避免后端分页引入兼容问题）
- [x] T7. Timeline 直接消费后端 `yearStats`

---

## 3. 每一步改动内容

### Step 1：配置层升级（T1）
**文件**：`backend/src/config.js`、`backend/.env.example`

新增/调整配置项：
- `BODY_LIMIT` 默认从 `30mb` 收敛到 `12mb`
- `MAX_IMAGE_BYTES`（默认 10MB）
- `MEMORIES_PAGE_DEFAULT_LIMIT`（默认 50）
- `MEMORIES_PAGE_MAX_LIMIT`（默认 100）
- `VERIFICATION_MAX_ATTEMPTS`（默认 5）
- `SIGNUP_RESEND_COOLDOWN_SECONDS`（默认 45）
- `RESET_CODE_COOLDOWN_SECONDS`（默认 300）
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_API` / `RATE_LIMIT_MAX_AUTH` / `RATE_LIMIT_MAX_SENSITIVE`

### Step 2：接口限流（T2）
**文件**：`backend/src/index.js`

接入 `express-rate-limit` 并分级限流：
- `/api`：全局限流
- `/api/auth`：认证域限流
- 敏感接口单独限流：
  - `/api/auth/login`
  - `/api/auth/register/request-code`
  - `/api/auth/register/verify`
  - `/api/auth/password/request-reset-code`
  - `/api/auth/password/reset`

### Step 3：分页化设计（T3）
**文件**：`backend/src/routes/appRoutes.js`

新增可选分页能力（兼容旧调用）：
- `/api/app/state?page=1&limit=50`
- `/api/memories?page=2&limit=50`

返回新增字段：
- `memoryPagination: { page, limit, total, totalPages, hasMore }`

设计说明：
- 未传 `page/limit` 时保持原有全量行为（兼容已有调用）。
- 传参后按页返回，降低单次响应体积。
- 分页模式下 `yearStats` 通过轻量查询（`id,date`）计算，避免拉取全部大字段图片。

### Step 4：上传防护与回滚清理（T4）
**文件**：`backend/src/imageStorage.js`、`backend/src/routes/appRoutes.js`

新增能力：
- `validateMemoryImageInput(image)`：校验图片输入与 base64 大小上限。
- `persistMemoryImageDetailed(...)`：返回上传详情（含 `storageKey`）。
- `removeStoredMemoryImages(keys)`：数据库写入失败时清理已上传对象。

应用到以下接口：
- `POST /api/memories`
- `POST /api/memories/batch`
- `PATCH /api/memories/:id`

收益：
- 防止超大 base64 图片打爆请求与存储。
- 批量/单条写入失败时，减少 Storage 脏文件残留。

### Step 5：验证码安全加固（T5）
**文件**：`backend/src/routes/authRoutes.js`

调整点：
- 发送频控改为配置化：
  - 注册验证码冷却：`SIGNUP_RESEND_COOLDOWN_SECONDS`
  - 重置验证码冷却：`RESET_CODE_COOLDOWN_SECONDS`（默认 5 分钟）
- 验证码尝试上限改为配置化：`VERIFICATION_MAX_ATTEMPTS`（默认 5）

### Step 6：前端同步分页适配（T6）
**文件**：`context.tsx`

`syncFromCloud` 改造：
- 首次拉取：`/api/app/state?page=1&limit=50`
- 如 `hasMore=true`，继续按页拉 `/api/memories?page=N&limit=50`
- 聚合后一次性更新内存数据，兼容后端分页能力。

---

## 4. 与原后端建议（B01~B06）对应关系

- B01 全量接口分页：**已完成（兼容式分页）**
- B02 批量写入原子化：**已强化（失败后清理已上传文件）**
- B03 上传尺寸校验：**已完成（请求体 + base64 大小校验）**
- B04 yearStats 前端消费：**已完成（Timeline 优先消费后端 yearStats）**
- B05 接口限流：**已完成**
- B06 重置验证码频控：**已完成（5 分钟冷却 + 尝试上限）**

---

## 5. 本轮修改文件清单

- `backend/src/config.js`
- `backend/src/index.js`
- `backend/src/imageStorage.js`
- `backend/src/routes/appRoutes.js`
- `backend/src/routes/authRoutes.js`
- `backend/.env.example`
- `context.tsx`
- `package.json`
- `package-lock.json`

---

## 6. 本地校验结果

已执行并通过：
1. `node --check backend/src/index.js`
2. `node --check backend/src/routes/appRoutes.js`
3. `node --check backend/src/routes/authRoutes.js`
4. `node --check backend/src/imageStorage.js`
5. `npx tsc --noEmit`
6. `npm run build`

---

## 7. 后续建议（可继续迭代）

1. 如线上数据量继续增长，可新增“缩略图字段”或缩略图服务，进一步降低首屏流量。
2. 为 `/api/app/state` 与 `/api/memories` 增加端到端接口测试（分页边界、限流、超大图片）。
3. 为 `yearStats` 加一个轻量缓存策略（按用户+最近更新时间）进一步降低统计查询频率。
