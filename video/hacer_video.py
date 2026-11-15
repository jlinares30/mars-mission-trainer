"""Video de 30 s de Survival Mars para NASA Space Apps (inglés, voz automática, 1920x1080).

Uso (con el Python de vidauto, que ya trae playwright y edge-tts):
  ..\\..\\system-automation-videos\\.venv\\Scripts\\python hacer_video.py

1) Genera la narración por escena con una voz neuronal (edge-tts).
2) Graba cada escena jugando el juego publicado (?demo=1&lang=en) con Chromium sin ventana.
3) Ajusta cada escena a la duración de su narración, agrega subtítulos y etiquetas, y une todo con ffmpeg.
Resultado: video/salida/survival-mars-30s.mp4
"""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = os.environ.get("VIDEO_URL", "https://survival-mars.pages.dev/?demo=1&lang=en")
VOZ = "en-US-AndrewNeural"
VELOCIDAD = "+14%"
PORTADA = "equipo.png"   # imagen del equipo al inicio (1920x1080)
PORTADA_SEG = 2.5
# Marca visible obligatoria por las reglas de Space Apps sobre IA (voz generada y código asistido por IA)
MARCA = "AI-generated narration · Built with AI coding assistance"
W, H = 1920, 1080
FPS_SALIDA = 30
AIRE = 0.1   # pausa entre escenas (s)

AQUI = Path(__file__).resolve().parent
TRABAJO = AQUI / "trabajo"
SALIDA = AQUI / "salida"

# (id, etiqueta en pantalla, narración)
ESCENAS = [
    ("problema", "THE PROBLEM",
     "Kids see Mars in pictures, but they never feel the hard choices a crew must make: power, oxygen, food, and radiation."),
    ("solucion", "OUR SOLUTION",
     "Survival Mars is a free browser game for ages seven to twelve, built on real NASA data."),
    ("como", "HOW IT WORKS",
     "Choose who walks outside, collect regolith, and build a shield. Inside, the daily dose drops."),
    ("datos", "REAL NASA DATA",
     "Solar flares come from NASA DONKI. Every choice has a cost, just like a real mission."),
    ("cierre", "",
     "Play free at survival-mars dot pages dot dev."),
]


def sh(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit(f"Falló: {' '.join(cmd[:6])}...\n{p.stderr[-1500:]}")
    return p.stdout


def duracion(path: Path) -> float:
    return float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]).strip())


# ------------------------------------------------------------------ voz
async def _tts(texto: str, destino: Path) -> None:
    import edge_tts
    # El servicio de voz limita las solicitudes seguidas: esperar cada vez más entre intentos
    for intento, espera in enumerate([0, 8, 20, 45, 90]):
        await asyncio.sleep(espera)
        try:
            await edge_tts.Communicate(texto, VOZ, rate=VELOCIDAD).save(str(destino))
            return
        except edge_tts.exceptions.NoAudioReceived:
            print(f"    (el servicio de voz no respondió; reintento {intento + 1})")
    raise RuntimeError("El servicio de voz no respondió después de varios intentos.")


def generar_voces() -> dict[str, float]:
    tiempos = {}
    for id_, _, texto in ESCENAS:
        mp3 = TRABAJO / f"voz_{id_}.mp3"
        txt = TRABAJO / f"voz_{id_}.txt"
        if not (mp3.exists() and txt.exists() and txt.read_text(encoding="utf-8") == VELOCIDAD + "|" + texto):
            asyncio.run(_tts(texto, mp3))   # solo si no existe o cambió el texto
            txt.write_text(VELOCIDAD + "|" + texto, encoding="utf-8")
            time.sleep(3)
        tiempos[id_] = duracion(mp3)
        print(f"  voz {id_}: {tiempos[id_]:.2f} s")
    return tiempos


