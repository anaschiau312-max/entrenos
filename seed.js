#!/usr/bin/env node

/**
 * RunTracker — Database Seed Script
 *
 * Carga TODOS los datos del plan de entrenamiento en Firebase Realtime Database.
 *
 * INSTRUCCIONES:
 * 1. Descarga la clave de servicio desde Firebase Console:
 *    Firebase Console > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada
 * 2. Guarda el archivo JSON descargado como "serviceAccountKey.json" en la raíz del proyecto
 * 3. Instala firebase-admin:
 *    npm install firebase-admin
 * 4. Ejecuta el script:
 *    node seed.js
 *
 * ⚠️  Este script SOBREESCRIBE todos los datos existentes en la base de datos.
 *     Ejecútalo UNA SOLA VEZ o cuando quieras resetear los datos.
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

// ============================================================
// HELPERS
// ============================================================

const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

// Generate week dates starting from a Monday
function weekDates(mondayDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        dates.push(addDays(mondayDate, i));
    }
    return dates;
}

// Ana's repeating work schedule (Mon-Sun)
const WORK_SCHEDULE = [
    { workSchedule: '9-22h',   bestMoment: 'Descanso' },  // Lunes
    { workSchedule: '7-14:30', bestMoment: 'Tarde' },      // Martes
    { workSchedule: '9-22h',   bestMoment: 'Mañana' },     // Miércoles
    { workSchedule: '7-14:30', bestMoment: 'Tarde' },      // Jueves
    { workSchedule: '9-14:30', bestMoment: 'Tarde' },      // Viernes
    { workSchedule: 'LIBRE',   bestMoment: 'Mañana' },     // Sábado
    { workSchedule: '15-22h',  bestMoment: 'Mañana' },     // Domingo
];

// Session builder helpers
function run(dateStr, n, subtype, title, duration, description, details, notes) {
    return {
        id: `s_${dateStr.replace(/-/g, '')}_${n}`,
        type: 'running',
        subtype,
        title,
        duration,
        description,
        details,
        notes: notes || '',
        completed: false
    };
}

function strength(dateStr, n, title, duration, groups) {
    return {
        id: `s_${dateStr.replace(/-/g, '')}_${n}`,
        type: 'strength',
        subtype: groups[0],
        title,
        duration,
        exerciseGroup: groups,
        completed: false
    };
}

// Standard warmup/cooldown
const WU_STANDARD = '5\' caminata + trote suave + movilidad';
const WU_RUN = '10\' trote suave + ejercicios de activación';
const CD_STANDARD = '5\' caminata + estiramientos';
const CD_RUN = '10\' trote suave + vuelta a la calma estándar';

// ============================================================
// GENERATE ALL WEEKS (4–18)
// ============================================================

function generatePlan() {
    const weeks = {};
    // Week 4 starts on Monday Feb 2, 2026
    const week4Monday = new Date(2026, 1, 2); // months are 0-indexed

    const phaseMap = {
        4: 'base', 5: 'base', 6: 'base', 7: 'base',
        8: 'desarrollo', 9: 'desarrollo', 10: 'desarrollo', 11: 'desarrollo',
        12: 'especifico', 13: 'especifico', 14: 'especifico',
        15: 'tapering', 16: 'tapering',
        17: 'carrera', 18: 'carrera'
    };

    for (let wn = 4; wn <= 18; wn++) {
        const monday = addDays(week4Monday, (wn - 4) * 7);
        const dates = weekDates(monday);
        const weekId = `week_${String(wn).padStart(2, '0')}`;
        const sessionsForWeek = getWeekSessions(wn, dates);

        const days = {};
        dates.forEach((date, i) => {
            const dateStr = formatDate(date);
            days[dateStr] = {
                dayOfWeek: DAYS_ES[i],
                workSchedule: WORK_SCHEDULE[i].workSchedule,
                bestMoment: sessionsForWeek[i].length === 0 ? 'Descanso' : WORK_SCHEDULE[i].bestMoment,
                sessions: sessionsForWeek[i]
            };
        });

        weeks[weekId] = {
            weekNumber: wn,
            startDate: formatDate(monday),
            phase: phaseMap[wn],
            days
        };
    }

    return { weeks };
}

// ============================================================
// TRAINING SESSIONS PER WEEK
// Returns array of 7 arrays (Mon-Sun), each containing sessions
// ============================================================

function getWeekSessions(weekNum, dates) {
    const d = dates.map(formatDate);

    switch (weekNum) {

        // ==================== FASE BASE ====================

        case 4: return [
            // Mon - Descanso (jornada larga)
            [],
            // Tue
            [],
            // Wed
            [],
            // Thu
            [],
            // Fri - Rodaje
            [run(d[4], 1, 'rodaje', 'Rodaje cómodo', '30–35\'',
                'Rodaje cómodo a ritmo ligero',
                { warmup: '5\' caminata + trote suave', main: '25-30\' rodaje cómodo', cooldown: 'Estiramientos' },
                'Ligero')],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '45\'',
                'Tirada larga a cadencia ligera',
                { warmup: 'Calentamiento estándar', main: '45\' carrera continua cómoda', cooldown: 'Vuelta a la calma estándar' },
                'Cadencia ligera')],
            // Sun - Fuerza
            [strength(d[6], 1, 'Fuerza tren inferior + tren superior', '25-30\'', ['tren_inferior', 'tren_superior'])]
        ];

        case 5: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje suave', '30\'',
                'Rodaje suave para adaptación',
                { warmup: WU_STANDARD, main: '25\' rodaje suave', cooldown: CD_STANDARD },
                'Ritmo conversacional')],
            [],
            // Thu - Rodaje
            [run(d[3], 1, 'rodaje', 'Rodaje cómodo', '30-35\'',
                'Rodaje cómodo con buena cadencia',
                { warmup: WU_STANDARD, main: '25-30\' rodaje cómodo', cooldown: CD_STANDARD },
                'Pasos cortos y rápidos')],
            [],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '50\'',
                'Tirada larga progresiva',
                { warmup: 'Calentamiento estándar', main: '50\' carrera continua cómoda', cooldown: 'Vuelta a la calma estándar' },
                'Último 10\' ligeramente más rápido')],
            // Sun - Fuerza
            [strength(d[6], 1, 'Fuerza tren inferior + tren superior', '25-30\'', ['tren_inferior', 'tren_superior'])]
        ];

        case 6: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '35\'',
                'Rodaje cómodo aumentando duración',
                { warmup: WU_STANDARD, main: '30\' rodaje cómodo', cooldown: CD_STANDARD },
                'Mantener ritmo estable')],
            // Wed - Fuerza inferior
            [strength(d[2], 1, 'Fuerza tren inferior', '25\'', ['tren_inferior'])],
            // Thu - Rodaje
            [run(d[3], 1, 'rodaje', 'Rodaje cómodo', '35\'',
                'Rodaje con enfoque en técnica',
                { warmup: WU_STANDARD, main: '30\' rodaje con atención a pisada', cooldown: CD_STANDARD },
                'Pisada debajo del cuerpo')],
            [],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '55\'',
                'Tirada larga a ritmo cómodo',
                { warmup: 'Calentamiento estándar', main: '55\' carrera continua', cooldown: 'Vuelta a la calma estándar' },
                'Respiración nasal cuando puedas')],
            // Sun - Fuerza superior
            [strength(d[6], 1, 'Fuerza tren superior', '25\'', ['tren_superior'])]
        ];

        case 7: return [ // Recovery week
            [],
            // Tue - Rodaje suave
            [run(d[1], 1, 'rodaje', 'Rodaje regenerativo', '30\'',
                'Rodaje suave de recuperación',
                { warmup: WU_STANDARD, main: '25\' rodaje muy suave', cooldown: CD_STANDARD },
                'Semana de descarga')],
            // Wed - Fuerza
            [strength(d[2], 1, 'Fuerza tren inferior (ligera)', '20\'', ['tren_inferior'])],
            // Thu - Rodaje
            [run(d[3], 1, 'rodaje', 'Rodaje cómodo', '30\'',
                'Rodaje cómodo sin forzar',
                { warmup: WU_STANDARD, main: '25\' rodaje cómodo', cooldown: CD_STANDARD },
                'Descarga — no forzar')],
            [],
            // Sat - Tirada larga (reducida)
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA (descarga)', '45\'',
                'Tirada larga reducida — semana de descarga',
                { warmup: 'Calentamiento estándar', main: '45\' carrera continua cómoda', cooldown: 'Vuelta a la calma estándar' },
                'Volumen reducido')],
            // Sun - Fuerza combinada
            [strength(d[6], 1, 'Fuerza tren inferior + tren superior', '25\'', ['tren_inferior', 'tren_superior'])]
        ];

        // ==================== FASE DESARROLLO ====================

        case 8: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '40\'',
                'Rodaje cómodo aumentando volumen',
                { warmup: WU_STANDARD, main: '35\' rodaje cómodo', cooldown: CD_STANDARD },
                'Empezamos desarrollo')],
            // Wed - Fuerza
            [strength(d[2], 1, 'Fuerza tren inferior', '30\'', ['tren_inferior'])],
            // Thu - Cambios de ritmo
            [run(d[3], 1, 'fartlek', 'Cambios de ritmo', '40\'',
                'Introducción a cambios de ritmo',
                { warmup: WU_RUN, main: '20\' alternando 1\' más rápido / 2\' suave', cooldown: CD_RUN },
                'Primeros cambios de ritmo — sin forzar')],
            [],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '60\'',
                'Tirada larga — primer 60\'',
                { warmup: 'Calentamiento estándar', main: '60\' carrera continua cómoda', cooldown: 'Vuelta a la calma estándar' },
                'Llevar gel o agua')],
            // Sun - Fuerza superior
            [strength(d[6], 1, 'Fuerza tren superior', '25\'', ['tren_superior'])]
        ];

        case 9: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '40\'',
                'Rodaje cómodo',
                { warmup: WU_STANDARD, main: '35\' rodaje cómodo', cooldown: CD_STANDARD },
                '')],
            // Wed - Fuerza
            [strength(d[2], 1, 'Fuerza tren inferior', '30\'', ['tren_inferior'])],
            // Thu - Fartlek
            [run(d[3], 1, 'fartlek', 'Fartlek', '40\'',
                'Fartlek con cambios variados',
                { warmup: WU_RUN, main: '20\' fartlek: 2\' rápido / 2\' suave', cooldown: CD_RUN },
                'Jugar con el ritmo')],
            // Fri - Rodaje suave
            [run(d[4], 1, 'rodaje', 'Rodaje regenerativo', '30\'',
                'Rodaje suave de recuperación',
                { warmup: WU_STANDARD, main: '25\' rodaje muy suave', cooldown: CD_STANDARD },
                'Recuperación activa')],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '65\'',
                'Tirada larga progresando',
                { warmup: 'Calentamiento estándar', main: '65\' carrera continua', cooldown: 'Vuelta a la calma estándar' },
                'Últimos 15\' ligeramente más rápido')],
            // Sun - Fuerza combinada
            [strength(d[6], 1, 'Fuerza tren inferior + tren superior', '30\'', ['tren_inferior', 'tren_superior'])]
        ];

        case 10: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '40-45\'',
                'Rodaje cómodo consolidando base',
                { warmup: WU_STANDARD, main: '35-40\' rodaje cómodo', cooldown: CD_STANDARD },
                '')],
            // Wed - Fuerza
            [strength(d[2], 1, 'Fuerza tren inferior', '30\'', ['tren_inferior'])],
            // Thu - Tempo
            [run(d[3], 1, 'tempo', 'Tempo', '40\'',
                'Primer entrenamiento de tempo',
                { warmup: WU_RUN, main: '20\' a ritmo controlado (5:40-6:00/km)', cooldown: CD_RUN },
                'Ritmo que puedes mantener hablando con frases cortas')],
            // Fri - Rodaje suave
            [run(d[4], 1, 'rodaje', 'Rodaje regenerativo', '30\'',
                'Rodaje suave de recuperación',
                { warmup: WU_STANDARD, main: '25\' rodaje suave', cooldown: CD_STANDARD },
                '')],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '70\'',
                'Tirada larga — objetivo 70 minutos',
                { warmup: 'Calentamiento estándar', main: '70\' carrera continua', cooldown: 'Vuelta a la calma estándar' },
                'Hidratación durante la carrera')],
            // Sun - Fuerza superior
            [strength(d[6], 1, 'Fuerza tren superior', '25\'', ['tren_superior'])]
        ];

        case 11: return [ // Recovery week desarrollo
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje regenerativo', '35\'',
                'Rodaje suave — descarga',
                { warmup: WU_STANDARD, main: '30\' rodaje suave', cooldown: CD_STANDARD },
                'Semana de descarga')],
            // Wed - Fuerza ligera
            [strength(d[2], 1, 'Fuerza tren inferior (ligera)', '25\'', ['tren_inferior'])],
            // Thu - Series suaves
            [run(d[3], 1, 'series', 'Series cortas suaves', '35\'',
                'Series cortas para mantener estímulo',
                { warmup: WU_RUN, main: '6x400m al 5:30-5:40 / descanso 1\'30" trote', cooldown: CD_RUN },
                'Descarga — sensaciones, no forzar')],
            [],
            // Sat - Tirada larga (reducida)
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA (descarga)', '55\'',
                'Tirada larga reducida',
                { warmup: 'Calentamiento estándar', main: '55\' carrera continua suave', cooldown: 'Vuelta a la calma estándar' },
                'Volumen reducido')],
            // Sun - Fuerza
            [strength(d[6], 1, 'Fuerza tren inferior + tren superior', '25\'', ['tren_inferior', 'tren_superior'])]
        ];

        // ==================== FASE ESPECÍFICO ====================

        case 12: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '45\'',
                'Rodaje cómodo manteniendo base',
                { warmup: WU_STANDARD, main: '40\' rodaje cómodo', cooldown: CD_STANDARD },
                'Fase específica — empieza lo bueno')],
            // Wed - Fuerza
            [strength(d[2], 1, 'Fuerza tren inferior', '30\'', ['tren_inferior'])],
            // Thu - Ritmo específico
            [run(d[3], 1, 'ritmo_especifico', 'Ritmo media maratón', '45\'',
                'Trabajo a ritmo objetivo de media maratón',
                { warmup: WU_RUN, main: '25\' a ritmo media maratón (5:20-5:40/km)', cooldown: CD_RUN },
                'Ritmo objetivo — controlar sensaciones')],
            // Fri - Rodaje suave
            [run(d[4], 1, 'rodaje', 'Rodaje regenerativo', '30\'',
                'Rodaje de recuperación',
                { warmup: WU_STANDARD, main: '25\' rodaje suave', cooldown: CD_STANDARD },
                '')],
            // Sat - Tirada larga
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '75\'',
                'Tirada larga con ritmo progresivo',
                { warmup: 'Calentamiento estándar', main: '75\' carrera: 50\' cómoda + 25\' a ritmo HM', cooldown: 'Vuelta a la calma estándar' },
                'Progresión en últimos 25\'')],
            // Sun - Fuerza superior
            [strength(d[6], 1, 'Fuerza tren superior', '25\'', ['tren_superior'])]
        ];

        case 13: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '45\'',
                'Rodaje cómodo',
                { warmup: WU_STANDARD, main: '40\' rodaje cómodo', cooldown: CD_STANDARD },
                '')],
            // Wed - Fuerza
            [strength(d[2], 1, 'Fuerza tren inferior', '30\'', ['tren_inferior'])],
            // Thu - Tempo/Ritmo HM
            [run(d[3], 1, 'ritmo_especifico', 'Tempo a ritmo HM', '45\'',
                'Bloque largo a ritmo media maratón',
                { warmup: WU_RUN, main: '30\' a ritmo media maratón (5:20-5:40/km)', cooldown: CD_RUN },
                'Sensación de poder seguir al acabar')],
            // Fri - Rodaje suave
            [run(d[4], 1, 'rodaje', 'Rodaje regenerativo', '30\'',
                'Rodaje suave de recuperación',
                { warmup: WU_STANDARD, main: '25\' rodaje muy suave', cooldown: CD_STANDARD },
                '')],
            // Sat - Tirada larga (máxima)
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA (máxima)', '80-85\'',
                'Tirada larga más larga del plan',
                { warmup: 'Calentamiento estándar', main: '80-85\' carrera: 55\' cómoda + 25-30\' progresivo', cooldown: 'Vuelta a la calma completa' },
                'Tirada más larga — llevar hidratación y gel')],
            // Sun - Fuerza combinada
            [strength(d[6], 1, 'Fuerza tren inferior + tren superior', '25\'', ['tren_inferior', 'tren_superior'])]
        ];

        case 14: return [ // Slight recovery before tapering
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '40\'',
                'Rodaje cómodo',
                { warmup: WU_STANDARD, main: '35\' rodaje cómodo', cooldown: CD_STANDARD },
                '')],
            // Wed - Fuerza ligera
            [strength(d[2], 1, 'Fuerza tren inferior (ligera)', '25\'', ['tren_inferior'])],
            // Thu - Ritmo específico
            [run(d[3], 1, 'ritmo_especifico', 'Ritmo media maratón', '40\'',
                'Trabajo a ritmo objetivo',
                { warmup: WU_RUN, main: '20\' a ritmo media maratón', cooldown: CD_RUN },
                'Consolidar sensaciones')],
            [],
            // Sat - Tirada larga (reducida)
            [run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', '70\'',
                'Tirada larga reducida respecto a semana anterior',
                { warmup: 'Calentamiento estándar', main: '70\' carrera continua', cooldown: 'Vuelta a la calma estándar' },
                'Reducimos un poco volumen')],
            // Sun - Fuerza superior
            [strength(d[6], 1, 'Fuerza tren superior', '25\'', ['tren_superior'])]
        ];

        // ==================== FASE TAPERING ====================

        case 15: return [
            [],
            // Tue - Rodaje
            [run(d[1], 1, 'rodaje', 'Rodaje cómodo', '35\'',
                'Rodaje cómodo — inicio tapering',
                { warmup: WU_STANDARD, main: '30\' rodaje cómodo', cooldown: CD_STANDARD },
                'Tapering — empezamos a reducir')],
            // Wed - Fuerza muy ligera
            [strength(d[2], 1, 'Fuerza tren inferior (muy ligera)', '20\'', ['tren_inferior'])],
            // Thu - Ritmo corto
            [run(d[3], 1, 'ritmo_especifico', 'Ritmo HM corto', '30\'',
                'Bloque corto a ritmo media maratón',
                { warmup: WU_RUN, main: '15\' a ritmo media maratón', cooldown: CD_RUN },
                'Sensaciones — no acumular fatiga')],
            [],
            // Sat - Tirada reducida
            [run(d[5], 1, 'tirada_larga', 'Tirada larga reducida', '50\'',
                'Tirada larga reducida — tapering',
                { warmup: 'Calentamiento estándar', main: '50\' carrera continua cómoda', cooldown: 'Vuelta a la calma estándar' },
                'Reducción significativa del volumen')],
            // Sun - Fuerza ligera superior
            [strength(d[6], 1, 'Fuerza tren superior (ligera)', '20\'', ['tren_superior'])]
        ];

        case 16: return [
            [],
            // Tue - Rodaje suave
            [run(d[1], 1, 'rodaje', 'Rodaje suave', '30\'',
                'Rodaje suave — tapering profundo',
                { warmup: WU_STANDARD, main: '25\' rodaje suave', cooldown: CD_STANDARD },
                'Fácil y corto')],
            // Wed - Fuerza mínima
            [strength(d[2], 1, 'Fuerza mantenimiento', '15\'', ['tren_inferior'])],
            // Thu - Activación
            [run(d[3], 1, 'activacion', 'Activación', '25\'',
                'Trote con progresiones',
                { warmup: '5\' caminata', main: '15\' trote suave + 4x100m progresivos', cooldown: '5\' caminata' },
                'Solo activar piernas')],
            [],
            // Sat - Rodaje suave
            [run(d[5], 1, 'rodaje', 'Rodaje suave', '30\'',
                'Rodaje suave pre-tapering final',
                { warmup: WU_STANDARD, main: '25\' rodaje muy suave', cooldown: CD_STANDARD },
                'Piernas frescas')],
            // Sun - Descanso / Movilidad
            []
        ];

        // ==================== FASE CARRERA ====================

        case 17: return [
            [],
            // Tue - Trote suave
            [run(d[1], 1, 'rodaje', 'Trote suave', '25\'',
                'Trote suave de mantenimiento',
                { warmup: '5\' caminata', main: '20\' trote suave', cooldown: '5\' estiramientos' },
                'Semana pre-carrera')],
            [],
            // Thu - Activación corta
            [run(d[3], 1, 'activacion', 'Activación pre-carrera', '20\'',
                'Activación con 3 progresiones',
                { warmup: '5\' caminata', main: '10\' trote + 3x80m progresivos', cooldown: '5\' caminata + estiramientos' },
                'Solo activar — cero fatiga')],
            [],
            // Sat - Trote mínimo
            [run(d[5], 1, 'rodaje', 'Trote mínimo', '15-20\'',
                'Trote muy corto para activar antes de la carrera',
                { warmup: '5\' caminata', main: '10-15\' trote suave', cooldown: 'Estiramientos suaves' },
                'Mañana = descanso / preparación mental')],
            // Sun - Descanso
            []
        ];

        case 18: return [
            [],
            // Tue - Trote suave
            [run(d[1], 1, 'rodaje', 'Trote suave', '15\'',
                'Trote mínimo de mantenimiento',
                { warmup: '5\' caminata', main: '10\' trote muy suave', cooldown: 'Estiramientos' },
                'Última sesión de trote')],
            [],
            // Thu - Activación pre-carrera
            [run(d[3], 1, 'activacion', 'Activación pre-carrera', '15\'',
                'Última activación antes de la carrera',
                { warmup: '5\' caminata', main: '8\' trote + 2x60m progresivos', cooldown: '5\' caminata' },
                'Corto y con buenas sensaciones')],
            // Fri - Descanso total
            [],
            // Sat - Descanso / Preparación
            [],
            // Sun - ¡¡¡ MEDIA MARATÓN !!!
            [run(d[6], 1, 'carrera', '¡MEDIA MARATÓN!', '21.1 km',
                'Día de carrera — ¡a disfrutar!',
                { warmup: '15\' trote suave + activación + 2 progresiones', main: 'Media maratón — empezar conservadora, crecer en la segunda mitad', cooldown: 'Caminar + estiramientos + hidratación' },
                '¡A por ello! Empezar conservadora, disfrutar el recorrido, crecer al final')]
        ];

        default:
            return [[], [], [], [], [], [], []];
    }
}

// ============================================================
// EXERCISES
// ============================================================

const exercises = {
    tren_inferior: {
        name: 'Fuerza Tren Inferior',
        exercises: {
            hip_thrust: {
                name: 'Hip thrust / Puente',
                sets: '3–4', reps: '10–12', rest: '60–90s',
                tips: 'Control, glúteo',
                image: 'img/exercises/hip-thrust.gif', videoUrl: ''
            },
            peso_muerto_rumano: {
                name: 'Peso muerto rumano',
                sets: '3', reps: '8–10', rest: '90s',
                tips: 'Espalda neutra',
                image: 'img/exercises/peso-muerto-rumano.gif', videoUrl: ''
            },
            step_up: {
                name: 'Step-up',
                sets: '3', reps: '8/8', rest: '60s',
                tips: 'Estabilidad rodilla',
                image: 'img/exercises/step-up.gif', videoUrl: ''
            },
            sentadilla_goblet: {
                name: 'Sentadilla goblet',
                sets: '3', reps: '8–10', rest: '90s',
                tips: 'Rango cómodo',
                image: 'img/exercises/sentadilla-goblet.gif', videoUrl: ''
            },
            clamshell: {
                name: 'Clamshell con goma',
                sets: '3', reps: '12–15', rest: '45s',
                tips: 'Glúteo medio',
                image: 'img/exercises/clamshell.gif', videoUrl: ''
            },
            plancha: {
                name: 'Plancha frontal',
                sets: '3', reps: '30–40s', rest: '45s',
                tips: 'Core activo',
                image: 'img/exercises/plancha.gif', videoUrl: ''
            }
        }
    },
    tren_superior: {
        name: 'Fuerza Tren Superior',
        exercises: {
            remo_mancuerna: {
                name: 'Remo con mancuerna',
                sets: '3', reps: '10–12', rest: '60s',
                tips: 'Espalda',
                image: 'img/exercises/remo-mancuerna.gif', videoUrl: ''
            },
            press_pecho: {
                name: 'Press pecho',
                sets: '3', reps: '8–10', rest: '60–90s',
                tips: 'Control',
                image: 'img/exercises/press-pecho.gif', videoUrl: ''
            },
            jalon_pecho: {
                name: 'Jalón al pecho',
                sets: '3', reps: '10–12', rest: '60s',
                tips: 'Postura',
                image: 'img/exercises/jalon-pecho.gif', videoUrl: ''
            },
            press_hombro: {
                name: 'Press hombro',
                sets: '3', reps: '8–10', rest: '60s',
                tips: 'Ligero',
                image: 'img/exercises/press-hombro.gif', videoUrl: ''
            },
            pallof_press: {
                name: 'Pallof press',
                sets: '3', reps: '12/12', rest: '45s',
                tips: 'Antirotación',
                image: 'img/exercises/pallof-press.gif', videoUrl: ''
            }
        }
    },
    pliometria: {
        name: 'Pliometría',
        exercises: {
            saltitos: {
                name: 'Saltitos en el sitio',
                sets: '3', reps: '15–20', rest: '',
                tips: 'Suaves',
                image: 'img/exercises/saltitos.gif'
            },
            skipping: {
                name: 'Skipping bajo',
                sets: '3', reps: '20s', rest: '',
                tips: 'Rápido',
                image: 'img/exercises/skipping.gif'
            },
            talones_gluteo: {
                name: 'Talones glúteo',
                sets: '3', reps: '20s', rest: '',
                tips: 'Relajado',
                image: 'img/exercises/talones-gluteo.gif'
            }
        }
    },
    calentamiento: {
        name: 'Calentamiento',
        steps: [
            { part: 'Activación', duration: '5\'', content: 'Caminar rápido + trote' },
            { part: 'Movilidad', duration: '5\'', content: 'Tobillo, cadera, rodilla' },
            { part: 'Activación específica', duration: '3\'', content: 'Puentes, monster walk' }
        ]
    },
    vuelta_calma: {
        name: 'Vuelta a la calma',
        stretches: [
            { muscle: 'Gemelos', time: '20–30s', tips: 'Talón apoyado' },
            { muscle: 'Isquios', time: '20–30s', tips: 'Rodilla semiflex' },
            { muscle: 'Cuádriceps', time: '20–25s', tips: 'Sin tirar rodilla' },
            { muscle: 'Glúteo', time: '25–30s', tips: 'Figura 4' },
            { muscle: 'Flexor cadera', time: '20–30s', tips: 'Pelvis neutra' }
        ]
    },
    tecnica_respiracion: {
        name: 'Técnica y Respiración',
        tips: [
            { topic: 'Cadencia', advice: 'Pasos cortos y rápidos (170–176)' },
            { topic: 'Pisada', advice: 'Debajo del cuerpo' },
            { topic: 'Brazos', advice: 'Relajados, atrás' },
            { topic: 'Respiración', advice: 'Nasal en rodajes' },
            { topic: 'Mental', advice: 'Podría seguir' }
        ]
    }
};

// ============================================================
// PHASES
// ============================================================

const phases = {
    base: { name: 'Base', weeks: [4, 5, 6, 7], color: '#4CAF50' },
    desarrollo: { name: 'Desarrollo', weeks: [8, 9, 10, 11], color: '#FF9800' },
    especifico: { name: 'Específico', weeks: [12, 13, 14], color: '#F44336' },
    tapering: { name: 'Tapering', weeks: [15, 16], color: '#9C27B0' },
    carrera: { name: 'Semana de Carrera', weeks: [17, 18], color: '#2196F3' }
};

// ============================================================
// USERS
// ============================================================

const users = {
    // ⚠️  Estos UIDs son de ejemplo.
    // Después de crear los usuarios en Firebase Auth, reemplaza estos UIDs
    // por los UIDs reales que Firebase Auth les asigna.
    uid_ana: {
        name: 'Ana',
        email: 'ana@email.com',
        role: 'athlete',
        createdAt: '2026-02-07T00:00:00Z'
    },
    uid_entrenador: {
        name: 'Entrenador',
        email: 'entrenador@email.com',
        role: 'coach',
        createdAt: '2026-02-07T00:00:00Z'
    }
};

// ============================================================
// SEED
// ============================================================

async function seed() {
    console.log('🌱 Iniciando seed de RunTracker...\n');

    try {
        const plan = generatePlan();

        console.log('📋 Cargando plan de entrenamiento (semanas 4-18)...');
        await db.ref('plan').set(plan);
        console.log('   ✓ Plan cargado — 15 semanas, 105 días\n');

        console.log('💪 Cargando ejercicios...');
        await db.ref('exercises').set(exercises);
        console.log('   ✓ 6 categorías de ejercicios\n');

        console.log('📊 Cargando fases...');
        await db.ref('phases').set(phases);
        console.log('   ✓ 5 fases del plan\n');

        console.log('👥 Cargando usuarios de ejemplo...');
        await db.ref('users').set(users);
        console.log('   ✓ 2 usuarios (deportista + entrenador)\n');

        console.log('================================================');
        console.log('✅ Seed completado exitosamente!');
        console.log('================================================');
        console.log('\n⚠️  IMPORTANTE:');
        console.log('1. Crea los usuarios en Firebase Auth (Console > Authentication)');
        console.log('2. Copia los UIDs reales de Firebase Auth');
        console.log('3. Actualiza los UIDs en la base de datos:');
        console.log('   Firebase Console > Realtime Database > users');
        console.log('   Renombra "uid_ana" y "uid_entrenador" por los UIDs reales\n');

    } catch (error) {
        console.error('❌ Error durante el seed:', error);
    }

    process.exit(0);
}

seed();
