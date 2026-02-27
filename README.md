# EchoMind

EchoMind 是一个前后端分离的项目，仓库按 `api`（服务端）和 `web`（前端）组织。

## 目录结构

- `api/`: 后端服务代码（Bun + TypeScript），提供接口与业务逻辑。
- `web/`: 前端应用代码（Vite + TypeScript），提供用户界面。
- `packages/`: 预留的共享包目录（可放通用类型、工具函数、SDK 等）。
- `CLAUDE.md`: 项目协作与开发约定说明。

## 快速开始

### 1) 启动后端

```bash
cd api
bun install
bun run dev
```

默认地址：`http://localhost:3000`

### 2) 启动前端

```bash
cd web
bun install
bun run dev
```

默认地址（Vite）：通常为 `http://localhost:5173`

## 子目录说明文档

- `api` 详细说明见：`api/README.md`
- `web` 详细说明见：`web/README.md`

## Coolify 分开部署（Nixpacks）

在 Coolify 中创建两个 Service，均选择同一个仓库，但设置不同 Base Directory：

- API Service
  - Build Pack: `Nixpacks`
  - Base Directory: `api`
  - Port: `3000`
- Web Service
  - Build Pack: `Nixpacks`
  - Base Directory: `web`
  - Port: `3000`（容器内 `vite preview` 监听端口）

仓库已在 `api/nixpacks.toml` 和 `web/nixpacks.toml` 提供独立构建/启动配置，Coolify 会按各自目录自动读取。
