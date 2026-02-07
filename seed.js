#!/usr/bin/env node

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

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

function weekDates(mondayDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) { dates.push(addDays(mondayDate, i)); }
    return dates;
}

function run(dateStr, n, subtype, title, duration, description, details, notes) {
    return {
        id: `s_${dateStr.replace(/-/g, '')}_${n}`,
        type: 'running', subtype, title, duration, description, details,
        notes: notes || '', completed: false
    };
}

function strength(dateStr, n, title, duration, groups) {
    return {
        id: `s_${dateStr.replace(/-/g, '')}_${n}`,
        type: 'strength', subtype: groups[0], title, duration,
        exerciseGroup: groups, completed: false
    };
}

function mobility(dateStr, n, title, duration, notes) {
    return {
        id: `s_${dateStr.replace(/-/g, '')}_${n}`,
        type: 'mobility', subtype: 'movilidad_core', title, duration,
        description: 'Movilidad y trabajo de core', notes: notes || '', completed: false
    };
}

const WU = "5' caminata + trote suave + movilidad";
const WR = "10' trote suave + ejercicios de activación";
const CD = "5' caminata + estiramientos";
const CR = "10' trote suave + vuelta a la calma estándar";

function generatePlan() {
    const weeks = {};
    const week4Monday = new Date(2026, 1, 2);
    const phaseMap = {
        4: 'base', 5: 'base', 6: 'base', 7: 'base',
        8: 'desarrollo', 9: 'desarrollo', 10: 'desarrollo', 11: 'desarrollo',
        12: 'especifico', 13: 'especifico', 14: 'especifico',
        15: 'tapering', 16: 'tapering', 17: 'carrera', 18: 'recuperacion'
    };
    for (let wn = 4; wn <= 18; wn++) {
        const monday = addDays(week4Monday, (wn - 4) * 7);
        const dates = weekDates(monday);
        const weekId = `week_${String(wn).padStart(2, '0')}`;
        const weekData = getWeekData(wn, dates);
        const days = {};
        dates.forEach((date, i) => {
            const dateStr = formatDate(date);
            const dayData = weekData[i];
            days[dateStr] = {
                dayOfWeek: DAYS_ES[i],
                workSchedule: dayData.workSchedule,
                bestMoment: dayData.bestMoment,
                sessions: dayData.sessions
            };
        });
        weeks[weekId] = { weekNumber: wn, startDate: formatDate(monday), phase: phaseMap[wn], days };
    }
    return { weeks };
}

