# 收机参谋 · 二手 iPhone 收货决策工具

输入一条闲鱼描述，给出一张收货卡：**收不收、多少钱收、能卖多少、有什么坑、要问卖家什么。**

> 决策支持，不自动交易。数据为演示数据，仅供展示。

## 在线 demo

- 规则版（GitHub Pages，无 Key）：https://zhuyuanbao890-ship-it.github.io/zyb/
- AI 版（EdgeOne，接 DeepSeek）：https://zybpracticeproject-gdymcgxu.edgeone.cool/

## 功能

- 对话式填槽：AI 解析字段、自然追问（缺什么问什么，不整句复读、不瞎猜）
- 五维收货卡：价差空间 / 流动性 / 品相风险 / 卖家可信度 / 行情窗口
- 历史案例 RAG：按机型 / 存储 / 风险召回相似成交案例，出卡时展示「历史案例参考」
- 复盘闭环：成交后回写实际卖价，校准报价误差与锚点（EMA）

## 目录结构

| 文件 | 作用 |
|---|---|
| index.html | 前端（单文件，内置规则引擎 + 案例库，离线也能跑） |
| demo.html | index.html 的副本，保持一致 |
| functions/api/chat.js | EdgeOne 边缘函数：接 DeepSeek 做 LLM 解析 + 自然追问 |
| app/data/cases.json | 历史复盘案例（模拟数据，可上传替换） |
| app/ | FastAPI 后端（规则引擎 + RAG + 复盘校准，可选） |
| README.md | 本说明 |

## 部署到 EdgeOne（腾讯云）

1. 把仓库绑定到 EdgeOne Pages，输出目录留空（根目录）。
2. 在 EdgeOne 项目里加环境变量：

   DEEPSEEK_API_KEY = 你的 DeepSeek key

3. 打开页面，点右上角「设置」→ 选「自动（优先 AI）」。

## 数据上传

页面「设置」面板支持本地导入（解析到当前页面内存，刷新后恢复内置数据）：

- 候选样例 samples.json
- 行情锚点 anchors.csv
- 知识库 knowledge.json
- 历史案例 cases.json

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
