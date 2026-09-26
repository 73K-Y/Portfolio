/*
 * Dati live di Ferrovie Tricolore per la pagina "In sviluppo".
 *
 * Fonte unica: il server Discord di Ferrovie Tricolore.
 *  - membri e online      -> invito pubblico (non serve il bot)
 *  - scheda del progetto  -> messaggio FISSATO nel canale aggiornamenti che inizia con "#scheda"
 *  - ultimi aggiornamenti -> ultimi messaggi del canale aggiornamenti
 *  - ultimi video TikTok  -> link di @ferrovietricolore nel canale dove il bot delle notifiche li pubblica
 *
 * Variabili d'ambiente (Netlify > Site configuration > Environment variables):
 *  DISCORD_BOT_TOKEN       token del bot (MAI nel codice o nel repo)
 *  FT_UPDATES_CHANNEL_ID   ID del canale aggiornamenti
 *  FT_TIKTOK_CHANNEL_ID    ID del canale con le notifiche TikTok
 *  FT_INVITE_CODE          facoltativo, default pH62fm3nkG
 */

const API = "https://discord.com/api/v10";
const TIKTOK_HANDLE = "ferrovietricolore";
const MAX_UPDATES = 3;
const MAX_VIDEOS = 3;

async function discord(path, token) {
  const res = await fetch(API + path, {
    headers: token ? { Authorization: `Bot ${token}` } : {},
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}


/* Converte il markdown di Discord in testo pulito per il sito */
const PICTO = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;
function cleanDiscord(raw) {
  const txt = (raw || "")
    .replace(/<a?:\w+:\d+>/g, "")                         // emoji personalizzate
    .replace(/@(everyone|here)/g, "")
    .replace(/<@[!&]?\d+>|<#\d+>/g, "")                     // menzioni e canali
    .replace(/<t:(\d+)(?::\w)?>/g, (_, t) => new Date(t * 1000).toLocaleDateString("it-IT"))
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")         // link markdown
    .replace(/\*\*|__|~~|\|\||`+/g, "")
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,!?:;]|$)/g, "$1$2")  // corsivo
    .replace(PICTO, "");
  const lines = txt.split("\n").map((l) => l.replace(/^(-#|>+)\s*/, "").replace(/\s+/g, " ").trim());
  let title = null;
  const body = [];
  for (const l of lines) {
    const h = l.match(/^#{1,3}\s+(.*)$/);
    if (h) { if (!title && h[1].trim()) title = h[1].trim(); else if (h[1].trim()) body.push(h[1].trim()); continue; }
    if (l) body.push(l);
  }
  return { title, text: summarize(body.join("\n"), 320) };
}
function summarize(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf(".\n"));
  if (stop > max * 0.5) return cut.slice(0, stop + 1).trim();
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "...";
}

function parseScheda(content) {
  // "#scheda" sulla prima riga, poi righe "Chiave: valore"
  return content
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.includes(":"))
    .map((l) => {
      const i = l.indexOf(":");
      return { key: l.slice(0, i).trim().slice(0, 40), value: l.slice(i + 1).trim().slice(0, 200) };
    })
    .filter((r) => r.key && r.value)
    .slice(0, 12);
}

async function getPins(channel, token) {
  try {
    const r = await discord(`/channels/${channel}/messages/pins?limit=50`, token);
    return (r.items || []).map((i) => i.message);
  } catch {
    return discord(`/channels/${channel}/pins`, token); // vecchio endpoint
  }
}

function tiktokIds(messages) {
  // Il canale contiene anche messaggi dello staff: si guardano solo i post dei bot.
  // PingSync non mette il link del video ma un'immagine "TikTokPost-<ID>.jpg": l'ID è quello.
  // Si scartano i post dello studio, così restano solo quelli di @ferrovietricolore.
  const ids = [];
  const link = new RegExp(`tiktok\\.com/@${TIKTOK_HANDLE}/(?:video|photo)/(\\d+)`, "gi");
  const pingsync = /TikTokPost-(\d{15,21})/g;
  for (const m of messages) {
    if (!m.author?.bot) continue;
    const raw = JSON.stringify(m);
    // Il bottone di PingSync contiene "account:ID" in base64: se l'account non è
    // @ferrovietricolore (per esempio lo studio), il post si scarta.
    const share = raw.match(/pingsync\.app\/share\/([A-Za-z0-9_-]+)/);
    if (share) {
      const decoded = Buffer.from(share[1], "base64url").toString("utf8");
      const handle = decoded.split(":")[0].toLowerCase();
      if (handle && handle !== TIKTOK_HANDLE) continue;
    }
    if (/tomhoda/i.test(raw)) continue;
    for (const match of [...raw.matchAll(link), ...raw.matchAll(pingsync)]) {
      if (!ids.includes(match[1])) ids.push(match[1]);
    }
    if (ids.length >= MAX_VIDEOS) break;
  }
  return ids.slice(0, MAX_VIDEOS);
}

export default async (req) => {
  const debug = new URL(req.url).searchParams.has("debug");
  const token = process.env.DISCORD_BOT_TOKEN;
  const updatesCh = process.env.FT_UPDATES_CHANNEL_ID;
  const tiktokCh = process.env.FT_TIKTOK_CHANNEL_ID;
  const invite = process.env.FT_INVITE_CODE || "pH62fm3nkG";

  const out = { members: null, online: null, scheda: [], updates: [], tiktok: [], updatedAt: new Date().toISOString() };
  if (debug) out.debug = { hasToken: !!token, hasUpdatesChannel: !!updatesCh, hasTiktokChannel: !!tiktokCh };

  try {
    const d = await discord(`/invites/${invite}?with_counts=true`);
    out.members = d.approximate_member_count ?? null;
    out.online = d.approximate_presence_count ?? null;
    out.guildId = d.guild?.id ?? d.guild_id ?? null;
  } catch (e) {
    console.error("ft-data invite:", e.message);
  }
  const jobs = [];

  if (token && updatesCh) {
    jobs.push(
      getPins(updatesCh, token).then((pins) => {
        const sheet = pins.find((m) => /^#scheda\b/i.test(m.content || ""));
        if (sheet) out.scheda = parseScheda(sheet.content);
      }),
      discord(`/channels/${updatesCh}/messages?limit=20`, token).then((msgs) => {
        out.updates = msgs
          .filter((m) => !/^#scheda\b/i.test(m.content || ""))
          .filter((m) => (m.content || "").trim() || (m.attachments || []).length)
          .slice(0, MAX_UPDATES)
          .map((m) => {
            const img = (m.attachments || []).find((a) => (a.content_type || "").startsWith("image/"));
            const { title, text } = cleanDiscord(m.content);
            return {
              date: m.timestamp,
              title,
              text,
              link: out.guildId ? `https://discord.com/channels/${out.guildId}/${updatesCh}/${m.id}` : null,
              image: img ? { url: img.url, width: img.width, height: img.height } : null,
            };
          });
      })
    );
  }

  if (token && tiktokCh) {
    jobs.push(discord(`/channels/${tiktokCh}/messages?limit=30`, token).then((msgs) => {
      out.tiktok = tiktokIds(msgs);
      if (debug) {
        const all = JSON.stringify(msgs);
        out.debug.tiktokMessages = msgs.length;
        out.debug.tiktokLinks = (all.match(/https?:\/\/[^"\s)]*tiktok[^"\s)]*/gi) || []).slice(0, 5);
        out.debug.sample = msgs.filter((m) => m.author?.bot).slice(0, 1).map((m) => ({
          author: m.author?.username,
          bot: !!m.author?.bot,
          content: (m.content || "").slice(0, 200),
          embeds: (m.embeds || []).map((e) => ({ type: e.type, url: e.url, title: e.title, author: e.author?.name })),
          buttons: (m.components || []).flatMap((r) => (r.components || []).map((c) => c.url || c.label)).slice(0, 4),
        }));
      }
    }));
  }

  const results = await Promise.allSettled(jobs);
  const errors = results.filter((r) => r.status === "rejected").map((r) => String(r.reason.message || r.reason));
  if (errors.length) console.error("ft-data:", errors.join(" | "));

  return new Response(JSON.stringify(out), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": debug ? "no-store" : "public, max-age=60",
      // Netlify tiene in cache la risposta 10 minuti: Discord non viene interrogato a ogni visita
      "Netlify-CDN-Cache-Control": debug ? "no-store" : "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
};
