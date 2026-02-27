# web 开发环境配置说明

## 1. 运行环境

- Node.js: `>=22.12`（Vite 7 需要）
- 包管理器: 优先 `bun`（仓库包含 `bun.lock`）

## 2. 安装依赖

在 `web/` 目录执行：

```bash
bun install
```

## 3. 本地开发启动

```bash
bun run dev
```

默认由 Vite 启动开发服务（通常为 `http://localhost:5173`）。

## 4. 常用脚本

```bash
# 启动开发环境
bun run dev

# 代码检查
bun run lint

# 生产构建（TypeScript 编译 + Vite build）
bun run build

# 本地预览构建产物
bun run preview

# 生产启动（监听 0.0.0.0:${PORT:-3000}）
bun run start
```

## 5. 目录说明（简要）

- `src/`: 前端源码
- `public/`: 静态资源
- `vite.config.ts`: Vite 配置
- `eslint.config.js`: ESLint 配置

## 6. Coolify（Nixpacks）部署

- Build Pack: `Nixpacks`
- Base Directory: `web`
- 容器端口: `3000`
- Start Command: 使用 `bun run start`（由 `nixpacks.toml` 配置）
