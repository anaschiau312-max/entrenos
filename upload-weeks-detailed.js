const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

const weeks = {
    "6": {
        weekNumber: 6,
        startDate: "2026-02-16",
        endDate: "2026-02-22",
        phase: "BASE",
        volumeTarget: "~135 min carrera (4 sesiones)",
        context: "Horario laboral condicionante (Mar-Jue 9-22h)",
        successIndicators: [
            "Tirada larga de 50 min completada sin dolor de rodilla",
            "FC media de la tirada larga ≤158",
            "4 sesiones de carrera completadas",
            "Al menos 1 sesión de fuerza tren inferior realizada",
            "Sin señales articulares en las 24h post-tirada"
        ],
        days: {
            "2026-02-16": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad",
                    description: "Rutina completa de movilidad día de descanso",
                    duration: 15,
                    notes: "Trabajo hasta 18h"
                }]
            },
            "2026-02-17": {
                sessions: [{
                    type: "running",
                    title: "Rodaje fácil",
                    description: "Cinta: 8.0-8.4 km/h. FC ≤153. Respiración nasal. Si necesitas abrir la boca, baja la cinta 0.2-0.3 km/h",
                    duration: 30,
                    durationRange: "25-30",
                    notes: "Antes del trabajo (9-22h)",
                    warmup: "pre-carrera-corta",
                    cooldown: "post-carrera-corta"
                }]
            },
            "2026-02-18": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad express",
                    description: "5 ejercicios prioritarios: 90/90 hip switches, rotación torácica, flexión-extensión rodilla, movilidad tobillo, flexor cadera",
                    duration: 7,
                    notes: "Trabajo 9-22h. Hacer en casa antes de dormir"
                }]
            },
            "2026-02-19": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad express",
                    description: "Misma rutina express que miércoles: 90/90 hip switches, rotación torácica, flexión-extensión rodilla, movilidad tobillo, flexor cadera",
                    duration: 7,
                    notes: "Trabajo 9-22h. Hacer en casa antes de dormir"
                }]
            },
            "2026-02-20": {
                sessions: [{
                    type: "running",
                    title: "Rodaje",
                    description: "Cinta: 8.0-8.4 km/h. FC ≤153. Respiración nasal como regulador",
                    duration: 30,
                    warmup: "pre-carrera-corta",
                    cooldown: "post-carrera-corta"
                }, {
                    type: "strength_lower",
                    title: "Fuerza tren inferior",
                    description: "Fuerza tren inferior completa (activación + fuerza principal + core). Curl femoral deslizante en vez de peso muerto rumano si no hay máquina",
                    duration: 40,
                    durationRange: "35-40",
                    cooldown: "post-fuerza-inferior"
                }],
                notes: "Trabajo hasta 14:30. Secuencia: Calentamiento pre-carrera corta → carrera → vuelta a la calma post-carrera corta → fuerza inferior → vuelta a la calma post-fuerza inferior"
            },
            "2026-02-21": {
                sessions: [{
                    type: "running",
                    title: "Rodaje",
                    description: "Cinta: 8.0-8.4 km/h. FC ≤153. Respiración nasal como regulador",
                    duration: 30,
                    warmup: "pre-carrera-corta",
                    cooldown: "post-carrera-corta"
                }, {
                    type: "strength_upper",
                    title: "Fuerza tren superior",
                    description: "Fuerza tren superior completa. Piernas descansan de carga pesada",
                    duration: 25,
                    durationRange: "20-25",
                    warmup: "pre-fuerza-superior",
                    cooldown: "post-fuerza-superior"
                }],
                notes: "Libre. Paseo ok este día. Secuencia: Calentamiento pre-carrera corta → carrera → vuelta a la calma post-carrera corta → calentamiento fuerza superior → fuerza superior → vuelta a la calma post-fuerza superior"
            },
            "2026-02-22": {
                sessions: [{
                    type: "running",
                    title: "Tirada larga",
                    description: "Cinta: empezar a 7.5-7.8 km/h los primeros 5-10 min. Subir a 8.0-8.4 km/h zona cómoda. Si a partir del min 35-40 necesitas abrir la boca, bajar a 7.5-7.8 km/h. FC se registra pero el regulador principal es la respiración nasal. Objetivo FC media post-sesión: ≤158. Evaluar rodilla durante y 24h después",
                    duration: 50,
                    warmup: "pre-carrera-larga",
                    cooldown: "post-carrera-larga"
                }],
                notes: "Libre. NO paseo largo ni fuerza el día anterior"
            }
        }
    },
    "7": {
        weekNumber: 7,
        startDate: "2026-02-23",
        endDate: "2026-03-01",
        phase: "BASE",
        volumeTarget: "~140 min carrera (4 sesiones)",
        context: "Mismos horarios que semana 6. Semana de consolidación antes de descarga",
        successIndicators: [
            "Tirada larga de 55 min completada sin dolor de rodilla",
            "FC media estable o menor que semana 6 a ritmo similar",
            "Longitud de paso manteniéndose ≥0.81m (sin retroceso al patrón protector)",
            "Fuerza inferior mantenida 2 semanas consecutivas"
        ],
        days: {
            "2026-02-23": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad",
                    description: "Rutina completa de movilidad día de descanso",
                    duration: 15,
                    notes: "Trabajo hasta 18h"
                }]
            },
            "2026-02-24": {
                sessions: [{
                    type: "running",
                    title: "Rodaje fácil",
                    description: "Cinta: 8.0-8.4 km/h. FC ≤153. Respiración nasal como regulador complementario",
                    duration: 30,
                    notes: "Antes del trabajo (9-22h)",
                    warmup: "pre-carrera-corta",
                    cooldown: "post-carrera-corta"
                }]
            },
            "2026-02-25": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad express",
                    description: "5 ejercicios prioritarios: 90/90 hip switches, rotación torácica, flexión-extensión rodilla, movilidad tobillo, flexor cadera",
                    duration: 7,
                    notes: "Trabajo 9-22h"
                }]
            },
            "2026-02-26": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad express",
                    description: "Misma rutina express: 90/90 hip switches, rotación torácica, flexión-extensión rodilla, movilidad tobillo, flexor cadera",
                    duration: 7,
                    notes: "Trabajo 9-22h"
                }]
            },
            "2026-02-27": {
                sessions: [{
                    type: "running",
                    title: "Rodaje",
                    description: "Cinta: 8.0-8.4 km/h. FC ≤153. Respiración nasal como regulador",
                    duration: 30,
                    warmup: "pre-carrera-corta",
                    cooldown: "post-carrera-corta"
                }, {
                    type: "strength_lower",
                    title: "Fuerza tren inferior",
                    description: "Fuerza tren inferior completa. Seguir con curl femoral deslizante o curl femoral en máquina si hay gym. Practicar patrón bisagra de cadera sin peso si hay tiempo",
                    duration: 40,
                    durationRange: "35-40",
                    cooldown: "post-fuerza-inferior"
                }],
                notes: "Trabajo hasta 14:30. Secuencia: Calentamiento pre-carrera corta → carrera → vuelta a la calma post-carrera corta → fuerza inferior → vuelta a la calma post-fuerza inferior"
            },
            "2026-02-28": {
                sessions: [{
                    type: "running",
                    title: "Rodaje",
                    description: "Cinta: 8.0-8.4 km/h. FC ≤153. Respiración nasal como regulador",
                    duration: 30,
                    warmup: "pre-carrera-corta",
                    cooldown: "post-carrera-corta"
                }, {
                    type: "strength_upper",
                    title: "Fuerza tren superior",
                    description: "Fuerza tren superior completa",
                    duration: 25,
                    durationRange: "20-25",
                    warmup: "pre-fuerza-superior",
                    cooldown: "post-fuerza-superior"
                }],
                notes: "Libre. Paseo ok este día pero no excesivo (máx 2-3h)"
            },
            "2026-03-01": {
                sessions: [{
                    type: "running",
                    title: "Tirada larga",
                    description: "Cinta: empezar a 7.5-7.8 km/h los primeros 5-10 min. Subir a 8.0-8.4 km/h zona cómoda. Si necesitas abrir la boca, bajar un punto. FC se registra, regulador principal es la respiración nasal. Progresión de 5 min respecto a semana 6. Evaluar: FC media post-sesión (objetivo ≤158), rodilla durante y 24h post, momento en que aparece necesidad de abrir boca",
                    duration: 55,
                    warmup: "pre-carrera-larga",
                    cooldown: "post-carrera-larga"
                }],
                notes: "Libre. NO carga en piernas el día anterior"
            }
        }
    }
};

