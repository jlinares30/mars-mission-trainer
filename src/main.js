// Arranque y flujo del juego: une simulación + mundo 3D + interfaz.
import { Mundo } from './world3d/mundo.js';
import {
  crearPartida, iniciarSol, elegirEvento, simularSol, finDePartida, EVENTOS, ACCIONES,
  cambiarNivel, aprender, foto, setClima, enConjuncion, CLIMA, motivoNoEVA, iniciarEVA, terminarEVA,
  inventosPorElegir, eventoInvento,
} from './sim/motor.js';
import { MISION } from './sim/config.js';
import { mostrarHUDEVA, actualizarHUDEVA, avisoEVA, ocultarHUDEVA, tarjetaObjeto } from './ui/eva-hud.js';
import { cargarClimaEspacial } from './data/donki.js';
import { renderRecursos, renderEnergia, renderPanel, renderLog } from './ui/hud.js';
import { pantallaInicio, mostrarEvento, mostrarResumen, mostrarResumenEVA, pantallaFinal, panelDatos, panelTarea, refrescarClimaInicio, nombrePorDefecto } from './ui/modales.js';
import { beep, audio } from './ui/sonido.js';
import { iniciarTutorial } from './ui/tutorial.js';
import { iniciarRegistro, registrarDecision, registrarSol, registrarEVA } from './sim/registro.js';
import { enTormenta } from './sim/motor.js';
import './ui/dificultad-ui.js';   // selector Cadete / Comandante en la pantalla de inicio
import { aplicarDificultad, dificultadActual } from './sim/dificultad.js';
import { guardarPartida, cargarPartida, borrarPartida } from './sim/guardado.js';   // 💾 la partida sobrevive a una recarga
import { preguntarContinuar } from './ui/continuar.js';
import './ui/voz.js';             // narrador por voz (botones 🔈 y 🗣️)
import './ui/ubicacion.js';       // 📍 resumen del lugar de la base + mapas de NASA Mars Trek
import './ui/alerta-solar.js';    // ☀️ estado del Sol y alerta solar en vivo (NASA DONKI)
import { elegirAstronauta } from './ui/tripulacion.js';   // 🧑‍🚀 quién sale a caminar (dosímetros)
import './ui/construccion.js';    // 🧱 modo construcción del blindaje por secciones (tecla B)
import './ui/leyenda.js';         // 📖 qué significa cada ícono, palabra y tecla
import './ui/teclado.js';         // ⌨️ Esc cierra, Enter sigue, 1-4 elige en todas las ventanas
import { t, idioma, setIdioma, aplicarEstaticos, onIdioma } from './ui/i18n.js';
import { esDemo, aplicarDemo } from './sim/demostracion.js';
import { LLAMARADAS_RESPALDO } from './data/donki.js';

const $ = s => document.querySelector(s);
aplicarDemo();
document.body.classList.toggle('modo-demo', esDemo);
let S = crearPartida();
let sel = null;
let ocupado = false;
let tutorial = null;

const mundo = new Mundo($('#mundo'), { onSeleccion: id => { sel = id; if (id) beep(760, 0.05); refrescar(); } });
mundo.setEstado(() => S);
// Acceso para depurar desde la consola del navegador: juego.S, juego.mundo
window.juego = { mundo, get S() { return S; }, refrescar: () => refrescar() };

function refrescar() {
  S.conjuncion = enConjuncion(S);
  renderRecursos(S);
  renderEnergia(S);
  renderPanel(S, sel);
  renderLog(S);
  $('#btnSol').disabled = ocupado;
}

// Clics en el panel (niveles, acciones, selección)
document.addEventListener('click', e => {
  if (ocupado) return;
  const t = e.target.closest('[data-sis],[data-accion],[data-sel]');
  if (!t) return;
  if (t.dataset.sis) { cambiarNivel(S, t.dataset.sis, +t.dataset.d); beep(+t.dataset.d > 0 ? 880 : 440, 0.05); }
  else if (t.dataset.accion === 'eva') { return salirAExplorar(); }
  else if (t.dataset.accion) { ACCIONES[t.dataset.accion].hacer(S); beep(700, 0.06); }
  else if ('sel' in t.dataset) { seleccionarPanel(t.dataset.sel || null); return; }
  refrescar();
});

function seleccionarPanel(id) {
  if (['base', 'tripulacion', 'inventario'].includes(id)) {
    mundo.seleccionar(null); sel = id; refrescar();
  } else mundo.seleccionar(id);
}

// 💡 Inventos: cada hito de ciencia abre una elección (1 de 2). Se ofrece al terminar el sol y al volver de caminar.
async function ofrecerInventos() {
  while (inventosPorElegir(S) > 0) {
    beep(1320, 0.12, 'triangle');
    await mostrarEvento(S, eventoInvento(S));
    refrescar();
  }
}

