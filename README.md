# NestJS Demo Monorepo

基于 pnpm workspace 的前后端分离 monorepo 项目。

## 目录结构

```
nestjs-demo/
├── package.json            # monorepo 根 package（仅 workspace 管理）
├── pnpm-workspace.yaml     # 定义子包
├── pnpm-lock.yaml          # 统一 lockfile（自动生成）
├── node_modules/           # pnpm store + hoisted 依赖（自动生成）
├── server/                 # NestJS 后端（@nestjs-demo/server）
│   ├── package.json
│   ├── README.md           # 后端说明文档
│   └── ...
└── web/                    # React 前端（@nestjs-demo/web）
    ├── package.json
    └── ...
```

## 首次拉取 / 新电脑

只需在根目录执行一次：

```bash
pnpm install
```

该命令会自动安装 `server/` 和 `web/` 两个子包的全部依赖。**不需要**分别进入子目录安装。

## 常用命令

| 操作 | 命令 |
|---|---|
| 安装全部依赖 | `pnpm install` |
| 启动后端 | `pnpm --filter @nestjs-demo/server start:dev` |
| 启动前端 | `pnpm --filter web dev` |
| 构建后端 | `pnpm --filter @nestjs-demo/server build` |
| 构建前端 | `pnpm --filter web build` |
| 添加后端依赖 | `pnpm --filter @nestjs-demo/server add <包名>` |
| 添加前端依赖 | `pnpm --filter web add <包名>` |

也可以 `cd server` / `cd web` 后直接运行对应的 `pnpm` 命令。

## 端口

| 服务 | 端口 |
|---|---|
| 后端 API | `localhost:3000` |
| 前端 Dev Server | `localhost:5173`（/api 代理到 3000） |

## 什么是 Monorepo？

**Monorepo = Mono（单一）+ Repo（仓库）= 单仓库**，即前后端代码放在同一个 Git 仓库里管理。

### 对比

| 方式 | 做法 |
|---|---|
| **Monorepo**（本项目方案） | 前端 `web/`、后端 `server/` 在同一仓库 |
| **Multi-repo**（传统方案） | 前端一个仓库，后端另一个仓库 |

### 优势

- **一个 PR 改前后端** — 改接口和改页面在同一 commit 里
- **统一依赖管理** — `pnpm install` 一次装完所有依赖
- **降低心智负担** — 不用来回切换仓库和终端窗口
