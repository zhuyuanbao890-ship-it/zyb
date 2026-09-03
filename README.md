# 收机参谋 · 二手 iPhone 收货决策工具

输入一条闲鱼描述，给出一张收货卡：**收不收、多少钱收、能卖多少、有什么坑、要问卖家什么。**

> 决策支持，不自动交易。数据为演示数据，仅供展示。

## 在线 demo

https://zhuyuanbao890-ship-it.github.io/zyb/

## 目录结构

| 文件 | 作用 |
|---|---|
| index.html | 前端（单文件，内置规则引擎，离线也能跑） |
| functions/api/chat.js | 边缘函数：接 DeepSeek 做真 LLM 解析 |
| README.md | 本说明 |

## 部署到 EdgeOne（腾讯云）

1. 把仓库绑定到 EdgeOne Pages，输出目录留空（根目录）。
2. 在 EdgeOne 项目里加环境变量：

   DEEPSEEK_API_KEY = 你的 DeepSeek key

3. 打开页面，点右上角「设置」→ 选「自动（优先 AI）」。

## 对话引擎

- 自动：优先调 /api/chat（真 LLM），后端没配 key 时自动退回规则解析。
- 纯规则：完全本地，不联网。

## Key 安全

key 只放 EdgeOne 环境变量，不写进代码，访客不可见。

## 本地运行（Python 后端，可选）

```bash
cd 项目目录
.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000
```