# ------------------------------------------------------------------ grabación
class Grabador:
    """Captura fotogramas con su hora real; luego se arma el video con duraciones variables."""

    def __init__(self, page, carpeta: Path):
        self.page, self.carpeta = page, carpeta
        carpeta.mkdir(parents=True, exist_ok=True)
        self.cuadros: list[tuple[Path, float]] = []

    def foto(self):
        p = self.carpeta / f"f{len(self.cuadros):05d}.jpg"
        self.page.screenshot(path=str(p), type="jpeg", quality=88)
        t = time.perf_counter()
        if getattr(self, "_corte", False) and self.cuadros:
            # Lo que pasó sin grabar no cuenta: el cuadro anterior dura solo 0,12 s
            q, t0 = self.cuadros[-1]
            self._desfase = getattr(self, "_desfase", 0.0) + (t - t0 - 0.12)
        self._corte = False
        self.cuadros.append((p, t - getattr(self, "_desfase", 0.0)))

    def corte(self):
        self._corte = True

    def grabar(self, segundos: float):
        fin = time.perf_counter() + segundos
        while time.perf_counter() < fin:
            self.foto()

    def js(self, codigo: str, espera: float = 0.0):
        r = self.page.evaluate(codigo)
        self.foto()
        if espera:
            self.grabar(espera)
        return r

    def a_video(self, destino: Path, objetivo: float):
        """Arma la escena con la hora real de cada cuadro y la ajusta a 'objetivo' segundos."""
        lista = self.carpeta / "lista.txt"
        lineas = []
        for i, (p, t) in enumerate(self.cuadros):
            dur = (self.cuadros[i + 1][1] - t) if i + 1 < len(self.cuadros) else 0.2
            lineas += [f"file '{p.as_posix()}'", f"duration {max(dur, 0.01):.4f}"]
        lineas.append(f"file '{self.cuadros[-1][0].as_posix()}'")
        lista.write_text("\n".join(lineas), encoding="utf-8")
        crudo = self.carpeta / "crudo.mp4"
        sh(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lista),
            "-vf", f"scale={W}:{H},fps={FPS_SALIDA}", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "18", str(crudo)])
        real = duracion(crudo)
        factor = objetivo / real
        # Si sobra material se acelera un poco (máx. 2x); si falta, se congela el último cuadro
        if factor < 1:
            vf = f"setpts={max(factor, 0.4):.4f}*PTS,fps={FPS_SALIDA},trim=duration={objetivo:.3f}"
        else:
            vf = f"tpad=stop_mode=clone:stop_duration={objetivo - real + 0.1:.3f},trim=duration={objetivo:.3f}"
        sh(["ffmpeg", "-y", "-v", "error", "-i", str(crudo), "-vf", vf + ",setpts=PTS-STARTPTS",
            "-an", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "18", str(destino)])
        print(f"  escena {destino.stem}: {len(self.cuadros)} cuadros, {real:.1f} s grabados → {objetivo:.2f} s")


ESPERAR = "new Promise(r => setTimeout(r, {ms}))"


