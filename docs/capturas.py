"""Regenera las capturas de docs/img (1280x720, español) jugando el juego de forma automática.

Uso (con un servidor local en la raíz del repo, o una URL publicada):
    python -m http.server 5500 --bind 127.0.0.1
    python docs/capturas.py [URL_BASE]        # por defecto http://127.0.0.1:5500/
Requiere: pip install playwright && playwright install chromium, y ffmpeg en el PATH
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5500/").rstrip("/") + "/"
DESTINO = Path(__file__).resolve().parent / "img"
ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"]
INICIO = ("try { localStorage.clear(); localStorage.setItem('survivalMars.tutorialVisto','1');"
          " localStorage.setItem('survivalMars.idioma','es'); } catch {}")


def guardar(page, nombre: str) -> None:
    """PNG con paleta de 256 colores (ffmpeg) para que pese poco en el README."""
    ruta = DESTINO / nombre
    with tempfile.TemporaryDirectory() as tmp:
        crudo = Path(tmp) / "crudo.png"
        page.screenshot(path=str(crudo), type="png")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(crudo), "-vf",
                        "split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=none",
                        str(ruta)], check=True)
    print(f"  {nombre}: {ruta.stat().st_size // 1024} KB")


def abrir(nav, consulta: str):
    ctx = nav.new_context(viewport={"width": 1280, "height": 720}, locale="es-ES")
    ctx.add_init_script(INICIO)
    page = ctx.new_page()
    page.on("pageerror", lambda e: print("  ERROR de la página:", e))
    page.goto(BASE + consulta, wait_until="load")
    page.wait_for_timeout(2500)
    page.evaluate("document.querySelector('#inNombre') && (document.querySelector('#inNombre').value = 'Ana');"
                  "document.querySelector('#btnEmpezar')?.click()")
    page.wait_for_timeout(600)
    page.evaluate("document.querySelector('.cont-btn.no')?.click()")
    page.wait_for_timeout(2500)
    return ctx, page


def main() -> None:
    DESTINO.mkdir(exist_ok=True)
    with sync_playwright() as pw:
        nav = pw.chromium.launch(headless=True, args=ARGS)
        js = lambda page, codigo, ms=0: (page.evaluate(codigo), page.wait_for_timeout(ms))

        # 1-4: partida normal (10 sols)
        ctx, page = abrir(nav, "?lang=es")
        guardar(page, "01-base.png")

        js(page, "juego.mundo.seleccionar('rover')", 500)
        js(page, "document.querySelector('[data-accion=eva]')?.click()", 1200)
        guardar(page, "02-tripulacion.png")

        js(page, "[...document.querySelectorAll('.dos-capa button')].find(b => /Sale|goes/i.test(b.textContent))?.click()", 1800)
        for _ in range(3):
            js(page, """(() => { const e = juego.mundo.eva; const o = e.objetos.find(o => o.g.parent && o.tipo === 'regolito');
                if (o) e.jugador.position.set(o.g.position.x + 0.7, e.jugador.position.y, o.g.position.z + 0.7); })()""", 400)
            js(page, "juego.mundo.eva.recoger()", 500)
        page.wait_for_timeout(700)
        guardar(page, "03-caminata-mochila.png")

        js(page, "(() => { const e = juego.mundo.eva; e.jugador.position.set(0, e.jugador.position.y, 7.2); })()", 400)
        js(page, "juego.mundo.eva.terminar(false)", 1300)
        js(page, "document.querySelector('#modalCaja .btn-grande')?.click()", 700)
        page.keyboard.press("b"); page.wait_for_timeout(900)
        js(page, "[...document.querySelectorAll('.cons-btn')].find(b => !b.disabled)?.click()", 1200)
        guardar(page, "04-construccion.png")
        ctx.close()

        # 5: simulacro de alerta solar (?alerta=1 aparece a los 4 s, marcado como simulacro)
        ctx, page = abrir(nav, "?lang=es&alerta=1")
        page.wait_for_timeout(3000)
        guardar(page, "05-alerta-solar.png")
        ctx.close()

        # 6: pantalla final de la demo de 3 sols
        ctx, page = abrir(nav, "?demo=1&lang=es")
        for _ in range(40):
            if page.evaluate("/¡Misión (cumplida|abortada)!/.test(document.querySelector('#modalCaja')?.textContent || '')"):
                break
            if page.evaluate("!!document.querySelector('#modalCaja .opcion:not(:disabled)')"):
                js(page, "document.querySelector('#modalCaja .opcion').click()", 1200)
            elif page.evaluate("document.querySelector('#modal').classList.contains('oculto')"):
                js(page, "document.querySelector('#btnSol')?.click()", 3500)
            else:
                js(page, "document.querySelector('#modalCaja .btn-grande')?.click()", 1200)
        page.evaluate("document.querySelector('#modalCaja')?.scrollTo({top: 0})")
        page.wait_for_timeout(1500)
        guardar(page, "06-final.png")
        ctx.close()
        nav.close()


if __name__ == "__main__":
    main()
