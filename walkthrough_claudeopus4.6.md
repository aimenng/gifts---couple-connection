# Claude Opus 4.6 修改记录

> 本文件记录由 Claude Opus 4.6 完成的所有代码修改及整改建议。
> `tsc --noEmit` 和 `npm run build` 均已通过验证。

---

## 1. 加载动画重新设计（像素小人 → SVG 矢量跑步角色）

### 1.1 改动背景

原始加载动画使用 CSS `box-shadow` 像素画技术，通过两帧 `<i>` 元素交替显示来模拟跑步，视觉上较为粗糙。用户要求参考 GitHub 风格的加载动画，将其升级为流畅、可爱的矢量动画。

### 1.2 修改文件

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `components/CuteLoadingScreen.tsx` | **重写** | 像素 div 结构替换为内联 SVG 矢量角色 |
| `index.css` (行 1199-1330) | **替换** | 所有 `.pixel-runner-*` 样式替换为 `.runner-*` SVG 动画样式 |

### 1.3 SVG 角色结构

```
SVG viewBox="0 0 200 110"
├── 地面线 (line y=100, 半透明 #8a9a5b)
├── 滚动地面标记 (.runner-ground-marks)
│   └── 5 个 rect，间距 50px，宽度略有变化增加自然感
├── 角色阴影 (.runner-shadow, ellipse)
├── 灰尘粒子 × 3 (.runner-dust-a/b/c)
└── 角色弹跳组 (.runner-bounce)
    ├── 后方手臂 (.runner-arm-b, 深色 #6b7a3c)
    ├── 后方腿部 (.runner-leg-b, 深色 #6b7a3c)
    ├── 身体 (ellipse cx=100 cy=68, 品牌色 #8a9a5b)
    ├── 前方腿部 (.runner-leg-f, 品牌色 #8a9a5b)
    ├── 前方手臂 (.runner-arm-f, 品牌色 #8a9a5b)
    ├── 围巾领口 (rect #e8837c)
    ├── 围巾飘尾 (.runner-scarf-tail, path #e8837c)
    ├── 头部 (circle r=14, 肤色 #fae8d4)
    ├── 头发 (path, 深绿 #7a8a4b)
    ├── 眼睛组 (.runner-blink)
    │   ├── 左眼 + 高光
    │   └── 右眼 + 高光
    ├── 腮红 × 2 (ellipse, #e8837c 30% 透明)
    └── 微笑 (path, #3d3d3d)
```

### 1.4 CSS 动画清单（13 个 @keyframes）

| 动画名 | 目标元素 | 时长 | 效果 |
|--------|----------|------|------|
| `runner-bounce` | `.runner-bounce` | 0.45s infinite | 角色整体上下弹跳 3px |
| `runner-ground-scroll` | `.runner-ground-marks` | 0.8s linear infinite | 地面标记向左滚动 50px（无缝循环） |
| `runner-shadow-pulse` | `.runner-shadow` | 0.45s infinite | 阴影随弹跳缩放 + 透明度变化 |
| `runner-leg-f` | `.runner-leg-f` | 0.45s alternate | 前腿摆动 -28° → +32°（从臀部 103,78 为轴心） |
| `runner-leg-b` | `.runner-leg-b` | 0.45s alternate | 后腿摆动 +32° → -28°（反相，轴心 97,78） |
| `runner-arm-f` | `.runner-arm-f` | 0.45s alternate | 前臂摆动 +28° → -32°（与后腿同相，轴心 103,58） |
| `runner-arm-b` | `.runner-arm-b` | 0.45s alternate | 后臂摆动 -32° → +28°（与前腿同相，轴心 97,58） |
| `runner-scarf-wave` | `.runner-scarf-tail` | 0.6s alternate | 围巾尾巴旋转 -6° + 平移 -2px |
| `runner-blink` | `.runner-blink` | 3s step-end infinite | 每 3 秒眨眼一次（scaleY 0.1） |
| `runner-dust-1` | `.runner-dust-a` | 0.9s infinite | 灰尘粒子从脚后飘出（无延迟） |
| `runner-dust-2` | `.runner-dust-b` | 0.9s infinite (delay 0.3s) | 灰尘粒子（延迟 0.3s） |
| `runner-dust-3` | `.runner-dust-c` | 0.9s infinite (delay 0.6s) | 灰尘粒子（延迟 0.6s） |

