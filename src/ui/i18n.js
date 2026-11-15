// =====================================================================
//  TRADUCCIONES ES / EN
//  - t('clave', {vars})  → textos de la interfaz (src/ui, index.html, main.js)
//  - tr('texto en español') → textos que vienen de src/sim y src/world3d.
//    Esos archivos NO se tocan: se traducen al mostrarlos (diccionario + patrones).
//  - txt(obj) / fuenteNombre / fuenteUso → campos *_en de src/data
//  La elección se guarda en localStorage.
// =====================================================================
const CLAVE = 'survivalMars.idioma';
export let idioma = (() => {
  const pedido = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('lang') : null;
  if (pedido === 'en' || pedido === 'es') return pedido;
  try { return localStorage.getItem(CLAVE) === 'en' ? 'en' : 'es'; } catch { return 'es'; }
})();
const oyentes = new Set();
export const onIdioma = fn => { oyentes.add(fn); return () => oyentes.delete(fn); };
export function setIdioma(l) {
  idioma = l === 'en' ? 'en' : 'es';
  try { localStorage.setItem(CLAVE, idioma); } catch { /* sin almacenamiento */ }
  document.documentElement.lang = idioma;
  document.body.classList.toggle('lang-en', idioma === 'en');
  aplicarEstaticos();
  oyentes.forEach(f => f(idioma));
}
export const esEN = () => idioma === 'en';