// Speed reference table for the app
const speedReference = {
    title: "Referencia velocidades cinta",
    note: "Todas las sesiones de carrera se realizan en cinta al 1% de inclinación",
    speeds: [
        { speed: 7.5, pace: "8:00", use: "Calentamiento / recuperación" },
        { speed: 7.8, pace: "7:42", use: "Inicio tirada larga" },
        { speed: 8.0, pace: "7:30", use: "Rodaje suave" },
        { speed: 8.3, pace: "7:14", use: "Rodaje cómodo" },
        { speed: 8.5, pace: "7:03", use: "Techo actual rodaje" }
    ]
};

// Alert signals
const alertSignals = [
    "Dolor de rodilla (no sensación, dolor) durante o después de carrera",
    "FC que sube >10 lpm en los últimos 15 min respecto a los primeros 15 min a mismo ritmo (deriva cardíaca excesiva)",
    "Sensación de rodilla que no desaparece en los primeros 10 min de carrera",
    "Fatiga que no remite con 48h de descanso",
    "Asimetría de contacto con suelo >52/48"
];

async function uploadAll() {
    try {
        console.log('Subiendo datos detallados...');

        // Upload weeks
        for (const [weekNum, weekData] of Object.entries(weeks)) {
            console.log(`Subiendo semana ${weekNum}...`);
            await db.ref(`plan/weeks/${weekNum}`).set(weekData);
            console.log(`Semana ${weekNum} subida`);
        }

        // Upload speed reference
        console.log('Subiendo tabla de velocidades...');
        await db.ref('plan/speedReference').set(speedReference);

        // Upload alert signals
        console.log('Subiendo señales de alerta...');
        await db.ref('plan/alertSignals').set(alertSignals);

        console.log('Todo subido correctamente!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

uploadAll();
