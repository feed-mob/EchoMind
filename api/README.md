# api 开发环境配置说明

## 1. 运行环境

- Bun: `>=1.0`（推荐使用最新稳定版）
- Node.js: 建议安装 LTS（用于通用工具链兼容）

## 2. 安装依赖

在 `api/` 目录执行：

```bash
bun install
```

## 3. 本地开发启动

```bash
bun run dev
```

当前脚本等价于：

```bash
bun run --hot src/index.ts
```

服务默认监听：

- `http://localhost:3000`

## 4. 目录说明（简要）

- `src/index.ts`: API 入口文件
- `src/routes/`: 路由定义
- `src/controllers/`: 请求处理层
- `src/services/`: 业务逻辑层
- `src/middlewares/`: 通用中间件