// ---------------------------------------------------------------------
//  1) TEXTOS DE LA INTERFAZ
// ---------------------------------------------------------------------
const T = {
  es: {
    // index.html
    'top.crater': 'Meseta NE Syrtis · Isidis Planitia', 'top.inventario': ' Inventario', 'top.inventario.t': 'Lo que recolectaste en Marte',
    'top.base': '🖥️ Control base', 'top.tarea.t': 'Lo que pide hoy Control de Misión', 'top.nasa': '📡 Datos', 'top.nasa.t': '¿Qué es real en este juego?',
    'top.datos': ' Datos NASA', 'top.datos.t': 'Datos de la NASA usados', 'top.tuto.t': 'Ver el tutorial otra vez',
    'top.sonido.t': 'Sonido', 'top.idioma.t': 'Change language to English', 'top.bitacora': ' Bitácora',
    'top.terminar': 'Terminar<span class="btn-txt-m"> el</span> Sol 🌙', 'top.clima': '☀️ Clima espacial: cargando…',
    // HUD
    'rec.ciencia': 'Ciencia', 'rec.ciencia.t': 'Puntos de ciencia. Meta: {meta}',
    'tag.tormenta': '🌪️ Tormenta de polvo', 'tag.conj': '🌞 Conjunción: sin contacto con la Tierra', 'tag.plegados': '🔽 Paneles plegados',
    'plan.tit': '📋 Plan del sol', 'plan.opcional': '(opcional)', 'plan.trae': 'Trae',
    'plan.sinTormenta': '🌪️ Hoy no hay caminata: tormenta de polvo.', 'plan.sinConj': '🌞 Sin plan: no hay contacto con la Tierra.',
    'plan.sinRadio': '📡 Sin plan: las comunicaciones están apagadas.', 'plan.cumplido': '¡Cumplido! Bono recibido.',
    'plan.bono': 'Bono: +{c} ciencia y +{s} salud', 'en.tit': '⚡ Energía de hoy', 'en.produces': 'Produces', 'en.gastas': 'Gastas',
    'en.manana': '🔋 mañana', 'en.apagon': '⚠️ ¡APAGÓN!',
    'pan.base': '🛰️ Tu base en Marte', 'pan.pista': '👆 Toca un edificio para controlarlo.', 'pan.repuestos': 'Repuestos', 'pan.botiquin': 'Botiquín',
    'pan.porNivel': '{c} kWh por nivel · gasta {g} kWh', 'pan.paneles': '☀️ Producen hoy: <b>{s} kWh</b> · Limpieza: <b>{e}%</b>',
    'pan.panelesTormenta': '<br>🌪️ La tormenta tapa el Sol: producen 75% menos.', 'pan.bateria': '🔋 Carga: <b>{b} / {m} kWh</b>',
    'pan.reactor': '⚛️ Produce: <b>{n} kWh</b> cada sol',
    'ed.habitat': 'Hábitat', 'ed.habitat.i': 'Aquí viven y duermen los 4 astronautas. Es el refugio cuando hay radiación peligrosa.',
    'ed.invernadero': 'Invernadero', 'ed.invernadero.i': 'Las plantas crecen con luces LED especiales. Cada sol la tripulación come 5 de comida.',
    'ed.lab': 'Laboratorio', 'ed.lab.i': 'La ciencia es la razón de la misión, pero cada experimento gasta energía. ¡Meta: {meta} puntos de ciencia!',
    'ed.antena': 'Antena', 'ed.antena.i': 'Los mensajes viajan a la velocidad de la luz, pero Marte está tan lejos que tardan unos 12 minutos.',
    'ed.paneles': 'Paneles solares', 'ed.paneles.i': 'Marte recibe menos de la mitad de luz solar que la Tierra. El polvo los tapa y raya.',
    'ed.bateria': 'Baterías', 'ed.bateria.i': 'Guardan la energía que sobra. Si la batería llega a 0 hay un apagón y los sistemas se apagan solos.',
    'ed.reactor': 'Mini reactor nuclear', 'ed.reactor.i': 'Da poca energía, pero siempre: de día, de noche y en tormentas. Está lejos de la base por seguridad.',
    'ed.rover': 'Rover explorador', 'ed.rover.i': 'Las rocas más valiosas están lejos de la base. ¡Pero cuanto más lejos vas, más oxígeno del traje gastas y más radiación recibes!',
    // Inicio
    'intro.sub': 'Entrenador de Misiones para Astronautas Junior',
    'intro.p2': 'Eres comandante de la base. Mantén a tu tripulación a salvo durante <b>{sols} sols</b> (días marcianos) y consigue ciencia hasta que llegue la nave de relevo.',
    'intro.nombre': '¿Cómo te llamas, comandante?', 'intro.ph': 'Tu nombre', 'intro.defecto': 'Comandante',
    'intro.c1b': 'Toca un edificio', 'intro.c1s': 'y reparte la energía', 'intro.c2b': 'Nada es gratis', 'intro.c2s': 'todo cuesta energía, oxígeno o radiación',
    'intro.c3b': '{s} segundos', 'intro.c3s': 'para decidir en una emergencia', 'intro.clima': 'Clima espacial:',
    'intro.climaSub': 'Datos de NASA DONKI. ¡La actividad real del Sol cambia qué tan arriesgada es tu misión!',
    'intro.empezar': '¡Comenzar misión! 🚀', 'intro.controles': '🖱️ Arrastra para moverte · Rueda para zoom · Clic derecho para girar',
    // Emergencias y resúmenes
    'ev.noDisp': 'No disponible', 'ev.ayuda': '📞 Pedir ayuda a Control de Misión', 'continuar': 'Continuar ▶',
    'ev.tiempo': '⏰ <b>¡Se acabó el tiempo!</b> ', 'fuente': 'Fuente:',
    'res.titulo': '🌅 Amanece el Sol {a} — resumen del Sol {s}', 'res.tranqui': 'Un sol tranquilo. ¡Todo funcionó!',
    'res.ciencia': '🧬 <b>Lo que dice la ciencia real:</b>', 'res.sabias': '💡 <b>¿Sabías que…?</b>',
    'res.gano': '¡Llegó la nave de relevo! 🚀', 'res.perdio': 'Ver qué pasó…', 'res.sig': 'Siguiente sol ▶',
    'eva.rescate': '¡Rescate!', 'eva.vuelta': '¡De vuelta en la base!',
    'eva.sabiasExtra': 'En Marte, cada minuto afuera es una decisión: más tiempo = más descubrimientos, pero también más radiación y menos oxígeno.',
    // Final
    'fin.cumplida': '¡Misión cumplida!', 'fin.abortada': '¡Misión abortada!',
    'fin.gano': 'Comandante <b>{n}</b>: tu tripulación sobrevivió {s} sols en Marte.',
    'fin.ganoSinNombre': '<b>Comandante</b>: tu tripulación sobrevivió {s} sols en Marte.',
    'fin.perdio': '{t} La tripulación volvió a la Tierra en el Sol {s}. ¡Los verdaderos planificadores de la NASA también aprenden de cada problema!',
    'fin.criterios': '⭐ Sobrevivir · ⭐ Lograr {c} de ciencia · ⭐ Lograrlo sin arriesgar a la tripulación (radiación &lt; {r} mSv y salud ≥ 70)',
    'fin.pocaCiencia': 'Sobrevivieron, pero la misión vino a Marte a hacer ciencia. ¿Puedes conseguir {c} puntos sin arriesgar a nadie?',
    'fin.ciencia': 'ciencia', 'fin.recolectaste': '🎒 Recolectaste en Marte:', 'fin.planes': '📋 Planes del sol cumplidos: <b>{a}</b> de {b}',
    'fin.aprendiste': '🧠 Lo que aprendiste ({n})', 'fin.otra': 'Jugar otra vez 🔄',
    // Inventario
    'inv.planOk': '📋 Plan del sol: {c} {i} {n} → ✅ <b>¡Cumplido!</b> Bono recibido.',
    'inv.planNo': '📋 Plan del sol: {c} {i} {n} → trajiste {l}. No pasa nada: mañana habrá otro plan. 🙂',
    'inv.hoyTit': '🎒 Recolectado hoy:', 'inv.hoyNada': 'nada (no saliste o volviste con las manos vacías)',
    'inv.tit': '🎒 Inventario de Marte', 'inv.desc': 'Lo que tu tripulación recolectó en las caminatas espaciales. Cada cosa se usa enseguida en la base.',
    'inv.hoy': 'hoy', 'inv.mision': 'misión',
    'inv.regolito': '🟫 Regolito en la base: <b>{r} {u}</b> · Blindaje: <b>{x}/{tot} secciones</b> (tecla B)',
    'inv.bolsa': '', 'inv.bolsas': '',
    'inv.proxLista': 'Próxima: {n} ({c} de regolito) ✅ ¡ya puedes construirla!',
    'inv.proxFalta': 'Próxima: {n} cuesta {c} de regolito (te faltan {f})',
    'inv.proxFalta1': 'Próxima: {n} cuesta {c} de regolito (te falta 1)',
    'inv.blindajeListo': '🏆 ¡Blindaje completo!',
    'inv.planHoy': '📋 <b>Plan de hoy:</b> trae {c} {i} {n} ({h}/{c})', 'inv.opcional': '— opcional, da bono', 'volver': 'Volver a la base',
    // Datos NASA
    'datos.tit': '📡 Datos reales de la NASA en este juego', 'datos.vivo': '🛰️ <b>EN VIVO</b>', 'datos.archivo': '📚 <b>ARCHIVO HISTÓRICO</b> (sin conexión)',
    'datos.nota': 'Los números del juego están simplificados para que sean fáciles de entender, pero se basan en estas mediciones reales.',
    // Caminata
    'eva.tit': '🧑‍🚀 Caminata espacial', 'eva.o2': '🫁 Oxígeno del traje', 'eva.o2.t': 'Oxígeno que queda en el tanque del traje',
    'eva.rad': '☢️ Radiación', 'eva.rad.t': 'Radiación recibida en esta caminata', 'eva.plan': '📋 Plan del sol: trae {c} {i} {n}',
    'eva.planListo': '✅ ¡Plan del sol listo! Vuelve a la base para entregarlo 🏠', 'eva.planAviso': '✅ ¡Plan del sol completo! Vuelve a la base para cobrar el bono',
    'eva.limpiar': '🧹 Limpiar paneles', 'eva.entrar': '🏠 Entrar a la base', 'eva.pocoO2': '⚠️ ¡Queda poco oxígeno en el traje! Vuelve a la base 🏠',
    'eva.recogiste': '¡Recogiste!',
    // Tutorial
    'tuto.1': '👋 ¡Hola, comandante! Esta es tu base en Marte. Te enseño cómo funciona en 30 segundos.',
    'tuto.2': '👆 <b>Toca el Hábitat</b>, la cúpula blanca donde vive tu tripulación.',
    'tuto.3': 'Aquí está el <b>soporte vital</b>: fabrica el oxígeno. Los botones <b>−</b> y <b>+</b> cambian cuánta energía usa. Déjalo en 2 por ahora.',
    'tuto.4': '⚡ Esta barra es tu <b>energía de hoy</b>. Verde = lo que produces. Naranja = lo que gastas. ¡Si gastas más de lo que produces, la batería baja!',
    'tuto.5': '🔬 Ahora <b>toca el Laboratorio</b>. Ahí se hace la ciencia de la misión.',
    'tuto.6': 'Pulsa <b>+</b> para encender los experimentos.',
    'tuto.7': '¿Ves? Ahora gastas más energía ({e}). <b>En Marte nada es gratis:</b> la ciencia cuesta energía, y la energía es para el oxígeno, la comida y el calor.',
    'tuto.7.sobra': 'te sobra menos', 'tuto.7.falta': '¡te falta!',
    'tuto.8': '🌙 Cuando termines de planear, pulsa <b>Terminar el Sol</b>. Si llega una emergencia, ¡tendrás muy pocos segundos para decidir! ¡Buena suerte!',
    'tuto.saltar': 'Saltar tutorial', 'tuto.sig': 'Siguiente ▶', 'tuto.ok': '¡Entendido!',
    // main.js
    'log.inicio': '🚀 Comandante <b>{n}</b> al mando de la base en la meseta NE Syrtis.',
    // Insignias
    'lg.tit': '🏅 Insignias ({a}/{b})', 'lg.nuevas': ' · ¡{n} nueva(s)!', 'lg.nueva': '¡NUEVA!',
    'lg.cumplida.n': 'Misión cumplida', 'lg.cumplida.d': 'Sobrevive hasta que llegue la nave de relevo.',
    'lg.cientifico.n': 'Científica/o de Marte', 'lg.cientifico.d': 'Cumple la meta de ciencia de la misión.',
    'lg.protegidos.n': 'Tripulación protegida', 'lg.protegidos.d': 'Gana con menos de {r} mSv de radiación.',
    'lg.blindaje.n': 'Escudo de regolito', 'lg.blindaje.d': 'Completa el blindaje del hábitat (3/3).',
    'lg.tormenta.n': 'Domador/a de tormentas', 'lg.tormenta.d': 'Pasa la tormenta de polvo sin ningún apagón.',
    'lg.sinApagon.n': 'Cero apagones', 'lg.sinApagon.d': 'Gana sin tener ni un solo apagón.',
    'lg.reflejos.n': 'Reflejos de astronauta', 'lg.reflejos.d': 'Decide una emergencia en 3 segundos o menos.',
    'lg.explorador.n': 'Exploradora/or', 'lg.explorador.d': 'Haz 3 caminatas espaciales en una misión.',
    'lg.porUnPelo.n': 'Por un pelo', 'lg.porUnPelo.d': 'Vuelve de una caminata con 10% de oxígeno o menos.',
    'lg.aire.n': 'Fábrica de aire', 'lg.aire.d': 'Recoge 5 bloques de hielo de agua en una misión.',
    'lg.geologo.n': 'Geóloga/o', 'lg.geologo.d': 'Recoge 6 rocas marcianas en una misión.',
    'lg.paciencia.n': 'Paciencia marciana', 'lg.paciencia.d': 'Pide ayuda a la Tierra y descubre el retraso de la señal.',
    'lg.curioso.n': 'Mente curiosa', 'lg.curioso.d': 'Descubre 12 datos de "¿Sabías que…?".',
    'lg.error.n': 'Aprender del error', 'lg.error.d': 'Pierde una misión. ¡Los astronautas también entrenan fallando!',
    // Informe
    'inf.tit': '📊 Informe de misión: así se desarrollaron tus decisiones',
    'inf.ayuda': 'Pasa el mouse sobre cada sol para ver qué ocurrió. Los sols con fondo café fueron días de tormenta.',
    'inf.o2': 'Oxígeno', 'inf.comida': 'Comida', 'inf.bateria': 'Energía (batería)', 'inf.rad': 'Radiación acumulada',
    'inf.peligro': 'zona de peligro', 'inf.limite': 'límite de la misión ({n})', 'inf.tabla': 'Ver los números en una tabla',
    'inf.tranquilo': 'Sol tranquilo', 'inf.apagon': '¡Apagón!', 'inf.rescate': 'Rescate en la caminata', 'inf.caminata': 'Caminata de {s} s',
    'inf.agotado': 'No decidiste a tiempo', 'inf.aria': 'Eventos de cada sol', 'inf.ariaG': '{n} sol a sol',
    'cmp.tit': '☢️ Tu tripulación recibió <b>{r} mSv</b>. ¿Eso es mucho?',
    'cmp.msv': 'mSv (milisievert) es la unidad para medir cuánta radiación recibe una persona.',
    'cmp.rx': 'radiografías de pecho', 'cmp.tierra': 'viviendo en la Tierra', 'cmp.iss': 'en la Estación Espacial', 'cmp.limite': 'del límite de esta misión',
    'cmp.anios': '{n} años', 'cmp.dias': '{n} días',
    'cmp.fuentes': 'Valores aproximados. Fuentes: Curiosity RAD (Marte), RadLab/OSDR (Estación Espacial), dosis anual promedio en la Tierra (~2,4 mSv) y radiografía de pecho (~0,1 mSv).',
    // Narrador
    'voz.escuchar': 'Escuchar', 'voz.aria': 'Escuchar este texto', 'voz.on': '🗣️ Narrador: sí', 'voz.off': '🗣️ Narrador',
    'voz.t': 'Leer en voz alta las emergencias y mensajes automáticamente',
    'voz.activado': 'Narrador activado. Leeré los mensajes de la misión en voz alta.',
    // Dificultad
    'dif.tit': 'Elige tu rango',
    'dif.cadete.n': 'Cadete', 'dif.cadete.e': '7 a 9 años', 'dif.cadete.r': '10 sols · 15 segundos para decidir · sin apagón de comunicaciones',
    'dif.comandante.n': 'Comandante', 'dif.comandante.e': '10 a 12 años', 'dif.comandante.r': '15 sols · 10 segundos para decidir · conjunción solar',
  },
  en: {
    'top.crater': 'NE Syrtis Plateau · Isidis Planitia', 'top.inventario': ' Inventory', 'top.inventario.t': 'What you collected on Mars',
    'top.base': '🖥️ Base control', 'top.tarea.t': 'What Mission Control asks for today', 'top.nasa': '📡 Data', 'top.nasa.t': 'What is real in this game?',
    'top.datos': ' NASA Data', 'top.datos.t': 'NASA data used in the game', 'top.tuto.t': 'Watch the tutorial again',
    'top.sonido.t': 'Sound', 'top.idioma.t': 'Cambiar el idioma a español', 'top.bitacora': ' Log',
    'top.terminar': 'End<span class="btn-txt-m"> the</span> Sol 🌙', 'top.clima': '☀️ Space weather: loading…',
    'rec.ciencia': 'Science', 'rec.ciencia.t': 'Science points. Goal: {meta}',
    'tag.tormenta': '🌪️ Dust storm', 'tag.conj': '🌞 Conjunction: no contact with Earth', 'tag.plegados': '🔽 Panels folded',
    'plan.tit': '📋 Sol plan', 'plan.opcional': '(optional)', 'plan.trae': 'Bring',
    'plan.sinTormenta': '🌪️ No spacewalk today: dust storm.', 'plan.sinConj': '🌞 No plan: no contact with Earth.',
    'plan.sinRadio': '📡 No plan: communications are off.', 'plan.cumplido': 'Done! Bonus received.',
    'plan.bono': 'Bonus: +{c} science and +{s} health', 'en.tit': '⚡ Today\'s power', 'en.produces': 'You make', 'en.gastas': 'You use',
    'en.manana': '🔋 tomorrow', 'en.apagon': '⚠️ BLACKOUT!',
    'pan.base': '🛰️ Your base on Mars', 'pan.pista': '👆 Tap a building to control it.', 'pan.repuestos': 'Spare parts', 'pan.botiquin': 'First-aid kit',
    'pan.porNivel': '{c} kWh per level · uses {g} kWh', 'pan.paneles': '☀️ Making today: <b>{s} kWh</b> · Clean: <b>{e}%</b>',
    'pan.panelesTormenta': '<br>🌪️ The storm blocks the Sun: they make 75% less.', 'pan.bateria': '🔋 Charge: <b>{b} / {m} kWh</b>',
    'pan.reactor': '⚛️ Makes: <b>{n} kWh</b> every sol',
    'ed.habitat': 'Habitat', 'ed.habitat.i': 'The 4 astronauts live and sleep here. It is the shelter when radiation gets dangerous.',
    'ed.invernadero': 'Greenhouse', 'ed.invernadero.i': 'Plants grow under special LED lights. Every sol the crew eats 5 food.',
    'ed.lab': 'Laboratory', 'ed.lab.i': 'Science is the reason for the mission, but every experiment uses power. Goal: {meta} science points!',
    'ed.antena': 'Antenna', 'ed.antena.i': 'Messages travel at the speed of light, but Mars is so far away that they take about 12 minutes.',
    'ed.paneles': 'Solar panels', 'ed.paneles.i': 'Mars gets less than half the sunlight Earth gets. Dust covers and scratches them.',
    'ed.bateria': 'Batteries', 'ed.bateria.i': 'They store the extra power. If the battery reaches 0 there is a blackout and systems switch off by themselves.',
    'ed.reactor': 'Mini nuclear reactor', 'ed.reactor.i': 'It gives a little power, but always: day, night and during storms. It is far from the base for safety.',
    'ed.rover': 'Explorer rover', 'ed.rover.i': 'The most valuable rocks are far from the base. But the farther you go, the more suit oxygen you use and the more radiation you get!',
    'intro.sub': 'Junior Astronaut Mission Trainer',
    'intro.p2': 'You are the base commander. Keep your crew safe for <b>{sols} sols</b> (Martian days) and do science until the relief ship arrives.',
    'intro.nombre': 'What is your name, commander?', 'intro.ph': 'Your name', 'intro.defecto': 'Commander',
    'intro.c1b': 'Tap a building', 'intro.c1s': 'and share out the power', 'intro.c2b': 'Nothing is free', 'intro.c2s': 'everything costs power, oxygen or radiation',
    'intro.c3b': '{s} seconds', 'intro.c3s': 'to decide in an emergency', 'intro.clima': 'Space weather:',
    'intro.climaSub': 'Data from NASA DONKI. The real activity of the Sun changes how risky your mission is!',
    'intro.empezar': 'Start mission! 🚀', 'intro.controles': '🖱️ Drag to move · Wheel to zoom · Right click to rotate',
    'ev.noDisp': 'Not available', 'ev.ayuda': '📞 Ask Mission Control for help', 'continuar': 'Continue ▶',
    'ev.tiempo': '⏰ <b>Time\'s up!</b> ', 'fuente': 'Source:',
    'res.titulo': '🌅 Sol {a} begins — summary of Sol {s}', 'res.tranqui': 'A quiet sol. Everything worked!',
    'res.ciencia': '🧬 <b>What real science says:</b>', 'res.sabias': '💡 <b>Did you know…?</b>',
    'res.gano': 'The relief ship is here! 🚀', 'res.perdio': 'See what happened…', 'res.sig': 'Next sol ▶',
    'eva.rescate': 'Rescue!', 'eva.vuelta': 'Back at the base!',
    'eva.sabiasExtra': 'On Mars, every minute outside is a decision: more time = more discoveries, but also more radiation and less oxygen.',
    'fin.cumplida': 'Mission accomplished!', 'fin.abortada': 'Mission aborted!',
    'fin.gano': 'Commander <b>{n}</b>: your crew survived {s} sols on Mars.',
    'fin.ganoSinNombre': '<b>Commander</b>: your crew survived {s} sols on Mars.',
    'fin.perdio': '{t} The crew went back to Earth on Sol {s}. Real NASA planners also learn from every problem!',
    'fin.criterios': '⭐ Survive · ⭐ Reach {c} science · ⭐ Do it without putting the crew at risk (radiation &lt; {r} mSv and health ≥ 70)',
    'fin.pocaCiencia': 'You survived, but the mission came to Mars to do science. Can you get {c} points without putting anyone at risk?',
    'fin.ciencia': 'science', 'fin.recolectaste': '🎒 You collected on Mars:', 'fin.planes': '📋 Sol plans completed: <b>{a}</b> of {b}',
    'fin.aprendiste': '🧠 What you learned ({n})', 'fin.otra': 'Play again 🔄',
    'inv.planOk': '📋 Sol plan: {c} {i} {n} → ✅ <b>Done!</b> Bonus received.',
    'inv.planNo': '📋 Sol plan: {c} {i} {n} → you brought {l}. That\'s OK: there will be another plan tomorrow. 🙂',
    'inv.hoyTit': '🎒 Collected today:', 'inv.hoyNada': 'nothing (you didn\'t go out or came back empty-handed)',
    'inv.tit': '🎒 Mars inventory', 'inv.desc': 'What your crew collected on spacewalks. Everything is used right away in the base.',
    'inv.hoy': 'today', 'inv.mision': 'mission',
    'inv.regolito': '🟫 Regolith in the base: <b>{r} {u}</b> · Shield: <b>{x}/{tot} sections</b> (B key)',
    'inv.bolsa': '', 'inv.bolsas': '',
    'inv.proxLista': 'Next: {n} ({c} regolith) ✅ you can build it now!',
    'inv.proxFalta': 'Next: {n} costs {c} regolith ({f} more needed)',
    'inv.proxFalta1': 'Next: {n} costs {c} regolith (1 more needed)',
    'inv.blindajeListo': '🏆 Shield complete!',
    'inv.planHoy': '📋 <b>Today\'s plan:</b> bring {c} {i} {n} ({h}/{c})', 'inv.opcional': '— optional, gives a bonus', 'volver': 'Back to the base',
    'datos.tit': '📡 Real NASA data in this game', 'datos.vivo': '🛰️ <b>LIVE</b>', 'datos.archivo': '📚 <b>HISTORICAL ARCHIVE</b> (offline)',
    'datos.nota': 'The game\'s numbers are simplified so they are easy to understand, but they are based on these real measurements.',
    'eva.tit': '🧑‍🚀 Spacewalk', 'eva.o2': '🫁 Suit oxygen', 'eva.o2.t': 'Oxygen left in the suit tank',
    'eva.rad': '☢️ Radiation', 'eva.rad.t': 'Radiation received on this spacewalk', 'eva.plan': '📋 Sol plan: bring {c} {i} {n}',
    'eva.planListo': '✅ Sol plan ready! Go back to the base to deliver it 🏠', 'eva.planAviso': '✅ Sol plan complete! Go back to the base to get the bonus',
    'eva.limpiar': '🧹 Clean panels', 'eva.entrar': '🏠 Go into the base', 'eva.pocoO2': '⚠️ Suit oxygen is low! Go back to the base 🏠',
    'eva.recogiste': 'You collected!',
    'tuto.1': '👋 Hi, commander! This is your base on Mars. I\'ll show you how it works in 30 seconds.',
    'tuto.2': '👆 <b>Tap the Habitat</b>, the white dome where your crew lives.',
    'tuto.3': 'This is <b>life support</b>: it makes oxygen. The <b>−</b> and <b>+</b> buttons change how much power it uses. Leave it at 2 for now.',
    'tuto.4': '⚡ This bar is your <b>power for today</b>. Green = what you make. Orange = what you use. If you use more than you make, the battery goes down!',
    'tuto.5': '🔬 Now <b>tap the Laboratory</b>. That is where the mission\'s science happens.',
    'tuto.6': 'Press <b>+</b> to turn on the experiments.',
    'tuto.7': 'See? Now you use more power ({e}). <b>On Mars nothing is free:</b> science costs power, and power is for oxygen, food and heat.',
    'tuto.7.sobra': 'you have less left over', 'tuto.7.falta': 'you are short!',
    'tuto.8': '🌙 When you finish planning, press <b>End the Sol</b>. If an emergency comes, you will have very few seconds to decide! Good luck!',
    'tuto.saltar': 'Skip tutorial', 'tuto.sig': 'Next ▶', 'tuto.ok': 'Got it!',
    'log.inicio': '🚀 Commander <b>{n}</b> is in charge of the base on the NE Syrtis plateau.',
    'lg.tit': '🏅 Badges ({a}/{b})', 'lg.nuevas': ' · {n} new!', 'lg.nueva': 'NEW!',
    'lg.cumplida.n': 'Mission accomplished', 'lg.cumplida.d': 'Survive until the relief ship arrives.',
    'lg.cientifico.n': 'Mars scientist', 'lg.cientifico.d': 'Reach the mission\'s science goal.',
    'lg.protegidos.n': 'Protected crew', 'lg.protegidos.d': 'Win with less than {r} mSv of radiation.',
    'lg.blindaje.n': 'Regolith shield', 'lg.blindaje.d': 'Finish the habitat shield (3/3).',
    'lg.tormenta.n': 'Storm tamer', 'lg.tormenta.d': 'Get through the dust storm without a single blackout.',
    'lg.sinApagon.n': 'Zero blackouts', 'lg.sinApagon.d': 'Win without a single blackout.',
    'lg.reflejos.n': 'Astronaut reflexes', 'lg.reflejos.d': 'Decide an emergency in 3 seconds or less.',
    'lg.explorador.n': 'Explorer', 'lg.explorador.d': 'Do 3 spacewalks in one mission.',
    'lg.porUnPelo.n': 'Close call', 'lg.porUnPelo.d': 'Come back from a spacewalk with 10% oxygen or less.',
    'lg.aire.n': 'Air factory', 'lg.aire.d': 'Collect 5 blocks of water ice in one mission.',
    'lg.geologo.n': 'Geologist', 'lg.geologo.d': 'Collect 6 Martian rocks in one mission.',
    'lg.paciencia.n': 'Martian patience', 'lg.paciencia.d': 'Ask Earth for help and discover the signal delay.',
    'lg.curioso.n': 'Curious mind', 'lg.curioso.d': 'Discover 12 "Did you know…?" facts.',
    'lg.error.n': 'Learning from mistakes', 'lg.error.d': 'Lose a mission. Astronauts also train by failing!',
    'inf.tit': '📊 Mission report: how your decisions played out',
    'inf.ayuda': 'Hover over each sol to see what happened. Sols with a brown background were storm days.',
    'inf.o2': 'Oxygen', 'inf.comida': 'Food', 'inf.bateria': 'Power (battery)', 'inf.rad': 'Total radiation',
    'inf.peligro': 'danger zone', 'inf.limite': 'mission limit ({n})', 'inf.tabla': 'See the numbers in a table',
    'inf.tranquilo': 'Quiet sol', 'inf.apagon': 'Blackout!', 'inf.rescate': 'Rescue on the spacewalk', 'inf.caminata': '{s} s spacewalk',
    'inf.agotado': 'You didn\'t decide in time', 'inf.aria': 'Events of each sol', 'inf.ariaG': '{n} sol by sol',
    'cmp.tit': '☢️ Your crew received <b>{r} mSv</b>. Is that a lot?',
    'cmp.msv': 'mSv (millisievert) is the unit used to measure how much radiation a person receives.',
    'cmp.rx': 'chest X-rays', 'cmp.tierra': 'living on Earth', 'cmp.iss': 'on the Space Station', 'cmp.limite': 'of this mission\'s limit',
    'cmp.anios': '{n} years', 'cmp.dias': '{n} days',
    'cmp.fuentes': 'Approximate values. Sources: Curiosity RAD (Mars), RadLab/OSDR (Space Station), average yearly dose on Earth (~2.4 mSv) and a chest X-ray (~0.1 mSv).',
    'voz.escuchar': 'Listen', 'voz.aria': 'Listen to this text', 'voz.on': '🗣️ Narrator: on', 'voz.off': '🗣️ Narrator',
    'voz.t': 'Read emergencies and messages out loud automatically',
    'voz.activado': 'Narrator on. I will read the mission messages out loud.',
    'dif.tit': 'Choose your rank',
    'dif.cadete.n': 'Cadet', 'dif.cadete.e': 'ages 7 to 9', 'dif.cadete.r': '10 sols · 15 seconds to decide · no communications blackout',
    'dif.comandante.n': 'Commander', 'dif.comandante.e': 'ages 10 to 12', 'dif.comandante.r': '15 sols · 10 seconds to decide · solar conjunction',
  },
};

