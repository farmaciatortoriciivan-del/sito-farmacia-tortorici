// Previsioni del tempo e pollini per Trabia, da Open-Meteo (dati gratuiti, licenza CC BY 4.0).
// Il Worker le legge lato server e le tiene in cache per 30 minuti.
const LAT = 38.0045, LON = 13.6496;
const TTL = 1800;

export async function onRequest({ request, ctx }) {
  const cache = caches.default;
  const key = new Request(new URL("/api/meteo?v=1", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return alBrowser(hit);

  const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&timezone=Europe%2FRome&forecast_days=5` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max";
  const ariaUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&timezone=Europe%2FRome&forecast_days=1` +
    "&current=european_aqi" +
    "&hourly=grass_pollen,olive_pollen,birch_pollen,alder_pollen,mugwort_pollen,ragweed_pollen";

  let meteo = null, aria = null;
  try {
    const [m, a] = await Promise.all([
      fetch(meteoUrl, { cf: { cacheTtl: TTL } }),
      fetch(ariaUrl, { cf: { cacheTtl: TTL } }).catch(() => null),
    ]);
    if (m.ok) meteo = await m.json();
    if (a && a.ok) aria = await a.json();
  } catch (e) {}

  if (!meteo || !meteo.daily) {
    return new Response(JSON.stringify({ errore: true }), { status: 502, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  }

  // Pollini: valore massimo di oggi per ciascun tipo (granuli/m³)
  const pollini = {};
  if (aria && aria.hourly) {
    for (const k of ["grass", "olive", "birch", "alder", "mugwort", "ragweed"]) {
      const v = (aria.hourly[k + "_pollen"] || []).filter((x) => typeof x === "number");
      if (v.length) pollini[k] = Math.round(Math.max(...v));
    }
  }

  const d = meteo.daily;
  const giorni = d.time.map((t, i) => ({
    data: t,
    codice: d.weather_code[i],
    max: Math.round(d.temperature_2m_max[i]),
    min: Math.round(d.temperature_2m_min[i]),
    percMax: Math.round(d.apparent_temperature_max[i]),
    percMin: Math.round(d.apparent_temperature_min[i]),
    pioggia: d.precipitation_probability_max[i] ?? 0,
    mm: d.precipitation_sum[i] ?? 0,
    vento: Math.round(d.wind_speed_10m_max[i]),
    uv: Math.round((d.uv_index_max[i] ?? 0) * 10) / 10,
  }));
  const c = meteo.current || {};
  const out = {
    aggiornato: new Date().toISOString(),
    adesso: {
      temp: Math.round(c.temperature_2m), percepita: Math.round(c.apparent_temperature),
      umidita: c.relative_humidity_2m, codice: c.weather_code, vento: Math.round(c.wind_speed_10m), giorno: c.is_day === 1,
    },
    giorni,
    aria: aria && aria.current ? { aqi: aria.current.european_aqi } : null,
    pollini,
  };
  const res = new Response(JSON.stringify(out), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${TTL}` },
  });
  ctx.waitUntil(cache.put(key, res.clone()));
  return alBrowser(res);
}

// Al browser i dati arrivano sempre "da non conservare": così il telefono non tiene
// le previsioni vecchie (Cloudflare altrimenti gli diceva di tenerle per 4 ore).
// La copia per 30 minuti resta solo nella cache del server.
function alBrowser(r) {
  const out = new Response(r.body, r);
  out.headers.set("cache-control", "no-store");
  return out;
}