function getWeekData(weekNum, dates) {
    const d = dates.map(formatDate);
    switch (weekNum) {
        // SEMANA 4 (2 feb - 8 feb 2026)
        case 4: return [
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-24h', bestMoment: 'Mañana', sessions: [
                run(d[2], 1, 'rodaje', 'Carrera ligera exterior', "15'", 'Carrera ligera para retomar contacto',
                    { warmup: "5' caminata", main: "15' carrera ligera exterior", cooldown: 'Estiramientos suaves' }, 'Primera carrera')
            ]},
            { workSchedule: '24-8h', bestMoment: '', sessions: [] },
            { workSchedule: '9-14:30', bestMoment: 'Tarde', sessions: [
                run(d[4], 1, 'rodaje', 'Rodaje cómodo', "30-35'", 'Rodaje cómodo a ritmo ligero',
                    { warmup: "5' caminata + trote", main: "25-30' rodaje cómodo", cooldown: 'Estiramientos' }, '')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Mañana', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "45'", 'Tirada larga a cadencia ligera',
                    { warmup: 'Calentamiento estándar', main: "45' carrera continua cómoda", cooldown: 'Vuelta a la calma' }, 'Cadencia ligera')
            ]},
            { workSchedule: '15-22h', bestMoment: 'Mañana', sessions: [
                strength(d[6], 1, 'Fuerza tren inferior + superior', "25-30'", ['tren_inferior', 'tren_superior'])
            ]}
        ];

        // SEMANA 5 (9 feb - 15 feb)
        case 5: return [
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-22h', bestMoment: 'Mañana', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil', "25-30'", 'Rodaje fácil',
                    { warmup: WU, main: "20-25' rodaje fácil", cooldown: CD }, 'Muy cómodo')
            ]},
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-18h', bestMoment: 'Mañana', sessions: [
                strength(d[3], 1, 'Fuerza tren superior', "35-40'", ['tren_superior'])
            ]},
            { workSchedule: '9-14:30', bestMoment: 'Mañana', sessions: [
                run(d[4], 1, 'fartlek', 'Rodaje con cambios', "35'", 'Rodaje con cambios de ritmo',
                    { warmup: WU, main: "25' fácil + 5x1' alegre / 1' suave", cooldown: CD }, '')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Mañana', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "55'", 'Tirada larga cómoda',
                    { warmup: 'Calentamiento estándar', main: "55' carrera continua", cooldown: 'Vuelta a la calma' }, 'Sin dolor')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Mañana', sessions: [
                strength(d[6], 1, 'Fuerza tren inferior', "25'", ['tren_inferior'])
            ]}
        ];
        // SEMANA 6 (16 feb - 22 feb)
        case 6: return [
            { workSchedule: '9-18h', bestMoment: 'Mañana', sessions: [
                strength(d[0], 1, 'Fuerza tren superior', "30'", ['tren_superior'])
            ]},
            { workSchedule: '9-22h', bestMoment: 'Mañana', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil', "35'", 'Rodaje fácil',
                    { warmup: WU, main: "30' rodaje fácil", cooldown: CD }, '')
            ]},
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-14:30', bestMoment: 'Tarde', sessions: [
                run(d[4], 1, 'rodaje', 'Rodaje cómodo', "40'", 'Rodaje cómodo',
                    { warmup: WU, main: "35' rodaje cómodo", cooldown: CD }, '')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Mañana', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "60'", 'Tirada larga',
                    { warmup: 'Calentamiento estándar', main: "60' carrera continua", cooldown: 'Vuelta a la calma' }, '')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Mañana', sessions: [
                strength(d[6], 1, 'Fuerza tren inferior', "40'", ['tren_inferior'])
            ]}
        ];

        // SEMANA 7 (23 feb - 1 mar) — Descarga
        case 7: return [
            { workSchedule: '9-18h', bestMoment: '', sessions: [] },
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-22h', bestMoment: '', sessions: [] },
            { workSchedule: '9-22h', bestMoment: 'Medio día', sessions: [
                mobility(d[3], 1, 'Movilidad + core', "20'", 'Semana de descarga')
            ]},
            { workSchedule: '9-14:30', bestMoment: 'Tarde', sessions: [
                run(d[4], 1, 'rodaje', 'Rodaje cómodo', "30-35'", 'Rodaje cómodo sin forzar',
                    { warmup: WU, main: "25-30' rodaje cómodo", cooldown: CD }, 'Descarga')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Tarde', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA (descarga)', "50'", 'Tirada larga reducida',
                    { warmup: 'Calentamiento estándar', main: "50' carrera continua", cooldown: 'Vuelta a la calma' }, 'Volumen reducido')
            ]},
            { workSchedule: 'LIBRE', bestMoment: 'Tarde', sessions: [
                strength(d[6], 1, 'Fuerza', "25-30'", ['tren_inferior', 'tren_superior'])
            ]}
        ];
        // SEMANA 8 (2 mar - 8 mar) - Sin horarios
        case 8: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil + strides', "35'", 'Rodaje fácil con progresiones',
                    { warmup: WU, main: "30' rodaje + 5 strides", cooldown: CD }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'fartlek', 'Rodaje con cambios', "40'", 'Rodaje con cambios',
                    { warmup: WR, main: "30' con cambios variados", cooldown: CR }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "65'", 'Tirada larga',
                    { warmup: 'Calentamiento estándar', main: "65' carrera continua", cooldown: 'Vuelta a la calma' }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];

        // SEMANA 9 (9 mar - 15 mar)
        case 9: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil', "40'", 'Rodaje fácil',
                    { warmup: WU, main: "35' rodaje fácil", cooldown: CD }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[2], 1, 'fartlek', 'Rodaje con cambios', "45'", 'Rodaje con cambios',
                    { warmup: WR, main: "35' con cambios de ritmo", cooldown: CR }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'tempo', 'Tempo ritmo controlado', "45'", 'Ritmo controlado',
                    { warmup: WR, main: "20' fácil + 2x8' ritmo controlado (rec: 3')", cooldown: CR }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "70'", 'Tirada larga',
                    { warmup: 'Calentamiento estándar', main: "70' carrera continua", cooldown: 'Vuelta a la calma' }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        // SEMANA 10 (16 mar - 22 mar)
        case 10: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil + strides', "40'", 'Rodaje fácil + strides',
                    { warmup: WU, main: "35' rodaje + strides", cooldown: CD }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[2], 1, 'rodaje', 'Rodaje cómodo', "45'", 'Rodaje cómodo',
                    { warmup: WU, main: "40' rodaje cómodo", cooldown: CD }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'tempo', 'Tempo ritmo controlado', "50'", 'Ritmo controlado',
                    { warmup: WR, main: "3x10' ritmo controlado (rec: 3')", cooldown: CR }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "75'", 'Tirada larga 75 min',
                    { warmup: 'Calentamiento estándar', main: "75' carrera continua", cooldown: 'Vuelta a la calma' }, 'Hidratación')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        // SEMANA 11 (23 mar - 29 mar) — Descarga
        case 11: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje regenerativo', "35'", 'Rodaje suave descarga',
                    { warmup: WU, main: "30' rodaje suave", cooldown: CD }, 'Semana de descarga')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'rodaje', 'Rodaje cómodo', "40'", 'Rodaje cómodo',
                    { warmup: WU, main: "35' rodaje cómodo", cooldown: CD }, 'No forzar')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA (descarga)', "60'", 'Tirada larga reducida',
                    { warmup: 'Calentamiento estándar', main: "60' carrera suave", cooldown: 'Vuelta a la calma' }, 'Volumen reducido')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];

        // SEMANA 12 (30 mar - 5 abr)
        case 12: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil + strides', "40'", 'Rodaje fácil + strides',
                    { warmup: WU, main: "35' rodaje + strides", cooldown: CD }, 'Fase específica')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'ritmo_especifico', 'Ritmo media maratón', "45'", 'Ritmo objetivo HM',
                    { warmup: WR, main: "20' fácil + 15' ritmo media maratón", cooldown: CR }, 'Ritmo objetivo')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "80'", 'Tirada larga 80 min',
                    { warmup: 'Calentamiento estándar', main: "80' carrera continua", cooldown: 'Vuelta a la calma' }, 'Hidratación')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        // SEMANA 13 (6 abr - 12 abr)
        case 13: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil', "45'", 'Rodaje fácil',
                    { warmup: WU, main: "40' rodaje fácil", cooldown: CD }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'ritmo_especifico', 'Tempo a ritmo HM', "55'", 'Bloques largos ritmo HM',
                    { warmup: WR, main: "2x20' a ritmo media maratón (rec: 5')", cooldown: CR }, 'Poder seguir al acabar')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA', "85'", 'Tirada larga 85 min',
                    { warmup: 'Calentamiento estándar', main: "85' carrera continua", cooldown: 'Vuelta a la calma completa' }, 'Hidratación y gel')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        // SEMANA 14 (13 abr - 19 abr)
        case 14: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil', "40'", 'Rodaje fácil',
                    { warmup: WU, main: "35' rodaje fácil", cooldown: CD }, '')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'ritmo_especifico', 'Ritmo media maratón', "45'", 'Bloque largo ritmo objetivo',
                    { warmup: WR, main: "30' a ritmo media maratón", cooldown: CR }, 'Consolidar sensaciones')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'TIRADA LARGA (máxima)', "90'", 'Tirada más larga del plan',
                    { warmup: 'Calentamiento estándar', main: "90' carrera continua", cooldown: 'Vuelta a la calma completa' }, 'TIRADA MÁXIMA - hidratación y gel')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];

        // SEMANA 15 (20 abr - 26 abr) — Tapering
        case 15: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje fácil', "40'", 'Rodaje fácil - inicio tapering',
                    { warmup: WU, main: "35' rodaje fácil", cooldown: CD }, 'Tapering - empezamos a reducir')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'ritmo_especifico', 'Ritmo HM corto', "40'", 'Bloque corto ritmo HM',
                    { warmup: WR, main: "20' fácil + 10' ritmo media maratón", cooldown: CR }, 'No acumular fatiga')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'tirada_larga', 'Tirada larga reducida', "60'", 'Tirada reducida tapering',
                    { warmup: 'Calentamiento estándar', main: "60' carrera cómoda", cooldown: 'Vuelta a la calma' }, 'Reducción volumen')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        // SEMANA 16 (27 abr - 3 may) — Tapering
        case 16: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Rodaje suave', "35'", 'Rodaje suave tapering profundo',
                    { warmup: WU, main: "30' rodaje suave", cooldown: CD }, 'Fácil y corto')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'activacion', 'Activación', "30'", 'Trote con toque de ritmo',
                    { warmup: "5' caminata", main: "20' trote suave + 5' ritmo media", cooldown: "5' caminata" }, 'Solo activar piernas')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'rodaje', 'Rodaje suave', "40'", 'Rodaje suave pre-carrera',
                    { warmup: WU, main: "35' rodaje muy suave", cooldown: CD }, 'Piernas frescas')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        // SEMANA 17 (4 may - 10 may) — Semana de carrera
        case 17: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'rodaje', 'Trote muy fácil', "30'", 'Trote muy fácil mantenimiento',
                    { warmup: "5' caminata", main: "25' trote muy fácil", cooldown: "5' estiramientos" }, 'Semana de carrera - sin fatiga')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'activacion', 'Activación pre-carrera', "25'", 'Activación con strides',
                    { warmup: "5' caminata", main: "20' trote + 4 strides", cooldown: "5' caminata + estiramientos" }, 'Solo activar - cero fatiga')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[6], 1, 'carrera', 'DÍA DE LA MEDIA MARATÓN', '21.1 km', 'Día de carrera - a disfrutar!',
                    { warmup: "15' trote suave + activación", main: 'Media maratón - empezar conservadora, crecer al final', cooldown: 'Caminar + estiramientos + hidratación' }, 'A por ello!')
            ]}
        ];

        // SEMANA 18 (11 may - 17 may) — Recuperación
        case 18: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[1], 1, 'recuperacion', 'Paseo suave (opcional)', "20-30'", 'Paseo suave recuperación',
                    { warmup: '', main: "20-30' caminata suave", cooldown: 'Estiramientos suaves' }, 'Solo si el cuerpo lo pide')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[3], 1, 'recuperacion', 'Trote suave (opcional)', "15-20'", 'Primer trote post-carrera',
                    { warmup: "5' caminata", main: "10-15' trote muy suave", cooldown: 'Estiramientos' }, 'Solo si no hay molestias')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [
                run(d[5], 1, 'recuperacion', 'Rodaje regenerativo', "25-30'", 'Rodaje recuperación',
                    { warmup: WU, main: "20-25' rodaje muy suave", cooldown: CD }, 'Retomar poco a poco')
            ]},
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
        default: return [
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] },
            { workSchedule: '', bestMoment: '', sessions: [] }
        ];
    }
}