Object.assign(T.es, {
  'top.ligero': 'Gráficos ligeros (para computadoras lentas)',
  'top.ligeroOn': 'Gráficos ligeros: ACTIVADOS (toca para volver a normales)',
  'ubic.boton': '📍 Ubicación', 'ubic.title': 'Dónde está tu base en Marte',
  'ubic.intro': '📍 Conoce el lugar de tu base (con mapa de la NASA)',
  'ubic.dialog': 'Ubicación de la base', 'ubic.base': 'Tu base en Marte', 'cerrar': 'Cerrar',
  'clima.consulta': 'CONSULTA RECIENTE', 'clima.cache': 'CONSULTA GUARDADA', 'clima.historico': 'ARCHIVO HISTÓRICO',
  'clima.cargando': 'Cargando datos NASA…', 'clima.fecha': 'Última consulta: {fecha}',
  'fin.aprendiste': '🧠 Datos que exploraste ({n})',
});
Object.assign(T.en, {
  'top.ligero': 'Low graphics (for slower computers)',
  'top.ligeroOn': 'Low graphics: ON (tap to restore normal graphics)',
  'ubic.boton': '📍 Location', 'ubic.title': 'Where your base is on Mars',
  'ubic.intro': '📍 Explore your base location (with a NASA map)',
  'ubic.dialog': 'Base location', 'ubic.base': 'Your base on Mars', 'cerrar': 'Close',
  'clima.consulta': 'RECENT QUERY', 'clima.cache': 'SAVED QUERY', 'clima.historico': 'HISTORICAL ARCHIVE',
  'clima.cargando': 'Loading NASA data…', 'clima.fecha': 'Last queried: {fecha}',
  'fin.aprendiste': '🧠 Facts you explored ({n})',
});