### 1.5 肢体动画原理

四肢使用 **CSS `translate` + `rotate` 组合动画** 实现：
- 肢体在 SVG 中画在原点 `(0,0)`，无自身坐标
- CSS `@keyframes` 中同时设置 `translate(pivotX, pivotY)` 定位到关节点 + `rotate(angle)` 绕关节旋转
- `alternate` 模式实现往复摆动，无需 JS 干预

对侧协调规则（自然跑步姿态）：
- **前腿 + 后臂**：同相位（同时向前/向后）
- **后腿 + 前臂**：同相位（与上组反相）

弹跳频率 = 肢体摆动频率的 2 倍（每步着地弹一次）。

### 1.6 配色方案

| 部位 | 颜色 | 说明 |
|------|------|------|
| 身体/前肢 | `#8a9a5b` | APP 品牌主色（鼠尾草绿） |
| 后方肢体 | `#6b7a3c` | 深一色阶，制造前后层次 |
| 头发 | `#7a8a4b` | 略深绿 |
| 皮肤 | `#fae8d4` | 暖色肤色 |
| 围巾 | `#e8837c` | 珊瑚色暖色系点缀 |
| 腮红 | `#e8837c` @ 30% | 同围巾色，低透明度 |
| 五官 | `#3d3d3d` | 深灰（明暗模式通用） |
| 地面/灰尘 | `#8a9a5b` @ 12-20% | 品牌色低透明度 |

### 1.7 保留的样式

以下样式**未改动**，维持加载卡片的整体外观一致：

- `.cute-loading-card`：卡片容器（圆角、边框、阴影、居中布局）
- `.cute-loading-text`：底部提示文字样式

---

## 2. P3 前端优化（F16-F19）

### F16 - 移除 paper-texture 叠加层

- **文件**: `components/Layout.tsx` + `index.html`
- **改动**: 删除 `<div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 paper-texture">` 及 `index.html` 中的 `.paper-texture` CSS 类
- **原因**: `opacity: 0.02` 人眼几乎不可见，但消耗 GPU 合成层并请求外部 unsplash 纹理图片
- **影响**: 无视觉差异，减少一次外部网络请求 + 减少 GPU 合成

### F17 - 缩短页面转场延迟

- **文件**: `App.tsx`
- **改动**: `setTimeout` 从 `180ms` → `80ms`
- **原因**: 180ms 延迟导致页面切换有明显"卡顿感"，80ms 足够触发 CSS 退场动画
- **影响**: 页面切换更流畅

### F18 - Landing 心形数组 useMemo

- **文件**: `pages/Landing.tsx`
- **改动**: `FloatingHearts` 组件中的 `hearts` 数组从每次渲染重新生成 → `useMemo(() => ..., [])`
- **原因**: 数组包含随机坐标/大小/延迟值，每次渲染重新随机会导致心形位置跳变
- **影响**: 心形位置稳定，避免不必要的重复计算

### F19 - addMemory 乐观更新

- **文件**: `context.tsx`
- **改动**: `addMemory` 在有云端会话时先用 `createLocalMemory` 立即插入一条临时条目到 UI，后端 API 成功后替换为服务器返回的真实条目；失败时保留本地条目作为兜底
- **原因**: 原实现需等待后端响应才能看到新添加的回忆，网络慢时体验差
- **影响**: 用户操作后立即看到新条目，感知延迟大幅降低

---

## 3. Bug 修复

### F14 修正 - Anniversary 添加按钮定位

- **文件**: `pages/Anniversary.tsx`
- **问题**: 原始 F14 优化将添加按钮从 `absolute` 改为 `fixed`，导致按钮定位参考变为浏览器视口，在 `max-w-md` 容器下按钮跑到屏幕右下角而非 APP 容器右下角
- **修复**: 恢复为 `absolute right-4 bottom-24 z-20`，定位在父容器 `relative` 内
- **教训**: 在有 `max-w-md` 布局约束的 APP 中，FAB 按钮应使用 `absolute` + 父容器 `relative`，而非 `fixed`

---

## 4. 后端待修改清单（维护参考）

> 以下为审查中发现的后端优化项，**前端已全部就绪**，后端可按需逐步改进。