const exercises = {
    tren_inferior: {
        name: 'Fuerza Tren Inferior',
        exercises: {
            hip_thrust: { name: 'Hip thrust / Puente', sets: '3-4', reps: '10-12', rest: '60-90s', tips: 'Control, glúteo', image: 'img/exercises/hip-thrust.gif', videoUrl: '' },
            peso_muerto_rumano: { name: 'Peso muerto rumano', sets: '3', reps: '8-10', rest: '90s', tips: 'Espalda neutra', image: 'img/exercises/peso-muerto-rumano.gif', videoUrl: '' },
            step_up: { name: 'Step-up', sets: '3', reps: '8/8', rest: '60s', tips: 'Estabilidad rodilla', image: 'img/exercises/step-up.gif', videoUrl: '' },
            sentadilla_goblet: { name: 'Sentadilla goblet', sets: '3', reps: '8-10', rest: '90s', tips: 'Rango cómodo', image: 'img/exercises/sentadilla-goblet.gif', videoUrl: '' },
            clamshell: { name: 'Clamshell con goma', sets: '3', reps: '12-15', rest: '45s', tips: 'Glúteo medio', image: 'img/exercises/clamshell.gif', videoUrl: '' },
            plancha: { name: 'Plancha frontal', sets: '3', reps: '30-40s', rest: '45s', tips: 'Core activo', image: 'img/exercises/plancha.gif', videoUrl: '' }
        }
    },
    tren_superior: {
        name: 'Fuerza Tren Superior',
        exercises: {
            remo_mancuerna: { name: 'Remo con mancuerna', sets: '3', reps: '10-12', rest: '60s', tips: 'Espalda', image: 'img/exercises/remo-mancuerna.gif', videoUrl: '' },
            press_pecho: { name: 'Press pecho', sets: '3', reps: '8-10', rest: '60-90s', tips: 'Control', image: 'img/exercises/press-pecho.gif', videoUrl: '' },
            jalon_pecho: { name: 'Jalón al pecho', sets: '3', reps: '10-12', rest: '60s', tips: 'Postura', image: 'img/exercises/jalon-pecho.gif', videoUrl: '' },
            press_hombro: { name: 'Press hombro', sets: '3', reps: '8-10', rest: '60s', tips: 'Ligero', image: 'img/exercises/press-hombro.gif', videoUrl: '' },
            pallof_press: { name: 'Pallof press', sets: '3', reps: '12/12', rest: '45s', tips: 'Antirotación', image: 'img/exercises/pallof-press.gif', videoUrl: '' }
        }
    },
    movilidad_core: {
        name: 'Movilidad + Core',
        exercises: {
            cat_cow: { name: 'Cat-Cow', sets: '2', reps: '10', rest: '30s', tips: 'Movimiento fluido', image: '', videoUrl: '' },
            bird_dog: { name: 'Bird Dog', sets: '3', reps: '8/8', rest: '45s', tips: 'Estabilidad', image: '', videoUrl: '' },
            dead_bug: { name: 'Dead Bug', sets: '3', reps: '10/10', rest: '45s', tips: 'Core activo', image: '', videoUrl: '' },
            hip_circles: { name: 'Círculos de cadera', sets: '2', reps: '10/10', rest: '30s', tips: 'Amplitud', image: '', videoUrl: '' },
            plancha_lateral: { name: 'Plancha lateral', sets: '2', reps: '20-30s/lado', rest: '45s', tips: 'Alineación', image: '', videoUrl: '' }
        }
    },
    pliometria: {
        name: 'Pliometría',
        exercises: {
            saltitos: { name: 'Saltitos en el sitio', sets: '3', reps: '15-20', rest: '', tips: 'Suaves', image: 'img/exercises/saltitos.gif' },
            skipping: { name: 'Skipping bajo', sets: '3', reps: '20s', rest: '', tips: 'Rápido', image: 'img/exercises/skipping.gif' },
            talones_gluteo: { name: 'Talones glúteo', sets: '3', reps: '20s', rest: '', tips: 'Relajado', image: 'img/exercises/talones-gluteo.gif' }
        }
    },
    calentamiento: {
        name: 'Calentamiento',
        steps: [
            { part: 'Activación', duration: "5'", content: 'Caminar rápido + trote' },
            { part: 'Movilidad', duration: "5'", content: 'Tobillo, cadera, rodilla' },
            { part: 'Activación específica', duration: "3'", content: 'Puentes, monster walk' }
        ]
    },
    vuelta_calma: {
        name: 'Vuelta a la calma',
        stretches: [
            { muscle: 'Gemelos', time: '20-30s', tips: 'Talón apoyado' },
            { muscle: 'Isquios', time: '20-30s', tips: 'Rodilla semiflex' },
            { muscle: 'Cuádriceps', time: '20-25s', tips: 'Sin tirar rodilla' },
            { muscle: 'Glúteo', time: '25-30s', tips: 'Figura 4' },
            { muscle: 'Flexor cadera', time: '20-30s', tips: 'Pelvis neutra' }
        ]
    },
    tecnica_respiracion: {
        name: 'Técnica y Respiración',
        tips: [
            { topic: 'Cadencia', advice: 'Pasos cortos y rápidos (170-176)' },
            { topic: 'Pisada', advice: 'Debajo del cuerpo' },
            { topic: 'Brazos', advice: 'Relajados, atrás' },
            { topic: 'Respiración', advice: 'Nasal en rodajes' },
            { topic: 'Mental', advice: 'Podría seguir' }
        ]
    }
};