export const campo = (o, nombre) => idioma === 'en' ? (o?.[nombre + '_en'] ?? o?.[nombre]) : o?.[nombre];
export const resumenClima = c => idioma === 'en' ? (c.resumen_en || tr(c.resumen)) : c.resumen;
export const estadoClima = c => t('clima.' + (c.origen || (c.real ? 'consulta' : 'historico')));
export function fechaClima(c) {
  if (!c.consultadoEn) return '';
  return t('clima.fecha', { fecha: new Date(c.consultadoEn).toLocaleString(idioma === 'en' ? 'en-US' : 'es-PE', { timeZoneName: 'short' }) });
}

export function t(clave, vars = {}) {
  const s = T[idioma][clave] ?? T.es[clave] ?? clave;
  return s.replace(/\{(\w+)\}/g, (_, n) => (vars[n] ?? ''));
}

// ---------------------------------------------------------------------
//  2) TEXTOS DE src/sim Y src/world3d (diccionario español → inglés)
// ---------------------------------------------------------------------
const EXACTO = new Map(Object.entries({
  // Recursos y sistemas (config.js)
  'Energía': 'Power', 'Oxígeno': 'Oxygen', 'Comida': 'Food', 'Radiación': 'Radiation', 'Tripulación': 'Crew', 'Ciencia': 'Science', 'Construcción': 'Construction',
  '🐢 El juego va un poco lento en esta computadora. Prueba el botón 🐢 (gráficos ligeros).': '🐢 The game is running slowly on this computer. Try the 🐢 button (low graphics).',
  'La batería guarda energía para la noche y las tormentas.': 'The battery stores power for the night and for storms.',
  'Lo fabrica el soporte vital. ¡Sin oxígeno no se respira!': 'Life support makes it. Without oxygen nobody can breathe!',
  'La tripulación come cada sol. El invernadero produce más.': 'The crew eats every sol. The greenhouse makes more.',
  'Radiación acumulada (mSv = milisievert, la unidad para medir radiación). Si llega al límite, la misión vuelve a la Tierra.': 'Total radiation (mSv = millisievert, the unit used to measure radiation). If it reaches the limit, the mission goes back to Earth.',
  'Baja si falta oxígeno, comida o calor.': 'It goes down if oxygen, food or heat run short.',
  'Soporte vital': 'Life support', 'Invernadero': 'Greenhouse', 'Comunicaciones': 'Communications', 'Laboratorio': 'Laboratory',
  'Fabrica oxígeno, recicla el agua y mantiene la base calentita (afuera hay -60 °C).': 'Makes oxygen, recycles water and keeps the base warm (it is -60 °C outside).',
  'Luces especiales y agua para cultivar papas, lechugas y frijoles.': 'Special lights and water to grow potatoes, lettuce and beans.',
  'Recibe avisos de Control de Misión en la Tierra (con 12 minutos de retraso).': 'Receives messages from Mission Control on Earth (with a 12-minute delay).',
  'Analiza rocas y suelo marciano. Da puntos de ciencia… pero gasta energía.': 'Analyzes Martian rocks and soil. Gives science points… but uses power.',
  '¡Apagado! El oxígeno baja muy rápido y hace frío': 'Off! Oxygen drops very fast and it gets cold',
  'Bajo: el oxígeno baja': 'Low: oxygen goes down', 'Normal: oxígeno estable': 'Normal: oxygen stays steady', 'Alto: el oxígeno sube': 'High: oxygen goes up',
  'Apagado: no crece nada': 'Off: nothing grows', 'Poca cosecha': 'Small harvest', 'Cosecha normal': 'Normal harvest', '¡Cosecha grande!': 'Big harvest!',
  'Apagadas: no recibes avisos': 'Off: you get no messages', 'Normal: recibes avisos': 'Normal: you get messages',
  'Videollamadas: la tripulación se anima': 'Video calls: the crew cheers up',
  'Apagado: sin experimentos': 'Off: no experiments', 'Experimentos: +4 ciencia por sol': 'Experiments: +4 science per sol',
  'A toda máquina: +8 ciencia por sol': 'Full speed: +8 science per sol',
  // Objetos de la caminata
  'Regolito': 'Regolith', 'Roca marciana': 'Martian rock', 'Hielo de agua': 'Water ice',
  'Es la capa de polvo y piedritas sueltas que cubre Marte. Es rojo porque tiene óxido de hierro: ¡Marte está oxidado como un clavo viejo!': 'It is the layer of dust and loose pebbles that covers Mars. It is red because it has iron oxide: Mars is rusty like an old nail!',
  '🧱 Para construir el blindaje y otras obras (tecla B).': '🧱 To build the shield and other buildings (B key).',
  'Muchas rocas de Marte son basalto, de volcanes antiguos. En el cráter Jezero, el rover Perseverance guarda muestras de rocas para buscar señales de vida antigua.': 'Many Martian rocks are basalt, from ancient volcanoes. In Jezero Crater, the Perseverance rover stores rock samples to look for signs of ancient life.',
  'Muchas rocas de Marte son basalto, de volcanes antiguos. En NE Syrtis hay rocas con olivino que el agua transformó en carbonato: pistas de que hubo agua y quizás vida antigua.': 'Many Martian rocks are basalt, from ancient volcanoes. At NE Syrtis there are olivine rocks that water turned into carbonate: clues that there was water and maybe ancient life.',
  'Los científicos en la Tierra quieren estudiar más rocas de NE Syrtis.': 'Scientists on Earth want to study more rocks from NE Syrtis.',
  'Ciencia: el laboratorio la analiza → +6 de ciencia.': 'Science: the lab analyzes it → +6 science.',
  'En Marte hay hielo de agua escondido bajo el suelo, sobre todo lejos del ecuador. Derretido da agua; con electricidad se separa en hidrógeno y oxígeno.': 'On Mars there is water ice hidden under the ground, especially far from the equator. Melted, it gives water; with electricity it splits into hydrogen and oxygen.',
  'Oxígeno: el soporte vital lo convierte en aire → +8 de oxígeno.': 'Oxygen: life support turns it into air → +8 oxygen.',
  // Acciones
  '🔽 Retraer paneles': '🔽 Retract panels', '🔼 Desplegar paneles': '🔼 Deploy panels',
  'Los protege del polvo, pero dejan de generar': 'Protects them from dust, but they stop making power',
  '¡Vuelven a generar energía solar!': 'They make solar power again!',
  '🔼 Paneles desplegados.': '🔼 Panels deployed.', '🔽 Paneles retraídos.': '🔽 Panels retracted.',
  '🧹 Salir a limpiar los paneles': '🧹 Go out and clean the panels', 'No se puede salir en plena tormenta': 'You can\'t go outside during a storm',
  '+30% eficiencia · cuesta +1,5 mSv de radiación': '+30% efficiency · costs +1.5 mSv of radiation',
  '🧑‍🚀 Una astronauta salió a limpiar los paneles (+1,5 mSv).': '🧑‍🚀 An astronaut went out to clean the panels (+1.5 mSv).',
  '⏸️ Pausar construcción del blindaje': '⏸️ Pause shield construction',
  'Cubrir el hábitat con tierra marciana: –60% de radiación. Cuesta +3 kWh por sol durante 3 sols.': 'Cover the habitat with Martian soil: –60% radiation. Costs +3 kWh per sol for 3 sols.',
  '🧑‍🚀 ¡Salir a explorar! (caminata espacial)': '🧑‍🚀 Go exploring! (spacewalk)',
  '🔧 Reparar invernadero': '🔧 Repair greenhouse', '🔧 Invernadero reparado.': '🔧 Greenhouse repaired.',
  'Ya hiciste la caminata de hoy. ¡Mañana otra!': 'You already did today\'s spacewalk. Another one tomorrow!',
  'No se puede salir en plena tormenta de polvo': 'You can\'t go outside during a dust storm',
  'Hay muy poco oxígeno en la base para llenar el traje': 'There is too little oxygen in the base to fill the suit',
  'No hay energía para cargar el traje': 'There is no power to charge the suit',
  // Caminata y plan
  '🆘 Rescate en la caminata: se acabó el oxígeno del traje.': '🆘 Spacewalk rescue: the suit ran out of oxygen.',
  '🧹 Limpiaste los paneles solares: +30% de eficiencia.': '🧹 You cleaned the solar panels: +30% efficiency.',
  'No recolectaste nada esta vez.': 'You didn\'t collect anything this time.',
  'El oxígeno de la base está bajando.': 'The base\'s oxygen is going down.', 'Siempre conviene tener reservas de agua.': 'It is always good to have water reserves.',
  'Necesitamos más protección contra la radiación.': 'We need more protection against radiation.',
  'Los científicos en la Tierra quieren estudiar más rocas de Jezero.': 'Scientists on Earth want to study more rocks from Jezero.',
  '✅ <b>¡Plan del sol cumplido!</b> Control de Misión felicita a la tripulación.': '✅ <b>Sol plan completed!</b> Mission Control congratulates the crew.',
  '📋 Control de Misión envió el plan del sol, pero las comunicaciones están apagadas.': '📋 Mission Control sent the sol plan, but communications are off.',
  '🧹 ¡Paneles limpios!': '🧹 Panels clean!', '☢️ ¡LLAMARADA SOLAR! La radiación aumentó mucho. ¡Vuelve a la base YA!': '☢️ SOLAR FLARE! Radiation went way up. Go back to the base NOW!',
  // Eventos
  '¡Llegó la tormenta de polvo!': 'The dust storm is here!',
  'Una tormenta gigante cubre el cielo. El viento lleva polvo que tapa y raya los paneles solares. Durará 3 sols.': 'A giant storm covers the sky. The wind carries dust that covers and scratches the solar panels. It will last 3 sols.',
  'Retraigan los paneles. Perder energía solar unos días es mejor que dañarlos para siempre.': 'Retract the panels. Losing solar power for a few days is better than damaging them forever.',
  'Sin energía solar, pero los paneles quedan a salvo': 'No solar power, but the panels stay safe',
  'Paneles protegidos. Solo tendrás el reactor y la batería. ¡Despliégalos cuando pase la tormenta!': 'Panels protected. You will only have the reactor and the battery. Deploy them when the storm is over!',
  '☀️ Dejarlos afuera': '☀️ Leave them out', 'Generan un poquito, pero el polvo los raya': 'They make a little power, but the dust scratches them',
  'Los paneles siguen afuera. Generan muy poco y el polvo los raya cada sol.': 'The panels are still out. They make very little and the dust scratches them every sol.',
  'Los paneles se quedaron afuera en plena tormenta.': 'The panels stayed out in the middle of the storm.',
  '¡Ráfaga de polvo!': 'Dust gust!', 'Una pequeña tormenta local se acerca. Durará solo hoy.': 'A small local storm is coming. It will only last today.',
  'Para una tormenta corta, retraer los paneles es lo más seguro.': 'For a short storm, retracting the panels is the safest choice.',
  'Pierdes la energía solar de hoy': 'You lose today\'s solar power', 'Paneles a salvo. ¡Recuerda desplegarlos mañana!': 'Panels safe. Remember to deploy them tomorrow!',
  'Sigues generando un poco, pero se ensucian': 'You keep making a little power, but they get dirty',
  'Los paneles se quedan afuera y se ensucian.': 'The panels stay out and get dirty.', 'Los paneles se quedaron afuera.': 'The panels stayed out.',
  '¡Alerta de llamarada solar!': 'Solar flare alert!',
  'Todos al refugio. La salud de la tripulación es primero; los experimentos pueden esperar.': 'Everyone to the shelter. The crew\'s health comes first; experiments can wait.',
  '🛡️ ¡Todos al refugio!': '🛡️ Everyone to the shelter!', 'Nadie trabaja hoy: sin ciencia y menos cosecha': 'Nobody works today: no science and a smaller harvest',
  'La tripulación se protegió en el refugio. Hoy no hubo ciencia y se cosechó menos, pero todos están a salvo.': 'The crew took cover in the shelter. There was no science today and a smaller harvest, but everyone is safe.',
  '🔬 Seguir con los experimentos': '🔬 Keep doing experiments', '+10 ciencia… pero mucha radiación': '+10 science… but a lot of radiation',
  '¡Impacto de micrometeorito!': 'Micrometeorite impact!',
  'Un granito de roca espacial perforó el techo del invernadero. ¡Se está escapando el aire!': 'A tiny space rock punched through the greenhouse roof. Air is leaking out!',
  'Si tienen repuestos, parchen el agujero. Si no, cierren la escotilla del invernadero.': 'If you have spare parts, patch the hole. If not, close the greenhouse hatch.',
  '🧰 Parchar el agujero': '🧰 Patch the hole', 'Usa 1 repuesto': 'Uses 1 spare part',
  'Parchaste el agujero. Solo se perdió un poquito de aire.': 'You patched the hole. Only a little air was lost.',
  '🚪 Cerrar el invernadero': '🚪 Close the greenhouse', 'Sin perder aire, pero producirá la mitad': 'No air lost, but it will make half as much',
  'Cerraste la escotilla. El invernadero producirá la mitad hasta que lo repares.': 'You closed the hatch. The greenhouse will make half as much until you repair it.',
  'Mientras nadie decidía se escapó mucho aire (-15 de oxígeno).': 'While nobody decided, a lot of air leaked out (-15 oxygen).',
  '¡Falla el reciclador de agua!': 'The water recycler is failing!',
  'La máquina que recicla el agua (¡y ayuda a fabricar oxígeno!) hace un ruido extraño y gotea.': 'The machine that recycles water (and helps make oxygen!) makes a strange noise and drips.',
  'Cambien la pieza con un repuesto. Repararla a mano funciona a veces, pero ocupa a toda la tripulación.': 'Swap the part with a spare. Fixing it by hand works sometimes, but it keeps the whole crew busy.',
  '🔩 Cambiar la pieza': '🔩 Swap the part', 'Usa 1 repuesto: arreglo seguro': 'Uses 1 spare part: a sure fix',
  '¡El reciclador funciona como nuevo!': 'The recycler works like new!', '🛠️ Repararla a mano': '🛠️ Fix it by hand',
  'Gratis, pero ocupa el día y puede fallar': 'Free, but it takes all day and may fail',
  '¡La reparación funcionó! Hoy se trabajó menos.': 'The repair worked! Less work got done today.',
  'La reparación salió mal (-12 de oxígeno). Hoy se trabajó menos.': 'The repair went wrong (-12 oxygen). Less work got done today.',
  'El reciclador siguió fallando todo el día (-15 de oxígeno).': 'The recycler kept failing all day (-15 oxygen).',
  'Plantas enfermas': 'Sick plants', 'Algunas plantas del invernadero tienen manchas raras en las hojas.': 'Some greenhouse plants have strange spots on their leaves.',
  'Quiten las plantas enfermas antes de que contagien a las demás.': 'Remove the sick plants before they infect the others.',
  '✂️ Quitar las enfermas': '✂️ Remove the sick ones', 'Pierdes un poco de comida ahora': 'You lose a little food now',
  'Quitaste las plantas enfermas (-6 de comida). El resto está sano.': 'You removed the sick plants (-6 food). The rest are healthy.',
  '🤞 Esperar a ver': '🤞 Wait and see', 'Puede que se curen… o no': 'They might get better… or not',
  'La enfermedad se contagió. El invernadero producirá menos.': 'The disease spread. The greenhouse will make less.',
  '¡Las plantas se recuperaron solas! Esta vez hubo suerte.': 'The plants got better on their own! Lucky this time.',
  'Un astronauta tiene fiebre': 'An astronaut has a fever', 'Uno de tus astronautas se siente mal y tiene fiebre.': 'One of your astronauts feels sick and has a fever.',
  'Si queda medicina en el botiquín, úsenla. Si no, que descanse.': 'If there is medicine left in the first-aid kit, use it. If not, let them rest.',
  '💊 Medicina del botiquín': '💊 Medicine from the kit', 'La medicina funcionó. ¡Se siente mejor!': 'The medicine worked. They feel better!',
  '🛏️ Que descanse': '🛏️ Let them rest', 'Hoy hay menos manos trabajando': 'Fewer hands are working today',
  'Descansó y se recuperó, pero hoy se trabajó menos.': 'They rested and got better, but less work got done today.',
  'Nadie lo atendió y la salud de la tripulación bajó (-8).': 'Nobody took care of them and the crew\'s health went down (-8).',
  '¡Un remolino de polvo!': 'A dust devil!',
  'Un "diablo de polvo" pasó sobre los paneles solares… ¡y los sopló hasta dejarlos más limpios!': 'A "dust devil" passed over the solar panels… and blew them cleaner!',
  '¡Qué suerte! 🎉': 'Lucky! 🎉', 'Los paneles recuperaron eficiencia.': 'The panels got their efficiency back.',
  '¡El rover encontró hielo!': 'The rover found ice!', 'Bajo una capa de polvo hay hielo de agua. Con él se puede fabricar oxígeno.': 'Under a layer of dust there is water ice. It can be used to make oxygen.',
  '¡A usarlo! 💧': 'Let\'s use it! 💧', '+12 de oxígeno y +5 de ciencia.': '+12 oxygen and +5 science.',
  // Inventos del laboratorio (config.INVENTOS)
  'Aislante térmico': 'Thermal insulation', 'En las tormentas, la calefacción ya no gasta energía extra.': 'During storms, heating no longer uses extra power.',
  'Las naves espaciales se cubren con mantas aislantes de muchas capas para no perder calor.': 'Spacecraft are covered with insulating blankets made of many layers so they don\'t lose heat.',
  'Luces LED para plantas': 'LED grow lights', 'Las plantas crecen más: +1 de comida cada sol.': 'Plants grow more: +1 food every sol.',
  'La NASA cultiva lechugas con luces LED en la Estación Espacial (experimento Veggie).': 'NASA grows lettuce under LED lights on the Space Station (the Veggie experiment).',
  'Reciclador de agua mejorado': 'Better water recycler', '+2 de oxígeno cada sol.': '+2 oxygen every sol.',
  'La Estación Espacial ya recicla el 98% de su agua.': 'The Space Station already recycles 98% of its water.',
  'Laboratorio portátil': 'Portable lab', 'En los días de refugio, el laboratorio sigue haciendo un poco de ciencia.': 'On shelter days, the lab still does some science.',
  'Muchos experimentos de la Estación Espacial funcionan solos, sin que los astronautas los toquen.': 'Many Space Station experiments run on their own, without astronauts touching them.',
  'Taladro para rocas': 'Rock drill', 'Cada roca que traes da +2 de ciencia extra.': 'Every rock you bring back gives +2 extra science.',
  'El rover Perseverance usa un taladro y guarda muestras de roca en tubos.': 'The Perseverance rover uses a drill and keeps rock samples in tubes.',
  'Capa antipolvo para paneles': 'Dust-proof panel coating', 'Las tormentas rayan menos los paneles.': 'Storms scratch the panels less.',
  'En 2018, el polvo de una tormenta tapó los paneles del rover Opportunity y lo dejó sin energía.': 'In 2018, dust from a storm covered the Opportunity rover\'s panels and left it without power.',
  'Impresora 3D de repuestos': '3D printer for spare parts', 'Fabrica 2 repuestos ahora mismo.': 'It makes 2 spare parts right now.',
  'La Estación Espacial tiene impresoras 3D para fabricar piezas.': 'The Space Station has 3D printers to make parts.',
  '¡El laboratorio puede fabricar un invento!': 'The lab can build an invention!', '🎉 ¡Genial!': '🎉 Great!',
  'Ya tienen todos los inventos. La tripulación está orgullosa (+5 de salud).': 'You already have every invention. The crew is proud (+5 health).',
  // Oportunidades (sols sin emergencia)
  'Una escuela de la Tierra quiere conocerlos': 'A school on Earth wants to meet you',
  'Una escuela quiere hacerles preguntas. Los mensajes tardan 12 minutos: no se puede hablar en vivo, así que graban la clase y la envían.': 'A school wants to ask you questions. Messages take 12 minutes: you can\'t talk live, so you record the class and send it.',
  '🎥 Grabar la clase': '🎥 Record the class',
  'Grabaron la clase y la enviaron a la Tierra. ¡La tripulación está feliz! (+6 de salud, −4 kWh)': 'You recorded the class and sent it to Earth. The crew is happy! (+6 health, −4 kWh)',
  '🔋 Hoy no': '🔋 Not today', 'Guardaron la energía para la base. La escuela lo entenderá.': 'You kept the power for the base. The school will understand.',
  'El dron puede explorar un cráter': 'The drone can explore a crater',
  'A 2 km hay un cráter con capas de roca. ¿Lo fotografía el dron? El helicóptero Ingenuity voló 72 veces en Marte.': 'There is a crater with layers of rock 2 km away. Should the drone photograph it? The Ingenuity helicopter flew 72 times on Mars.',
  '🚁 Volar al cráter': '🚁 Fly to the crater', '−5 ⚡ · +7 🔬 (8 de cada 10 veces)': '−5 ⚡ · +7 🔬 (8 times out of 10)',
  '¡Fotos increíbles de las capas de roca! +7 de ciencia (−5 kWh).': 'Amazing photos of the rock layers! +7 science (−5 kWh).',
  'El polvo tapó la cámara del dron: volvió sin fotos (−5 kWh).': 'Dust covered the drone\'s camera: it came back with no photos (−5 kWh).',
  '🛬 Dejarlo en la base': '🛬 Keep it at the base', 'El dron se quedó cargando en la base.': 'The drone stayed at the base, charging.',
  'La tripulación se siente débil': 'The crew feels weak',
  'Con poca gravedad, músculos y huesos se debilitan. En la Estación Espacial hacen 2 horas de ejercicio al día.': 'In low gravity, muscles and bones get weaker. On the Space Station astronauts exercise 2 hours a day.',
  '🏃 Ejercicio extra': '🏃 Extra exercise',
  'Corrieron en la cinta y pedalearon: +6 de salud (−3 kWh).': 'They ran on the treadmill and pedalled: +6 health (−3 kWh).',
  '🔬 Seguir trabajando': '🔬 Keep working',
  'Siguieron con los experimentos: +3 de ciencia, pero −4 de salud.': 'They kept doing experiments: +3 science, but −4 health.',
  'Hora de revisar las máquinas': 'Time to check the machines',
  'Las máquinas llevan muchos sols funcionando. Al revisarlas se pueden recuperar piezas.': 'The machines have been running for many sols. Checking them can recover parts.',
  '🔧 Revisar todo': '🔧 Check everything', '+1 🧰 · hoy no hay ciencia': '+1 🧰 · no science today',
  'Revisaron todo y recuperaron una pieza: +1 repuesto. Hoy se trabajó menos.': 'They checked everything and recovered a part: +1 spare part. Less work got done today.',
  '⏭️ Hoy no': '⏭️ Not today', 'Siguieron con el trabajo de siempre.': 'They carried on with their usual work.',
  '¡Un cumpleaños en Marte!': 'A birthday on Mars!', '🎂 ¡Celebrar!': '🎂 Celebrate!',
  '¡Fiesta en Marte! +8 de salud, −6 de comida.': 'A party on Mars! +8 health, −6 food.',
  '📋 Celebrar otro día': '📋 Celebrate another day', 'Guardaron la comida. El pastel tendrá que esperar.': 'You kept the food. The cake will have to wait.',
  '🛬 <b>¡Aterrizó la nave de carga en la plataforma!</b> +15 de comida, +1 repuesto y +1 botiquín.': '🛬 <b>The cargo ship landed on the pad!</b> +15 food, +1 spare part and +1 first-aid kit.',
  // Mensajes de la Tierra
  '🌞 <b>Conjunción solar:</b> el Sol está entre Marte y la Tierra. No hay comunicación. ¡Están solos!': '🌞 <b>Solar conjunction:</b> the Sun is between Mars and Earth. There is no communication. You are on your own!',
  '📡 Había mensajes de la Tierra… pero las comunicaciones estaban <b>apagadas</b>. ¡No los recibiste!': '📡 There were messages from Earth… but communications were <b>off</b>. You didn\'t get them!',
  '🌞 El Sol está entre Marte y la Tierra: la señal no puede pasar. ¡Decide tú!': '🌞 The Sun is between Mars and Earth: the signal can\'t get through. You decide!',
  '📡 Tus comunicaciones están apagadas. Nadie puede escucharte.': '📡 Your communications are off. Nobody can hear you.',
  '¡Bienvenida, tripulación! Cada mensaje tarda unos 12 minutos en llegar. En una emergencia, ustedes deciden.': 'Welcome, crew! Every message takes about 12 minutes to arrive. In an emergency, you decide.',
  '¡Bienvenida, tripulación de cadetes! Cada mensaje tarda unos 12 minutos en llegar. En una emergencia, ustedes deciden.': 'Welcome, cadet crew! Every message takes about 12 minutes to arrive. In an emergency, you decide.',
  'Misión científica: exploren con el rover y hagan experimentos, pero sin arriesgar a la tripulación.': 'Science mission: explore with the rover and do experiments, but without putting the crew at risk.',
  'Misión científica: exploren y hagan experimentos, pero sin arriesgar a la tripulación.': 'Science mission: explore and do experiments, but without putting the crew at risk.',
  '⚠️ El satélite MRO ve una gran tormenta de polvo. Llegará en 2 sols y durará 3. ¡Carguen las baterías!': '⚠️ The MRO satellite sees a big dust storm. It will arrive in 2 sols and last 3. Charge the batteries!',
  'La tormenta llega mañana. Ahorren energía.': 'The storm arrives tomorrow. Save power.',
  '⚠️ En los sols 10 y 11 el Sol quedará entre Marte y la Tierra (conjunción solar). No podremos hablar. ¡Estarán solos!': '⚠️ On sols 10 and 11 the Sun will be between Mars and Earth (solar conjunction). We won\'t be able to talk. You will be on your own!',
  '¡Volvimos a escucharlos! Buen trabajo durante la conjunción.': 'We can hear you again! Good job during the conjunction.',
  'La nave de relevo ya está en órbita. ¡Aguanten un sol más!': 'The relief ship is already in orbit. Hold on one more sol!',
  // Resumen del sol
  '🥶 El soporte vital trabajó poco: bajó el oxígeno y hizo frío.': '🥶 Life support worked too little: oxygen went down and it got cold.',
  '🔬 Hoy nadie pudo trabajar en el laboratorio.': '🔬 Nobody could work in the lab today.',
  '🌪️ El polvo rayó y cubrió los paneles: ahora generan menos.': '🌪️ Dust scratched and covered the panels: now they make less.',
  '🧱 <b>¡Blindaje terminado!</b> La radiación ahora les afecta mucho menos.': '🧱 <b>Shield finished!</b> Radiation now affects you much less.',
  '⚠️ ¡Queda poco oxígeno! La tripulación se siente mareada.': '⚠️ Oxygen is low! The crew feels dizzy.',
  '⚠️ ¡Se acabó la comida!': '⚠️ The food ran out!', '🌤️ El polvo se asentó.': '🌤️ The dust settled.',
  '🌤️ El polvo se asentó. <b>¡Despliega los paneles!</b>': '🌤️ The dust settled. <b>Deploy the panels!</b>',
  'Se acabó el oxígeno.': 'The oxygen ran out.', 'La salud de la tripulación llegó a cero.': 'The crew\'s health reached zero.',
  // Mundo 3D (etiquetas)
  'Hábitat': 'Habitat', 'Paneles solares': 'Solar panels', 'Baterías': 'Batteries', 'Antena': 'Antenna', 'Reactor': 'Reactor', 'Rover': 'Rover',
  'plegados': 'folded', 'siempre ON': 'always ON', 'explorando…': 'exploring…', 'listo': 'ready', '🌞 sin señal': '🌞 no signal',
  // Clima espacial (donki.js)
  'cargando…': 'loading…', 'Sin conexión: usando llamaradas históricas reales de la NASA': 'Offline: using real historical NASA flares',
  'Sol tranquilo: 0 llamaradas en 30 días (NASA DONKI, en vivo)': 'Quiet Sun: 0 flares in 30 days (NASA DONKI, live)',
}));

