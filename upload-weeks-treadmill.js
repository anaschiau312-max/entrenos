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
        days: {
            "2026-02-16": {
                sessions: [{
                    type: "running",
                    title: "Tirada larga",
                    description: "90 min en cinta al 1%. Primeros 60 min: 8.0 km/h. Ultimos 30 min: 8.2-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 90
                }]
            },
            "2026-02-17": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad / Descanso activo",
                    description: "Rutina de movilidad completa o express. Foam roller opcional.",
                    duration: 15
                }]
            },
            "2026-02-18": {
                sessions: [{
                    type: "running",
                    title: "Carrera suave",
                    description: "40 min en cinta al 1%. Velocidad: 8.0-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 40
                }, {
                    type: "strength_upper",
                    title: "Fuerza tren superior",
                    description: "Rutina de fuerza para tren superior. 3 bloques: Activacion, Fuerza principal, Core.",
                    duration: 30
                }]
            },
            "2026-02-19": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad / Descanso activo",
                    description: "Rutina de movilidad completa o express. Foam roller opcional.",
                    duration: 15
                }]
            },
            "2026-02-20": {
                sessions: [{
                    type: "running",
                    title: "Carrera suave",
                    description: "40 min en cinta al 1%. Velocidad: 8.0-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 40
                }, {
                    type: "strength_lower",
                    title: "Fuerza tren inferior",
                    description: "Rutina de fuerza para tren inferior. 3 bloques: Activacion, Fuerza principal, Core.",
                    duration: 30
                }]
            },
            "2026-02-21": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad / Descanso activo",
                    description: "Rutina de movilidad completa o express. Foam roller opcional.",
                    duration: 15
                }]
            },
            "2026-02-22": {
                sessions: [{
                    type: "running",
                    title: "Carrera suave",
                    description: "50 min en cinta al 1%. Velocidad: 8.0-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 50
                }]
            }
        }
    },
    "7": {
        weekNumber: 7,
        startDate: "2026-02-23",
        endDate: "2026-03-01",
        days: {
            "2026-02-23": {
                sessions: [{
                    type: "running",
                    title: "Tirada larga",
                    description: "100 min en cinta al 1%. Primeros 70 min: 8.0 km/h. Ultimos 30 min: 8.2-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 100
                }]
            },
            "2026-02-24": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad / Descanso activo",
                    description: "Rutina de movilidad completa o express. Foam roller opcional.",
                    duration: 15
                }]
            },
            "2026-02-25": {
                sessions: [{
                    type: "running",
                    title: "Carrera suave",
                    description: "45 min en cinta al 1%. Velocidad: 8.0-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 45
                }, {
                    type: "strength_upper",
                    title: "Fuerza tren superior",
                    description: "Rutina de fuerza para tren superior. 3 bloques: Activacion, Fuerza principal, Core.",
                    duration: 30
                }]
            },
            "2026-02-26": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad / Descanso activo",
                    description: "Rutina de movilidad completa o express. Foam roller opcional.",
                    duration: 15
                }]
            },
            "2026-02-27": {
                sessions: [{
                    type: "running",
                    title: "Carrera suave",
                    description: "45 min en cinta al 1%. Velocidad: 8.0-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 45
                }, {
                    type: "strength_lower",
                    title: "Fuerza tren inferior",
                    description: "Rutina de fuerza para tren inferior. 3 bloques: Activacion, Fuerza principal, Core.",
                    duration: 30
                }]
            },
            "2026-02-28": {
                sessions: [{
                    type: "mobility",
                    title: "Movilidad / Descanso activo",
                    description: "Rutina de movilidad completa o express. Foam roller opcional.",
                    duration: 15
                }]
            },
            "2026-03-01": {
                sessions: [{
                    type: "running",
                    title: "Carrera suave",
                    description: "50 min en cinta al 1%. Velocidad: 8.0-8.4 km/h. Respiracion nasal como regulador.",
                    duration: 50
                }]
            }
        }
    }
};

async function uploadWeeks() {
    try {
        console.log('Subiendo semanas 6 y 7 con descripciones de cinta...');

        for (const [weekNum, weekData] of Object.entries(weeks)) {
            console.log(`Subiendo semana ${weekNum}...`);
            await db.ref(`plan/weeks/${weekNum}`).set(weekData);
            console.log(`Semana ${weekNum} subida correctamente`);
        }

        console.log('Todas las semanas subidas correctamente!');
        process.exit(0);
    } catch (error) {
        console.error('Error al subir:', error);
        process.exit(1);
    }
}

uploadWeeks();
