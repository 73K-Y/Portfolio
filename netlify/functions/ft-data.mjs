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
  const ids = [];
  const re = new RegExp(`tiktok\\.com/@${TIKTOK_HANDLE}/(?:video|photo)/(\\d+)`, "gi");
  for (const m of messages) {
    const text = [m.content, ...(m.embeds || []).flatMap((e) => [e.url, e.description, e.title])]
      .filter(Boolean)
      .join(" ");
    for (const match of text.matchAll(re)) {
      if (!ids.includes(match[1])) ids.push(match[1]);
    }
    if (ids.length >= MAX_VIDEOS) break;
  }
  return ids.slice(0, MAX_VIDEOS);
}

export default async () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const updatesCh = process.env.FT_UPDATES_CHANNEL_ID;
  const tiktokCh = process.env.FT_TIKTOK_CHANNEL_ID;
  const invite = process.env.FT_INVITE_CODE || "pH62fm3nkG";

  const out = { members: null, online: null, scheda: [], updates: [], tiktok: [], updatedAt: new Date().toISOString() };

  const jobs = [
    discord(`/invites/${invite}?with_counts=true`).then((d) => {
      out.members = d.approximate_member_count ?? null;
      out.online = d.approximate_presence_count ?? null;
    }),
  ];

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
            return {
              date: m.timestamp,
              text: (m.content || "").slice(0, 600),
              image: img ? { url: img.url, width: img.width, height: img.height } : null,
            };
          });
      })
    );
  }

  if (token && tiktokCh) {
    jobs.push(discord(`/channels/${tiktokCh}/messages?limit=30`, token).then((msgs) => { out.tiktok = tiktokIds(msgs); }));
  }

  const results = await Promise.allSettled(jobs);
  const errors = results.filter((r) => r.status === "rejected").map((r) => String(r.reason.message || r.reason));
  if (errors.length) console.error("ft-data:", errors.join(" | "));

  return new Response(JSON.stringify(out), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      // Netlify tiene in cache la risposta 10 minuti: Discord non viene interrogato a ogni visita
      "Netlify-CDN-Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
};