const APAGADOS = { 'la construcción': 'construction', 'laboratorio': 'laboratory', 'comunicaciones': 'communications', 'invernadero': 'greenhouse', 'soporte vital': 'life support' };
const RIESGO = { bajo: 'low', medio: 'medium', ALTO: 'HIGH' };

// [regex, reemplazo] — reemplazo puede ser función; tr() se aplica a las partes anidadas
const PATRONES = [
  [/^Ya juntaron (\d+) puntos de ciencia\. ¿Qué invento fabrican\?$/, 'You have collected $1 science points. Which invention will you build?'],
  [/^¡Invento listo: (.+?)! (.+)$/, (m, n, d) => `Invention ready: ${tr(n)}! ${tr(d)}`],
  [/^💡 Invento: (.+)\.$/, (m, n) => `💡 Invention: ${tr(n)}.`],
  [/^Hoy cumple años <b>(.+?)<\/b>\. ¿Hacen un pastel con lo que crece en el invernadero\?$/, 'Today is <b>$1</b>\'s birthday. Shall the crew bake a cake with what grows in the greenhouse?'],
  [/^🥔 Cosecha: ([\d.]+) · consumo: ([\d.]+) · reservas: ([\d.]+)\.$/, '🥔 Harvest: $1 · used: $2 · reserves: $3.'],
  [/^📡 Videollamada con la Tierra: \+([\d.]+) de salud\.$/, '📡 Video call with Earth: +$1 health.'],
  [/^⚠️ Queda poca comida: la tripulación tiene hambre \(-(\d+) de salud\)\. Aumenta la cosecha o ahorra reservas\.$/, '⚠️ Food is running low: the crew is hungry (-$1 health). Grow more food or build up reserves.'],
  [/^🚀 Comandante <b>(.*?)<\/b> al mando de la base en la meseta NE Syrtis\.$/s, '🚀 Commander <b>$1</b> is in charge of the base on the NE Syrtis plateau.'],
  [/^Ejercicio: llamarada clase <b>([^<]+)<\/b>\. En este escenario simulado, una tormenta de partículas llega a Marte\. ¿Proteges a la tripulación o sigues trabajando\?<br><small class="real">(.*)<\/small>$/s,
    (m, c, origen) => `Training exercise: class <b>${c}</b> solar flare. In this simulated scenario, a particle storm reaches Mars. Will you protect the crew or keep working?<br><small class="real">${tr(origen)}</small>`],
  [/^🛰️ Basada en una llamarada <b>real<\/b> que la NASA detectó el (.+) \(consulta NASA DONKI\)\.$/, '🛰️ Based on a <b>real</b> flare NASA detected on $1 (NASA DONKI query).'],
  [/^⏰ <b>¡Se acabó el tiempo!<\/b> (.*)$/s, (m, r) => `⏰ <b>Time's up!</b> ${tr(r)}`],
  [/^🧱 Construir blindaje de regolito \((\d)\/3\)$/, '🧱 Build regolith shield ($1/3)'],
  [/^Recoge hielo, rocas y más\. Cuesta (\d+) de oxígeno de la base; afuera recibes radiación\.$/, 'Collect ice, rocks and more. Costs $1 of the base\'s oxygen; outside you get radiation.'],
  [/^Usa 1 repuesto \(te quedan (\d+)\)$/, 'Uses 1 spare part ($1 left)'],
  [/^Quedan (\d+)$/, '$1 left'],
  [/^⏱️ Estuviste afuera (\d+) segundos y recibiste <b>([\d.]+) mSv<\/b> de radiación\.$/, '⏱️ You were outside $1 seconds and received <b>$2 mSv</b> of radiation.'],
  [/^🆘 ¡Se acabó el oxígeno del traje! Tus compañeros te rescataron, pero perdiste todo lo recolectado y la salud bajó \(-(\d+)\)\.$/, '🆘 The suit ran out of oxygen! Your crewmates rescued you, but you lost everything you collected and your health went down (-$1).'],
  [/^🟫 <b>(\d+) de regolito<\/b> \(la tierra roja y suelta de Marte\) → ahora tienes (\d+) en la base para construir \(tecla B\)\.$/, '🟫 <b>$1 regolith</b> (the loose red soil of Mars) → you now have $2 in the base for building (B key).'],
  [/^🟫 <b>(\d+) de regolito<\/b> \(la tierra roja y suelta de Marte\) → cubre el hábitat: blindaje (\d)\/3\.$/, '🟫 <b>$1 regolith</b> (the loose red soil of Mars) → covers the habitat: shield $2/3.'],
  [/^🪨 <b>(\d+) roca\(s\) marciana\(s\)<\/b> de basalto → el laboratorio las analiza: \+(\d+) de ciencia\.$/, '🪨 <b>$1 Martian basalt rock(s)</b> → the lab analyzes them: +$2 science.'],
  [/^🧊 <b>(\d+) bloque\(s\) de hielo de agua<\/b> → el agua se separa en hidrógeno y oxígeno: \+(\d+) de oxígeno\.$/, '🧊 <b>$1 block(s) of water ice</b> → the water splits into hydrogen and oxygen: +$2 oxygen.'],
  [/^🔩 (\d+) pieza\(s\) de una sonda vieja → \+(\d+) repuesto\(s\)\.$/, '🔩 $1 part(s) from an old probe → +$2 spare part(s).'],
  [/^✅ <b>¡Plan del sol cumplido!<\/b> Bono: \+(\d+) de ciencia y \+(\d+) de salud \(la tripulación está orgullosa\)\.$/, '✅ <b>Sol plan completed!</b> Bonus: +$1 science and +$2 health (the crew is proud).'],
  [/^🧑‍🚀 Caminata: (.*)$/s, (m, r) => '🧑‍🚀 Spacewalk: ' + r.split(' · ').map(p => trPieza(p.trim())).join(' · ')],
  [/^📋 <b>Plan del sol<\/b>: trae (\d+) (\S+) (.+?)\. (.+?) <small>\(opcional, da bono\)<\/small>$/s,
    (m, c, i, n, mot) => `📋 <b>Sol plan</b>: bring ${c} ${i} ${tr(n)}. ${tr(mot)} <small>(optional, gives a bonus)</small>`],
  [/^📡 <b>Control de Misión<\/b> <small>\(enviado hace (\d+) min\)<\/small>: (.*)$/s, (m, n, a) => `📡 <b>Mission Control</b> <small>(sent ${n} min ago)</small>: ${tr(a)}`],
  [/^📡 <b>Respuesta a tu pregunta del Sol (\d+)<\/b>: (.*)$/s, (m, n, a) => `📡 <b>Answer to your question from Sol ${n}</b>: ${tr(a)}`],
  [/^📨 Mensaje enviado… pero tarda <b>(\d+) minutos<\/b> en llegar a la Tierra y otros (\d+) en volver\. ¡La emergencia es <b>ahora<\/b>! Tendrás que decidir tú\. \(La respuesta llegará mañana\.\)$/,
    '📨 Message sent… but it takes <b>$1 minutes</b> to reach Earth and another $2 to come back. The emergency is happening <b>now</b>! You will have to decide. (The answer will arrive tomorrow.)'],
  [/^Los satélites detectaron una llamarada clase <b>([^<]+)<\/b>\. Una lluvia de partículas de alta energía viene hacia Marte\.<br><small class="real">(.*)<\/small>$/s,
    (m, c, o) => `Satellites detected a class <b>${c}</b> solar flare. A shower of high-energy particles is heading to Mars.<br><small class="real">${tr(o)}</small>`],
  [/^🛰️ Basada en una llamarada <b>real<\/b> que la NASA detectó el (.+) \(DONKI, en vivo\)\.$/, '🛰️ Based on a <b>real</b> flare NASA detected on $1 (DONKI, live).'],
  [/^📚 Basada en una llamarada histórica real del (.+) \(archivo NASA DONKI\)\.$/, '📚 Based on a real historical flare from $1 (NASA DONKI archive).'],
  [/^Siguieron trabajando: \+10 ciencia, pero recibieron <b>(\d+) mSv<\/b> extra de radiación\.$/, 'They kept working: +10 science, but got <b>$1 mSv</b> of extra radiation.'],
  [/^Nadie dio la orden y la tripulación recibió <b>(\d+) mSv<\/b> de radiación\.$/, 'Nobody gave the order and the crew got <b>$1 mSv</b> of radiation.'],
  [/^🔌 <b>¡Apagón!<\/b> La energía no alcanzó y se apagó o bajó: (.*)\.$/, (m, l) => `🔌 <b>Blackout!</b> There wasn't enough power, so this switched off or went down: ${l.split(', ').map(x => APAGADOS[x] || x).join(', ')}.`],
  [/^🔬 El laboratorio hizo experimentos: \+(\d+) ciencia\.$/, '🔬 The lab did experiments: +$1 science.'],
  [/^🧱 Construcción del blindaje: (\d)\/3\.$/, '🧱 Shield construction: $1/3.'],
  [/^La tripulación recibió demasiada radiación \(([\d.]+) mSv\)\.$/, 'The crew received too much radiation ($1 mSv).'],
  [/^\+1 (\S+) (.+)$/, (m, i, n) => `+1 ${i} ${tr(n)}`],
  [/^En vivo: (\d+) llamaradas en 30 días · la más fuerte (\S+) · riesgo (\S+)$/, (m, n, c, r) => `Live: ${n} flares in 30 days · strongest ${c} · ${RIESGO[r] || r} risk`],
];