def grabar_escenas(tiempos: dict[str, float]) -> None:
    with sync_playwright() as pw:
        nav = pw.chromium.launch(headless=True, args=[
            "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        ctx = nav.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1.5, locale="en-US")
        ctx.add_init_script("try { localStorage.setItem('survivalMars.tutorialVisto','1'); localStorage.setItem('survivalMars.idioma','en'); } catch {}")
        page = ctx.new_page()
        errores = []
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(2500)

        # 1) Problema: pantalla de inicio del juego
        g = Grabador(page, TRABAJO / "problema")
        g.grabar(1.5)
        g.js("document.querySelector('#modalCaja')?.scrollTo({top: 0})", espera=tiempos["problema"])
        g.a_video(TRABAJO / "problema.mp4", tiempos["problema"] + AIRE)

        # 2) Solución: empieza la misión y se ve la base
        g = Grabador(page, TRABAJO / "solucion")
        g.js("document.querySelector('#inNombre') && (document.querySelector('#inNombre').value = 'Ana'); document.querySelector('#btnEmpezar').click()", espera=1.0)
        g.js("document.querySelector('.cont-btn.no')?.click()", espera=tiempos["solucion"])
        g.a_video(TRABAJO / "solucion.mp4", tiempos["solucion"] + AIRE)

        # 3) Cómo funciona: se llega a cada estado SIN grabar y se graban solo los momentos clave
        hacer = lambda codigo, ms=0: (page.evaluate(codigo), page.wait_for_timeout(ms))
        g = Grabador(page, TRABAJO / "como")
        hacer("juego.mundo.seleccionar('rover')", 500)
        hacer("document.querySelector('[data-accion=eva]')?.click()", 1200)
        g.corte(); g.grabar(1.0)                                   # selector de tripulación con dosímetros
        hacer("[...document.querySelectorAll('.dos-capa button')].find(b => /goes|Sale/i.test(b.textContent))?.click()", 1500)
        for _ in range(3):                                         # recoger 3 bolsas de regolito
            hacer("""(() => { const e = juego.mundo.eva; const o = e.objetos.find(o => o.g.parent && o.tipo === 'regolito');
                     if (o) e.jugador.position.set(o.g.position.x + 0.7, e.jugador.position.y, o.g.position.z + 0.7); })()""", 350)
            g.corte(); g.grabar(0.35)
            hacer("juego.mundo.eva.recoger()")
            g.grabar(0.5)
        hacer("(() => { const e = juego.mundo.eva; e.jugador.position.set(0, e.jugador.position.y, 7.2); })()", 400)
        hacer("juego.mundo.eva.terminar(false)", 1300)             # entrar a la base: se depositan las bolsas
        g.corte(); g.grabar(0.9)
        hacer("document.querySelector('#modalCaja .btn-grande')?.click()", 700)
        page.keyboard.press("b"); page.wait_for_timeout(900)       # modo construcción
        g.corte(); g.grabar(0.6)
        hacer("[...document.querySelectorAll('.cons-btn')].find(b => !b.disabled)?.click()")
        g.grabar(2.2)                                              # Pared norte construida: 0,70 → 0,60 mSv
        g.a_video(TRABAJO / "como.mp4", tiempos["como"] + AIRE)
        page.keyboard.press("Escape"); page.wait_for_timeout(400)

        # 4) Datos reales: llegar SIN grabar a la emergencia de llamarada del Sol 2 (dato histórico de DONKI)
        for _ in range(3):
            if page.evaluate("!!document.querySelector('#modalCaja .opcion')"):
                break
            hacer("document.querySelector('#btnSol')?.click()", 3500)
            for _ in range(6):
                if page.evaluate("!!document.querySelector('#modalCaja .opcion') || document.querySelector('#modal').classList.contains('oculto')"):
                    break
                hacer("document.querySelector('#modalCaja .btn-grande')?.click()", 1200)
        g = Grabador(page, TRABAJO / "datos")
        g.grabar(tiempos["datos"] + 0.3)
        g.a_video(TRABAJO / "datos.mp4", tiempos["datos"] + AIRE)

        if errores:
            print("  Errores de la página durante la grabación:", errores[:3])
        nav.close()


# ------------------------------------------------------------------ cierre, subtítulos y montaje
def tarjeta_cierre(seg: float) -> None:
    fondo = TRABAJO / "como" / sorted(p.name for p in (TRABAJO / "como").glob("f*.jpg"))[-1]
    sh(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", str(fondo), "-t", f"{seg:.3f}",
        "-vf", f"scale={W}:{H},boxblur=18:2,eq=brightness=-0.25,fps={FPS_SALIDA}",
        "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "18", str(TRABAJO / "cierre.mp4")])


def ass_tiempo(s: float) -> str:
    h, r = divmod(s, 3600); m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def subtitulos(tiempos: dict[str, float]) -> Path:
    eventos, t = [], 0.0
    for id_, etiqueta, texto in ESCENAS:
        d = tiempos[id_] + AIRE
        if etiqueta:
            eventos.append(f"Dialogue: 1,{ass_tiempo(t)},{ass_tiempo(t + d)},Etiqueta,,0,0,0,,{etiqueta}")
        if id_ == "cierre":
            eventos.append(f"Dialogue: 2,{ass_tiempo(t)},{ass_tiempo(t + d + 0.4)},Titulo,,0,0,0,,Survival Mars")
            eventos.append(f"Dialogue: 2,{ass_tiempo(t)},{ass_tiempo(t + d + 0.4)},Link,,0,0,0,,survival-mars.pages.dev")
            eventos.append(f"Dialogue: 2,{ass_tiempo(t)},{ass_tiempo(t + d + 0.4)},Pie,,0,0,0,,Junior Astronaut Mission Trainer · NASA Space Apps Challenge 2026")
        else:
            # Subtítulo en trozos de ~7 palabras, con tiempo proporcional a las letras
            palabras = texto.split()
            trozos = [" ".join(palabras[i:i + 7]) for i in range(0, len(palabras), 7)]
            total = sum(len(x) for x in trozos)
            ti = t
            for x in trozos:
                dx = d * len(x) / total
                eventos.append(f"Dialogue: 0,{ass_tiempo(ti)},{ass_tiempo(ti + dx)},Sub,,0,0,0,,{x}")
                ti += dx
        t += d
    ass = TRABAJO / "subs.ass"
    ass.write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Arial,58,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,3,14,0,2,120,120,100,1
Style: Etiqueta,Arial,44,&H00FFFFFF,&H00FFFFFF,&H002C58E2,&H002C58E2,1,0,0,0,100,100,2,0,3,16,0,7,60,60,50,1
Style: Titulo,Arial,120,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,1,0,1,6,4,5,60,60,120,1
Style: Link,Arial,76,&H0047B3FF,&H0047B3FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,5,3,5,60,60,-110,1
Style: Pie,Arial,36,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,3,2,2,60,60,95,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(eventos) + "\n", encoding="utf-8")
    return ass


def montar(tiempos: dict[str, float]) -> Path:
    # Video: escenas unidas
    lista = TRABAJO / "escenas.txt"
    lista.write_text("\n".join(f"file '{(TRABAJO / f'{i}.mp4').as_posix()}'" for i, _, _ in ESCENAS), encoding="utf-8")
    unido = TRABAJO / "unido.mp4"
    sh(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(unido)])
    # Audio: cada voz al inicio de su escena, con AIRE s de aire entre escenas
    entradas, filtros, t = [], [], 0.0
    for k, (id_, _, _) in enumerate(ESCENAS):
        entradas += ["-i", str(TRABAJO / f"voz_{id_}.mp3")]
        ms = int(t * 1000)
        filtros.append(f"[{k}:a]adelay={ms}|{ms}[a{k}]")
        t += tiempos[id_] + AIRE
    filtros.append("".join(f"[a{k}]" for k in range(len(ESCENAS))) + f"amix=inputs={len(ESCENAS)}:normalize=0,loudnorm=I=-16:TP=-1.5[voz]")
    voz = TRABAJO / "voz.m4a"
    sh(["ffmpeg", "-y", "-v", "error", *entradas, "-filter_complex", ";".join(filtros), "-map", "[voz]", "-c:a", "aac", "-b:a", "192k", str(voz)])
    # Final: subtítulos + audio
    SALIDA.mkdir(exist_ok=True)
    final = SALIDA / "survival-mars-30s.mp4"
    ass = subtitulos(tiempos)
    ass_ruta = ass.as_posix().replace(":", "\\:")
    sh(["ffmpeg", "-y", "-v", "error", "-i", str(unido), "-i", str(voz), "-vf", f"subtitles='{ass_ruta}'",
        "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "19", "-preset", "slow", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)])
    return final


def agregar_portada(video: Path) -> Path:
    """Pone la imagen del equipo al inicio (aparece y se desvanece) y une todo, con audio en silencio en la portada."""
    portada = TRABAJO / "portada.mp4"
    sh(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(FPS_SALIDA), "-i", str(AQUI / PORTADA),
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-t", f"{PORTADA_SEG}", "-vf", f"scale={W}:{H},format=yuv420p,fade=t=in:st=0:d=0.3,fade=t=out:st={PORTADA_SEG - 0.35}:d=0.35",
        "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-shortest", str(portada)])
    con = video.with_name(video.stem + "-tmp.mp4")
    sh(["ffmpeg", "-y", "-v", "error", "-i", str(portada), "-i", str(video), "-filter_complex",
        "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]", "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-crf", "19", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart", str(con)])
    con.replace(video)
    return video


def marca_agua(video: Path) -> Path:
    """Marca de IA visible en todo el video (esquina superior derecha), incluida la portada."""
    ass = TRABAJO / "marca.ass"
    ass.write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Marca,Arial,30,&H00FFFFFF,&H00FFFFFF,&H50000000,&H50000000,1,0,0,0,100,100,0,0,3,8,0,3,40,40,22,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 5,0:00:00.00,9:00:00.00,Marca,,0,0,0,,{MARCA}
""", encoding="utf-8")
    ruta = ass.as_posix().replace(":", "\\:")
    con = video.with_name(video.stem + "-marca.mp4")
    sh(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf", f"subtitles='{ruta}'", "-c:v", "libx264", "-crf", "19",
        "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", str(con)])
    con.replace(video)
    return video


def main():
    TRABAJO.mkdir(parents=True, exist_ok=True)
    print("1/4 Voz...")
    tiempos = generar_voces()
    total = sum(tiempos.values()) + AIRE * len(ESCENAS)
    print(f"  duración total prevista: {total:.1f} s")
    (TRABAJO / "tiempos.json").write_text(json.dumps(tiempos, indent=2))
    print("2/4 Grabando el juego...")
    grabar_escenas(tiempos)
    print("3/4 Cierre...")
    tarjeta_cierre(tiempos["cierre"] + AIRE)
    print("4/4 Montaje...")
    final = montar(tiempos)
    if (AQUI / PORTADA).exists():
        final = agregar_portada(final)
    final = marca_agua(final)
    print(f"Listo: {final}  ({duracion(final):.1f} s)")


if __name__ == "__main__":
    main()