async function terminarSol() {
  if (ocupado) return;
  if (tutorial?.activo()) tutorial.terminar(tutorial.ultimoPaso());
  ocupado = true;
  mundo.seleccionar(null);
  refrescar();

  const antes = foto(S);
  const id = elegirEvento(S);
  S.ultimoEvento = id;
  let ev = null, res = null;
  if (id) {
    ev = EVENTOS[id];
    ev.inicio?.(S);
    if (ev.fx) mundo.efecto(ev.fx);
    refrescar();
    // Medir cuánto tarda en elegir una opción (para el registro e insignias)
    const t0 = performance.now(); let tDecision = null, opcion = null;
    const medir = e => {
      if (tDecision == null && e.target.closest('.opcion:not(:disabled)')) {
        tDecision = (performance.now() - t0) / 1000;
        opcion = Number(e.target.closest('.opcion').dataset.op);
      }
      if (e.target.closest('#btnAyuda') && S.registro) S.registro.pidioAyuda = true;
    };
    document.addEventListener('click', medir, true);
    res = await mostrarEvento(S, ev);
    document.removeEventListener('click', medir, true);
    if (ev.tiempo) registrarDecision(S, id, tDecision, String(res).includes('Se acabó el tiempo'), opcion);
    aprender(S, ev.dato);
    refrescar();
  }

  await mundo.pasarSol();
  const tormentaHoy = enTormenta(S);
  const r = simularSol(S, res, ev);
  registrarSol(S, id, tormentaHoy);
  const fin = finDePartida(S);
  refrescar();
  await mostrarResumen(S, antes, r, fin);

  if (fin) {
    borrarPartida();   // la misión terminó: no se ofrece continuarla
    await pantallaFinal(S, fin);
    return nuevaPartida();
  }
  await ofrecerInventos();
  S.sol++;
  iniciarSol(S);
  guardarPartida(S, dificultadActual);   // 💾 al empezar cada sol
  ocupado = false;
  refrescar();
}

// ---------------------------------------------------------------------
//  CAMINATA ESPACIAL: el jugador controla a un astronauta
// ---------------------------------------------------------------------
async function salirAExplorar() {
  if (ocupado || motivoNoEVA(S)) return;
  if (tutorial?.activo()) tutorial.terminar();
  // Elegir quién sale (por defecto, quien tiene menos dosis): la caminata solo irradia a esa persona
  ocupado = true; refrescar();
  const quien = await elegirAstronauta(S);
  if (!quien) { ocupado = false; refrescar(); return; }
  S.evaAstronauta = quien;
  iniciarEVA(S);
  beep(600, 0.15, 'triangle');
  refrescar();
  const E = MISION.eva;
  mostrarHUDEVA(mundo.eva, S.plan);
  mundo.eva.iniciar({
    o2PorSeg: E.o2TrajePorSeg, radPorSeg: E.radPorSeg, multLlamarada: E.multLlamarada,
    // Getter: si llega una alerta solar DURANTE la caminata, la dosis afuera cambia desde ese momento
    get riesgo() { return CLIMA.riesgo; }, eficienciaPaneles: S.eficiencia,
    onUpdate: actualizarHUDEVA,
    onAviso: txt => { avisoEVA(txt); beep(300, 0.3, 'sawtooth'); },
    onRecoger: tipo => { beep(1200, 0.07, 'triangle'); tarjetaObjeto(tipo); },
    onFin: async res => {
      ocultarHUDEVA();
      const lineas = terminarEVA(S, res);
      registrarEVA(S, res, E.o2TrajePorSeg);
      refrescar();
      await mostrarResumenEVA(res, lineas);
      const fin = finDePartida(S);   // ¿la radiación o la salud llegaron al límite?
      if (fin && !fin.gano) { borrarPartida(); await pantallaFinal(S, fin); return nuevaPartida(); }
      await ofrecerInventos();
      guardarPartida(S, dificultadActual);   // 💾 al volver de una caminata
      ocupado = false;
      refrescar();
    },
  });
}

async function nuevaPartida() {
  ocupado = true;
  // Volver a la dificultad que marca la pantalla de inicio (una partida continuada pudo usar otra)
  try { aplicarDificultad(localStorage.getItem('survivalMars.dificultad') || 'cadete'); } catch { aplicarDificultad('cadete'); }
  aplicarDemo();   // la dificultad reescribe MISION: la demo (3 sols) debe aplicarse después
  S = crearPartida();
  refrescar();
  const { nombre, guiar } = await pantallaInicio();
  aplicarDemo();   // por si se eligió otra dificultad en la pantalla de inicio
  S = crearPartida(nombre);
  S.demo = esDemo;
  iniciarRegistro(S);
  const limpio = nombre.replace(/[<>&]/g, '');
  const sinNombre = nombrePorDefecto(nombre);   // evita "Comandante Comandante"
  S.log.unshift({ sol: 1, tipo: 'tierra',
    texto: sinNombre ? '🚀 <b>Comandante</b> al mando de la base en la meseta NE Syrtis.' : `🚀 Comandante <b>${limpio}</b> al mando de la base en la meseta NE Syrtis.`,
    texto_en: sinNombre ? '🚀 <b>Commander</b> in charge of the base on the NE Syrtis plateau.' : `🚀 Commander <b>${limpio}</b> in charge of the base on the NE Syrtis plateau.` });
  iniciarSol(S);
  guardarPartida(S, dificultadActual);   // 💾 misión nueva: reemplaza la guardada
  ocupado = false;
  refrescar();
  if (guiar) tutorial = iniciarTutorial(() => ({ S, sel }));
}

