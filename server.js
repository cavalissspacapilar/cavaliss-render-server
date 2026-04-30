import express from 'express';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10mb' }));

const API_KEY = process.env.RENDER_API_KEY || 'cavaliss-2026';
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'cavaliss-render' });
});

app.post('/render/:tipo', async (req, res) => {
  const { tipo } = req.params;
  const datos = req.body;
  const id = crypto.randomUUID();
  const tmpDir = join('/tmp', `render-${id}`);

  try {
    mkdirSync(tmpDir, { recursive: true });
    const html = generarHTML(tipo, datos);
    const htmlPath = join(tmpDir, 'index.html');
    writeFileSync(htmlPath, html);

    execSync(
      `npx --yes hyperframes render ${htmlPath} --output ${tmpDir}/output.mp4 --non-interactive`,
      { timeout: 180000, cwd: tmpDir }
    );

    const video = readFileSync(join(tmpDir, 'output.mp4'));
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="cavaliss-${tipo}-${id}.mp4"`);
    res.send(video);

  } catch (error) {
    console.error('Error al renderizar:', error.message);
    res.status(500).json({ error: error.message, tipo, datos });
  }
});

function generarHTML(tipo, datos) {
  const plantillas = {
    'post-servicio': htmlPostServicio,
    'lead-caliente': htmlLeadCaliente,
    'ads': htmlAds,
    'blog': htmlBlog
  };
  if (!plantillas[tipo]) throw new Error(`Tipo desconocido: ${tipo}`);
  return plantillas[tipo](datos);
}

function htmlPostServicio({ nombre = 'Clienta', servicio = 'Tratamiento Capilar' }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1920px; background:linear-gradient(160deg,#12002e,#2a0a5e,#1a0040); font-family:Georgia,serif; overflow:hidden; }
.logo { position:absolute; top:110px; left:50%; transform:translateX(-50%); font-size:44px; color:#c9a8ff; letter-spacing:10px; text-transform:uppercase; }
.headline { position:absolute; top:360px; left:50%; transform:translateX(-50%); font-size:56px; color:white; text-align:center; width:880px; line-height:1.35; }
.nombre { position:absolute; top:560px; left:50%; transform:translateX(-50%); font-size:76px; color:#c9a8ff; font-style:italic; text-align:center; }
.card { position:absolute; top:720px; left:90px; right:90px; background:rgba(255,255,255,0.07); border:1px solid rgba(201,168,255,0.3); padding:48px 64px; border-radius:24px; text-align:center; }
.card-label { font-size:22px; color:rgba(255,255,255,0.55); letter-spacing:4px; text-transform:uppercase; margin-bottom:14px; }
.card-titulo { font-size:42px; color:white; }
.cta { position:absolute; bottom:260px; left:50%; transform:translateX(-50%); text-align:center; }
.cta-texto { font-size:34px; color:rgba(255,255,255,0.8); }
.cta-url { font-size:38px; color:#c9a8ff; margin-top:18px; letter-spacing:2px; }
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
</head><body>
<div id="root" data-composition-id="post-servicio" data-start="0" data-width="1080" data-height="1920">
  <div class="logo clip" data-start="0.3" data-duration="7.7" data-track-index="0">CAVALISS</div>
  <div class="headline clip" data-start="0.9" data-duration="7.1" data-track-index="1">Tu cabello merece lo mejor</div>
  <div class="nombre clip" data-start="1.8" data-duration="6.2" data-track-index="2">${nombre}</div>
  <div class="card clip" data-start="2.6" data-duration="5.4" data-track-index="3">
    <div class="card-label">Tratamiento realizado hoy</div>
    <div class="card-titulo">${servicio}</div>
  </div>
  <div class="cta clip" data-start="4.5" data-duration="3.5" data-track-index="4">
    <div class="cta-texto">Agenda tu proxima cita</div>
    <div class="cta-url">cavaliss.com/reservar</div>
  </div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.from('.logo',     { opacity:0, y:-30, duration:0.8 }, 0.3)
  .from('.headline', { opacity:0, y:20,  duration:0.8 }, 0.9)
  .from('.nombre',   { opacity:0, scale:0.85, duration:0.9 }, 1.8)
  .from('.card',     { opacity:0, y:30,  duration:0.8 }, 2.6)
  .from('.cta',      { opacity:0, y:20,  duration:0.7 }, 4.5);
window.__timelines = window.__timelines || {};
window.__timelines['post-servicio'] = tl;
</script>
</body></html>`;
}

function htmlLeadCaliente({ nombre = '', servicio = 'Ritual Capilar', precio = '1,600' }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1920px; background:#0a0014; font-family:Georgia,serif; overflow:hidden; }
.logo { position:absolute; top:95px; left:50%; transform:translateX(-50%); font-size:40px; color:#c9a8ff; letter-spacing:8px; }
.hook { position:absolute; top:290px; left:50%; transform:translateX(-50%); font-size:58px; color:white; text-align:center; width:900px; line-height:1.4; }
.hook span { color:#c9a8ff; }
.card { position:absolute; top:680px; left:80px; right:80px; background:rgba(201,168,255,0.07); border:1px solid rgba(201,168,255,0.22); border-radius:28px; padding:64px; }
.card-tag { font-size:20px; color:#c9a8ff; letter-spacing:4px; text-transform:uppercase; margin-bottom:22px; }
.card-titulo { font-size:50px; color:white; margin-bottom:26px; line-height:1.25; }
.card-precio { font-size:44px; color:#c9a8ff; font-style:italic; }
.beneficios { position:absolute; top:1140px; left:80px; right:80px; }
.ben { font-size:32px; color:rgba(255,255,255,0.82); margin-bottom:22px; }
.cta-btn { position:absolute; bottom:180px; left:50%; transform:translateX(-50%); background:#c9a8ff; color:#0a0014; padding:38px 110px; border-radius:60px; font-size:38px; white-space:nowrap; }
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
</head><body>
<div id="root" data-composition-id="lead-caliente" data-start="0" data-width="1080" data-height="1920">
  <div class="logo clip" data-start="0.2" data-duration="8.8" data-track-index="1">CAVALISS</div>
  <div class="hook clip" data-start="0.8" data-duration="8.2" data-track-index="2">
    ${nombre ? nombre + ', tu' : 'Tu'} cabello merece el tratamiento <span>ideal</span>
  </div>
  <div class="card clip" data-start="2" data-duration="7" data-track-index="3">
    <div class="card-tag">Recomendado para ti</div>
    <div class="card-titulo">${servicio}</div>
    <div class="card-precio">desde $${precio} MXN</div>
  </div>
  <div class="beneficios clip" data-start="3.5" data-duration="5.5" data-track-index="4">
    <div class="ben">Diagnostico capilar incluido</div>
    <div class="ben">Spa Capilar en Zona Hotelera</div>
    <div class="ben">Resultados desde la 1a sesion</div>
  </div>
  <div class="cta-btn clip" data-start="5.5" data-duration="3.5" data-track-index="5">Reservar ahora</div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.from('.logo',       { opacity:0, duration:0.6 }, 0.2)
  .from('.hook',       { opacity:0, y:25, duration:0.8 }, 0.8)
  .from('.card',       { opacity:0, x:-35, duration:0.9 }, 2)
  .from('.ben',        { opacity:0, x:18, duration:0.5, stagger:0.2 }, 3.5)
  .from('.cta-btn',    { opacity:0, scale:0.87, duration:0.7 }, 5.5);
window.__timelines = window.__timelines || {};
window.__timelines['lead-caliente'] = tl;
</script>
</body></html>`;
}

function htmlAds({ servicio = 'Ritual Capilar', precio = '1,600', oferta = 'Disponibilidad limitada' }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1080px; background:linear-gradient(135deg,#12002e,#3a1870); font-family:Georgia,serif; overflow:hidden; }
.logo { position:absolute; top:80px; left:50%; transform:translateX(-50%); font-size:38px; color:#c9a8ff; letter-spacing:7px; }
.contenido { position:absolute; top:260px; left:50%; transform:translateX(-50%); text-align:center; width:920px; }
.contenido h1 { font-size:66px; color:white; line-height:1.3; }
.contenido h1 span { color:#c9a8ff; }
.precio-area { position:absolute; top:680px; left:50%; transform:translateX(-50%); text-align:center; }
.precio { font-size:54px; color:#c9a8ff; font-style:italic; }
.cta { position:absolute; bottom:90px; left:50%; transform:translateX(-50%); background:#c9a8ff; color:#12002e; padding:30px 84px; border-radius:54px; font-size:34px; }
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
</head><body>
<div id="root" data-composition-id="ads-video" data-start="0" data-width="1080" data-height="1080">
  <div class="logo clip" data-start="0.2" data-duration="6.8" data-track-index="0">CAVALISS</div>
  <div class="contenido clip" data-start="0.7" data-duration="6.3" data-track-index="1">
    <h1>${servicio}<br><span>${oferta}</span></h1>
  </div>
  <div class="precio-area clip" data-start="2.2" data-duration="4.8" data-track-index="2">
    <div class="precio">$${precio} MXN</div>
  </div>
  <div class="cta clip" data-start="4.2" data-duration="2.8" data-track-index="3">Reservar ahora</div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.from('.logo',         { opacity:0, y:-20, duration:0.6 }, 0.2)
  .from('.contenido',    { opacity:0, y:28, duration:0.8 }, 0.7)
  .from('.precio-area',  { opacity:0, scale:0.82, duration:0.7 }, 2.2)
  .from('.cta',          { opacity:0, y:18, duration:0.6 }, 4.2);
window.__timelines = window.__timelines || {};
window.__timelines['ads-video'] = tl;
</script>
</body></html>`;
}

function htmlBlog({ titulo = 'Tu cabello bajo el sol de Cancun', subtitulo = 'Lo que el calor y la humedad le hacen a tu fibra capilar', tip = 'Aplica un protector termico antes de salir' }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1920px; background:linear-gradient(180deg,#0a0014 0%,#1a0040 100%); font-family:Georgia,serif; overflow:hidden; }
.logo { position:absolute; top:95px; left:50%; transform:translateX(-50%); font-size:38px; color:#c9a8ff; letter-spacing:7px; }
.titulo { position:absolute; top:300px; left:80px; right:80px; font-size:60px; color:white; line-height:1.4; }
.subtitulo { position:absolute; top:620px; left:80px; right:80px; font-size:38px; color:rgba(255,255,255,0.7); line-height:1.6; }
.tip-card { position:absolute; top:980px; left:80px; right:80px; border-left:5px solid #c9a8ff; padding:44px 52px; background:rgba(201,168,255,0.07); }
.tip-etiqueta { font-size:22px; color:#c9a8ff; letter-spacing:4px; text-transform:uppercase; margin-bottom:18px; }
.tip-texto { font-size:36px; color:white; line-height:1.55; }
.blog-url { position:absolute; bottom:160px; left:50%; transform:translateX(-50%); font-size:32px; color:#c9a8ff; letter-spacing:2px; }
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
</head><body>
<div id="root" data-composition-id="blog-reel" data-start="0" data-width="1080" data-height="1920">
  <div class="logo clip" data-start="0.2" data-duration="9.8" data-track-index="0">CAVALISS</div>
  <div class="titulo clip" data-start="0.9" data-duration="9.1" data-track-index="1">${titulo}</div>
  <div class="subtitulo clip" data-start="2.2" data-duration="7.8" data-track-index="2">${subtitulo}</div>
  <div class="tip-card clip" data-start="4.2" data-duration="5.8" data-track-index="3">
    <div class="tip-etiqueta">TIP CAVALISS</div>
    <div class="tip-texto">${tip}</div>
  </div>
  <div class="blog-url clip" data-start="7.5" data-duration="2.5" data-track-index="4">cavaliss.com/blog</div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.from('.logo',      { opacity:0, duration:0.6 }, 0.2)
  .from('.titulo',    { opacity:0, y:28, duration:0.9 }, 0.9)
  .from('.subtitulo', { opacity:0, y:18, duration:0.8 }, 2.2)
  .from('.tip-card',  { opacity:0, x:-28, duration:0.8 }, 4.2)
  .from('.blog-url',  { opacity:0, duration:0.5 }, 7.5);
window.__timelines = window.__timelines || {};
window.__timelines['blog-reel'] = tl;
</script>
</body></html>`;
}

app.listen(PORT, () => {
  console.log(`Cavaliss Render Server corriendo en puerto ${PORT}`);
});