const phases = {
    base: { name: 'Base', weeks: [4, 5, 6, 7], color: '#4CAF50' },
    desarrollo: { name: 'Desarrollo', weeks: [8, 9, 10, 11], color: '#FF9800' },
    especifico: { name: 'Específico', weeks: [12, 13, 14], color: '#F44336' },
    tapering: { name: 'Tapering', weeks: [15, 16], color: '#9C27B0' },
    carrera: { name: 'Semana de Carrera', weeks: [17], color: '#2196F3' },
    recuperacion: { name: 'Recuperación', weeks: [18], color: '#607D8B' }
};

const users = {
    uid_ana: { name: 'Ana', email: 'ana@email.com', role: 'athlete', createdAt: '2026-02-07T00:00:00Z' },
    uid_entrenador: { name: 'Entrenador', email: 'entrenador@email.com', role: 'coach', createdAt: '2026-02-07T00:00:00Z' }
};

async function seed() {
    console.log('Iniciando seed de RunTracker...');
    try {
        const plan = generatePlan();
        let totalSessions = 0, runningSessions = 0, strengthSessions = 0, mobilitySessions = 0;
        Object.values(plan.weeks).forEach(week => {
            Object.values(week.days).forEach(day => {
                day.sessions.forEach(session => {
                    totalSessions++;
                    if (session.type === 'running') runningSessions++;
                    else if (session.type === 'strength') strengthSessions++;
                    else if (session.type === 'mobility') mobilitySessions++;
                });
            });
        });
        console.log('Cargando plan de entrenamiento (semanas 4-18)...');
        await db.ref('plan').set(plan);
        console.log('   OK Plan cargado - 15 semanas, 105 días');
        console.log('   OK ' + totalSessions + ' sesiones totales:');
        console.log('      - ' + runningSessions + ' sesiones de carrera');
        console.log('      - ' + strengthSessions + ' sesiones de fuerza');
        console.log('      - ' + mobilitySessions + ' sesiones de movilidad');

        console.log('Cargando ejercicios...');
        await db.ref('exercises').set(exercises);
        console.log('   OK 7 categorias de ejercicios');

        console.log('Cargando fases...');
        await db.ref('phases').set(phases);
        console.log('   OK 6 fases del plan');

        console.log('Cargando usuarios de ejemplo...');
        await db.ref('users').set(users);
        console.log('   OK 2 usuarios (deportista + entrenador)');

        console.log('================================================');
        console.log('Seed completado exitosamente!');
        console.log('================================================');
        console.log('IMPORTANTE:');
        console.log('1. Crea los usuarios en Firebase Auth (Console > Authentication)');
        console.log('2. Copia los UIDs reales de Firebase Auth');
        console.log('3. Actualiza los UIDs en la base de datos');

        console.log('Resumen del plan:');
        console.log('------------------');
        Object.entries(plan.weeks).forEach(([weekId, week]) => {
            const sessionCount = Object.values(week.days).reduce((acc, day) => acc + day.sessions.length, 0);
            console.log(weekId + ': Semana ' + week.weekNumber + ' (' + week.phase + ') - ' + sessionCount + ' sesiones');
        });
    } catch (error) {
        console.error('Error durante el seed:', error);
    }
    process.exit(0);
}

seed();