// Al abrir el juego: si hay una misión guardada, ofrecer continuarla
async function arrancar() {
  const g = esDemo ? null : cargarPartida();
  if (g && await preguntarContinuar(g)) {
    aplicarDificultad(g.dificultad);   // devuelve MISION y los tiempos a los de esa partida
    S = g.S;
    mundo.seleccionar(null);
    ocupado = false;
    refrescar();
    return;
  }
  return nuevaPartida();
}

$('#btnSol').onclick = terminarSol;
$('#btnDatos').onclick = panelDatos;
$('#btnTarea').onclick = () => { if (!S.enEVA) panelTarea(S); };
// Control base abre el menú; cada edificio, tripulación e inventario tiene su propio panel.
$('#btnBase').onclick = () => {
  if (ocupado) return;
  if (sel) return mundo.seleccionar(null);
  seleccionarPanel('base'); beep(760, 0.05);
};
addEventListener('keydown', e => { if (e.key === 'Escape' && sel && !ocupado) mundo.seleccionar(null); });
// E en la base = salir a explorar (afuera, la misma tecla recoge y entra). Solo sin ventanas abiertas.
addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'e' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target?.closest?.('input, textarea, select, [contenteditable]')) return;
  if (ocupado || S.enEVA || !$('#modal').classList.contains('oculto') || document.querySelector('.cons-capa, .dos-capa, .ubic-capa, .ley-capa, .cont-capa')) return;
  e.preventDefault();
  if (motivoNoEVA(S)) { beep(220, 0.15, 'sawtooth'); seleccionarPanel('rover'); return; }   // muestra por qué no se puede
  salirAExplorar();
});
$('#btnSonido').onclick = () => { audio.on = !audio.on; $('#btnSonido').textContent = audio.on ? '🔊' : '🔇'; };
$('#btnAyudaTuto').onclick = () => { if (!ocupado && !tutorial?.activo()) tutorial = iniciarTutorial(() => ({ S, sel })); };
$('#btnLog').onclick = () => $('#bitacoraBox').classList.toggle('abierta');
// Botón ES / EN (la elección se guarda en localStorage desde i18n.js)
$('#btnIdioma').onclick = () => {
  setIdioma(idioma === 'es' ? 'en' : 'es');
};
onIdioma(() => { refrescar(); ponerLigero(mundo.ligero, false); });
aplicarEstaticos();

refrescar();
// ---------------------------------------------------------------------
//  GRÁFICOS LIGEROS: botón 🐢, ?ligero=1 en el link, o automático si va lento
// ---------------------------------------------------------------------
const CLAVE_LIGERO = 'survivalMars.ligero';
const leerLigero = () => { try { return localStorage.getItem(CLAVE_LIGERO); } catch { return null; } };
function ponerLigero(on, guardar = true) {
  mundo.setLigero(on);
  $('#btnLigero').classList.toggle('activo', on);
  $('#btnLigero').classList.remove('sugerido');
  $('#btnLigero').title = t(on ? 'top.ligeroOn' : 'top.ligero');
  if (guardar) { try { localStorage.setItem(CLAVE_LIGERO, on ? '1' : '0'); } catch { /* sin almacenamiento */ } }
}
$('#btnLigero').onclick = () => ponerLigero(!mundo.ligero);
const pideLigero = new URLSearchParams(location.search).get('ligero');
if (pideLigero !== null) ponerLigero(pideLigero !== '0', false);
else if (leerLigero() === '1') ponerLigero(true, false);
else if (leerLigero() === null) {
  // Primera visita: si se ve lento, SUGERIR el modo ligero (no se cambia solo, para evitar falsos avisos)
  const sugerir = () => mundo.medirFPS().then(fps => {
    if (fps === null) return;                       // pestaña oculta: medición no válida
    if (fps < 28 && !mundo.ligero) {
      $('#btnLigero').classList.add('sugerido');
      S.log.unshift({ sol: S.sol, texto: `🐢 El juego va un poco lento en esta computadora. Prueba el botón 🐢 (gráficos ligeros).`, tipo: 'aviso' });
      refrescar();
    }
  });
  if (document.hidden) document.addEventListener('visibilitychange', sugerir, { once: true });
  else setTimeout(sugerir, 1500);
}

if (esDemo) {
  setClima({ real: false, tranquilo: false, origen: 'historico', consultadoEn: null,
    flares: [{ ...LLAMARADAS_RESPALDO[0] }], riesgo: 1,
    resumen: 'Demostración con una llamarada histórica NASA del 2024-10-03.',
    resumen_en: 'Demo using a historical NASA flare from 2024-10-03.' });
} else cargarClimaEspacial().then(c => { setClima(c); refrescar(); refrescarClimaInicio(); });
arrancar();
