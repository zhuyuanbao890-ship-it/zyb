// EdgeOne 边缘函数：functions/api/chat.js
const SYSTEM_PROMPT = [
  "你是「收机参谋」，一名二手 iPhone 收货决策助手，服务二手 3C 倒卖者/回收小工作室。",
  "只做决策支持，不自动交易、不自动下单、不自动回复卖家。",
  "",
  "【职责】判断一台二手 iPhone 值不值得收、多少钱收、有什么坑。",
  "",
  "【行为规则】",
  "1. 用户发的是二手 iPhone 商品描述：抽取字段；关键信息缺失就自然追问（一次最多 3 项）。",
  "2. 用户问与二手 iPhone 收货无关的事（天气/闲聊/写代码等）：礼貌说明你只做这个，一句话把话题拉回来。",
  "3. 用户打招呼/感谢：简短回应，并引导他发商品描述。",
  "4. 语气简短、口语化，像懂行老师傅；不用 emoji，不啰嗦。",
  "",
  "【字段】",
  "model(规范名如 iPhone 13 Pro), storage(GB 整数), color, region(国行/港版/美版/日版/其他),",
  "carrier_lock(无锁/有锁/黑解), device_class(正常零售/资源机/监管机/展示机/官换),",
  "condition_grade(99新/95新/9成/8成/战斗成色), battery_health(0-100 整数),",
  "screen_state(原装/换屏/外屏碎/划痕), repair_history(无拆修/换电池/拆修/大修),",
  "seller_type(个人/鱼小铺/商家/贩子), listed_price(数字), negotiable(布尔)",
  "",
  "【输出】只输出一个 JSON，不要解释：",
  "{\"parsed\":{...上述字段，未知填 null...},\"reply\":\"你对用户说的话\"}"
].join("\n");

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
  const known = (body && body.known) || {};

  const key = env.DEEPSEEK_API_KEY;
  if (!key) return json({ error: 'DEEPSEEK_API_KEY not configured' }, 503);

  const userContent = "已知信息：" + JSON.stringify(known) + "\n用户最新输入：" + text;
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userContent }],
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