function trPieza(p) {
  const r = p.match(/^🟫 (\d+) de regolito/); if (r) return `🟫 ${r[1]} regolith`;
  const k = p.match(/^🪨 (\d+) roca\(s\) marciana\(s\)/); if (k) return `🪨 ${k[1]} Martian rock(s)`;
  const h = p.match(/^🧊 (\d+) bloque\(s\) de hielo de agua/); if (h) return `🧊 ${h[1]} block(s) of water ice`;
  if (/^✅ ¡Plan del sol cumplido!/.test(p)) return '✅ Sol plan completed!';
  return tr(p);
}

export function tr(s) {
  if (idioma === 'es' || s == null || s === '') return s;
  s = String(s);
  if (EXACTO.has(s)) return EXACTO.get(s);
  for (const [re, rep] of PATRONES) if (re.test(s)) return s.replace(re, rep);
  // Prefijo de ícono + texto conocido (ej. "☀️ La tripulación se protegió…")
  const m = s.match(/^([^\p{L}\p{N}<¡¿]+?)\s(.+)$/su);
  if (m) { const resto = tr(m[2]); if (resto !== m[2]) return `${m[1]} ${resto}`; }
  return s;
}

// ---------------------------------------------------------------------
//  3) DATOS (src/data) y utilidades
// ---------------------------------------------------------------------
export const txt = o => (idioma === 'en' && o?.texto_en) ? o.texto_en : o?.texto;
export const fuenteNombre = f => campo(f, 'nombre');
export const fuenteUso = f => (idioma === 'en' && f?.uso_en) ? f.uso_en : f?.uso;

