// Gate de acentos (invariante 12 del spec): tokens cuyo equivalente sin acento casi
// nunca es palabra válida. Español reusa la lista ACCENT_TOKENS de
// imberion-brain/.claude/bin/valida_cierre.sh; portugués no tenía equivalente y se
// escribe aquí. Corre sobre src/i18n/content/**/*.json por locale. Es AVISO si el
// token aparece dentro de un nombre comercial o una URL; bloqueante si está en prosa.
import fs from 'node:fs';
import path from 'node:path';

const ES = 'senal|senales|informacion|participacion|operacion|comunicacion|implementacion|segmentacion|optimizacion|presentacion|aplicacion|direccion|produccion|descripcion|definicion|evaluacion|condicion|posicion|promocion|atencion|intencion|gestion|decision|analisis|sintesis|metrica|metricas|categoria|categorias|tambien|ademas|quizas|segun|mexico|logistica|dia|dias|facil|dificil|rapido|numero|numeros|codigo|ultimo|ultima|practica|practicas|economico|economica|unico|unica|especifico|especifica|anos|ano';
const PT = 'nao|informacao|informacoes|operacao|operacoes|decisao|decisoes|gestao|acao|acoes|promocao|promocoes|segmentacao|execucao|precisao|situacao|negociacao|estrategia|estrategias|voce|voces|analise|analises|metrica|metricas|logistica|tambem|alem|apos|ate|so|pais|paises|orcamento|preco|precos|comeco|servico|servicos|forca|numero|numeros|codigo|ultimo|ultima|pratica|praticas|economico|economica|unico|unica|especifico|especifica|periodo|periodos|rapido|facil|dificil|proximo|proxima|historico|automatico|automatica|estatistica|estatisticas|areas|area|media|medias|memoria|industria|industrias|farmacia|referencia|referencias|experiencia|experiencias|consciencia|eficiencia|frequencia|inteligencia|competencia|relevancia|transparencia|dinamica|dinamicas|contrario';
const RE = { es: new RegExp(`(^|[^a-záéíóúñ])(${ES})(?=[^a-záéíóúñ]|$)`, 'gi'), pt: new RegExp(`(^|[^a-záéíóúãõâêôç])(${PT})(?=[^a-záéíóúãõâêôç]|$)`, 'gi') };
// Palabras que coinciden con un token pero son válidas sin acento en contexto.
const EXCEPCIONES = { es: new Set(['ano', 'anos', 'area', 'areas', 'media', 'so']), pt: new Set(['area', 'areas', 'media', 'so', 'mes', 'pais']) };

const raiz = process.argv[2] ?? 'src/i18n/content';
let total = 0; const hits = [];
function hojas(o, ruta, f) { if (typeof o === 'string') f(o, ruta); else if (Array.isArray(o)) o.forEach((x, i) => hojas(x, `${ruta}[${i}]`, f)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) hojas(v, ruta ? `${ruta}.${k}` : k, f); }
function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.json')) { const j = JSON.parse(fs.readFileSync(p, 'utf8')); for (const loc of ['es', 'pt']) { if (!j[loc]) continue; hojas(j[loc], '', (s, ruta) => { total++; if (/^[a-z0-9/_#.-]+$/.test(s)) return; // slug o ruta, no prosa
          const texto = s.replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, ' '); let m; const re = new RegExp(RE[loc].source, 'gi'); while ((m = re.exec(texto))) { const w = m[2].toLowerCase(); if (EXCEPCIONES[loc].has(w)) continue; if (/^[A-Z]/.test(m[2]) && /[A-Z]/.test(texto.slice(Math.max(0, m.index - 1), m.index + 1))) {} hits.push(`${p} [${loc}] ${ruta}: "${m[2]}"`); } }); } } } }
walk(raiz);
console.log(`Gate acentos ES+PT sobre ${raiz}: ${total} hojas revisadas`);
if (hits.length) { console.log(`  hits: ${hits.length}`); hits.slice(0, 60).forEach((h) => console.log('  ' + h)); console.log('GATE ROJO: tokens sin acento en prosa.'); process.exit(1); }
console.log('  hits: 0\nGATE VERDE: sin tokens sin acento en ES ni PT.');
