// EdgeOne 边缘函数：functions/api/chat.js
// 部署后在 EdgeOne 项目设置里加环境变量 DEEPSEEK_API_KEY（服务端，浏览器不可见）
const SYSTEM_PROMPT = "你是「收机参谋」的解析模块。从用户文本抽取结构化字段，并在信息不足时生成一句自然的追问。只输出一个 JSON，不要解释。\n字段与取值：\n- model: 机型规范名，如 iPhone 13 Pro、iPhone 12 mini；无法判断为 null\n- storage: 存储容量整数 GB（64/128/256/512/1024）；未知 null\n- color: 颜色；未知 null\n- region: 国行/港版/美版/日版/其他；未知 null\n- carrier_lock: 无锁/有锁/黑解；未知 null\n- device_class: 正常零售/资源机/监管机/展示机/官换；未知 null\n- condition_grade: 99新/95新/9成/8成/战斗成色；未知 null\n- battery_health: 电池健康百分比整数 0-100；未知 null\n- screen_state: 原装/换屏/外屏碎/划痕；未知 null\n- repair_history: 无拆修/换电池/拆修/大修；未知 null\n- seller_type: 个人/鱼小铺/商家/贩子；未知 null\n- listed_price: 标价数字；未知 null\n- negotiable: 是否可议价 true/false；未知 null\nreply 规则：若关键信息（机型/存储/电池/版本/锁/成色/标价）有缺失，reply 写一句自然的追问（一次不超过 3 项）；信息足够则 reply 为空字符串。\n输出格式（严格）：{\"parsed\":{...上述字段...},\"reply\":\"...\"}";

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type'
  }});
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env || {};
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

  let body = null;
  try { body = await request.json(); } catch (e) { body = null; }
  const text = body && body.text;
  if (!text) return json({ error: 'text required' }, 400);
  const model = (body && body.model) || 'deepseek-chat';

  const key = env.DEEPSEEK_API_KEY;
  if (!key) return json({ error: 'DEEPSEEK_API_KEY not configured' }, 503);

  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: text }],
      temperature: 0,
      response_format: { type: 'json_object' }
    })
  });
  const data = await resp.json();
  if (!resp.ok) return json({ error: data }, 502);

  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  let out = { parsed: {}, reply: null };
  try {
    const obj = JSON.parse(content);
    out.parsed = obj.parsed || {};
    out.reply = obj.reply || null;
  } catch (e) {
    out.parsed = {};
  }
  return json(out);
}