// Textos fijos de index.html: data-i18n (texto), data-i18n-html (HTML), data-i18n-title (title)
export function aplicarEstaticos() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  const b = document.querySelector('#btnIdioma');
  if (b) {
    b.innerHTML = `<span class="idioma-icono" aria-hidden="true">🌐</span><span class="idioma-codigo" aria-hidden="true">${idioma === 'es' ? 'EN' : 'ES'}</span>`;
    b.title = t('top.idioma.t');
    b.setAttribute('aria-label', b.title);
  }
}

// Etiquetas del mundo 3D (las crea src/world3d): se traducen al aparecer, sin tocar ese código.
function traducirEtiquetas(raiz = document) {
  raiz.querySelectorAll?.('.et-nombre, .obj-nom, .popup-eva > span').forEach(el => {
    if (!el.dataset.es) el.dataset.es = el.textContent;
    const nuevo = tr(el.dataset.es);
    if (el.textContent !== nuevo) el.textContent = nuevo;
  });
  // El texto extra lo reescribe el mundo cada vez que cambia: se muestra una copia traducida al lado
  raiz.querySelectorAll?.('.etiqueta .et-extra:not(.et-extra-en)').forEach(el => {
    let copia = el.nextElementSibling;
    if (!copia?.classList.contains('et-extra-en')) {
      copia = document.createElement('span');
      copia.className = 'et-extra et-extra-en';
      el.after(copia);
    }
    const nuevo = tr(el.textContent);
    if (copia.textContent !== nuevo) copia.textContent = nuevo;
  });
}

const css = document.createElement('style');
css.textContent = `
  .et-extra-en { display: none; }
  body.lang-en .etiqueta .et-extra:not(.et-extra-en) { display: none; }
  body.lang-en .etiqueta .et-extra-en { display: inline; }`;
document.head.appendChild(css);

let pendiente = false;
new MutationObserver(() => {
  if (pendiente) return;
  pendiente = true;
  setTimeout(() => { pendiente = false; traducirEtiquetas(); }, 100);
}).observe(document.body, { childList: true, subtree: true, characterData: true });

document.documentElement.lang = idioma;
document.body.classList.toggle('lang-en', idioma === 'en');
onIdioma(() => traducirEtiquetas());