### B01 - 全量数据接口分页

- **文件**: `backend/src/routes/appRoutes.js`
- **现状**: `GET /app/state` 每次返回全部 memories + events，数据量大时响应慢
- **建议改法**:
  - memories 改为分页返回，接受 `?page=1&limit=50` 参数
  - 首次只返回缩略图 URL（如果用了 Supabase Storage，可生成 thumbnail URL）
  - 详情/原图按点击时按需拉取
- **前端适配**: 前端 `context.tsx` 中 `syncFromCloud` 已改为分页拉取并追加（`CLOUD_SYNC_PAGE_SIZE = 50`，循环调用 `/memories?page=N&limit=50`）

### B02 - 批量写入原子化

- **文件**: `backend/src/routes/appRoutes.js`
- **现状**: `addMemoriesBatch` 逐条插入，中途失败会留下部分数据
- **建议改法**:
  - 改用 Supabase 的 `.insert(items)` 一次性批量写入（Supabase JS SDK 支持数组）
  - 失败时整体回滚，返回错误给前端

### B03 - 上传图片尺寸校验

- **文件**: `backend/src/imageStorage.js` + `backend/src/index.js`
- **现状**: 无后端尺寸限制，客户端可上传任意大小图片
- **建议改法**:
  - Express 中间件设置 `bodyParser.json({ limit: '10mb' })` 或更合理的上限
  - 可选：引入 `sharp` 库在后端二次压缩（如限制最大边长 2048px）

### B04 - yearStats 前端消费

- **文件**: `backend/src/routes/appRoutes.js`
- **现状**: 后端已计算 `yearStats` 并返回，前端 `context.tsx` 已适配—优先使用后端返回的 `yearStats`，仅在后端未返回时本地降级计算
- **建议改法**:
  - 确保后端 `GET /app/state` 始终返回 `yearStats` 字段
  - 前端 `Timeline.tsx` 中的年份统计可直接使用 `context` 中的 `yearStats`，减少 O(n) 遍历

### B05 - 接口限流

- **文件**: `backend/src/index.js`
- **现状**: 无请求速率限制，可被恶意刷接口
- **建议改法**:
  - `npm install express-rate-limit`
  - 全局限流：如 100 次/分钟
  - 登录/注册/重置密码等敏感接口：如 5 次/分钟
  ```js
  const rateLimit = require('express-rate-limit');
  app.use('/api/auth', rateLimit({ windowMs: 60000, max: 5 }));
  app.use('/api', rateLimit({ windowMs: 60000, max: 100 }));
  ```

### B06 - 验证码重置频率限制

- **文件**: `backend/src/routes/authRoutes.js`
- **现状**: 密码重置验证码无尝试次数限制，可被暴力枚举
- **建议改法**:
  - 数据库层面：验证码记录增加 `attempts` 字段，超过 5 次自动失效
  - 接口层面：同一邮箱 5 分钟内只允许请求 1 次验证码
  - 可结合 B05 的 `express-rate-limit` 实现

---

## 5. 本地校验结果

```
tsc --noEmit   ✅ 通过
npm run build  ✅ 通过 (vite v6.4.1, 4.33s)
```

输出：
```
dist/index.html                   2.77 kB │ gzip:   1.19 kB
dist/assets/index-DlnUsBbg.css  21.83 kB │ gzip:   5.38 kB
dist/assets/index-DUGIXGNJ.js  388.54 kB │ gzip: 111.96 kB
```

---

## 6. 修改文件总览

| 文件 | 改动类型 |
|------|----------|
| `components/CuteLoadingScreen.tsx` | 重写（像素 div → SVG 矢量角色） |
| `index.css` | 替换 pixel-runner CSS → runner SVG 动画（行 1199-1330） |
| `components/Layout.tsx` | 删除 paper-texture 叠加层 |
| `index.html` | 删除 .paper-texture CSS 类 |
| `App.tsx` | 页面转场 setTimeout 180ms → 80ms |
| `pages/Landing.tsx` | hearts 数组 useMemo 包裹 |
| `context.tsx` | addMemory 乐观更新（用户后续又独立增加了分页/yearStats） |
| `pages/Anniversary.tsx` | 修复 F14 按钮定位（fixed → 恢复 absolute） |
