const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();
const uid = 'P6x4IIyFOYa6CPKK5RKJzErokUH2';

// Historical workout logs - Weeks 1-3 with COMPLETE data from watch captures
// Corrected: 18/01 is strength_upper (not lower)
// All running sessions have complete metrics

const historicalLogs = {
    // ========== WEEK 1 (12-18 enero) ==========

    // 17/01 - Carrera 18:32 (session 0, fue primero)
    "log_20260117_s0": {
        date: "2026-01-17",
        sessionIndex: 0,
        weekId: "week_01",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: {
            completed: true,
            duration: "00:20:03",
            distance_km: 2.70,
            pace_avg: "7:25",
            calories: 202,
            heart_rate_avg: 151,
            cadence: 156,
            stride_length: 0.86,
            gct_balance: "49.9/50.1",
            ground_contact_time: 256,
            vo2max: 8.3
        },
        createdAt: "2026-01-17T18:32:00.000Z"
    },

    // 17/01 - Fuerza inferior 19:10 (session 1, fue después)
    "log_20260117_s1": {
        date: "2026-01-17",
        sessionIndex: 1,
        weekId: "week_01",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 30 },
        actual: {
            completed: true,
            duration: "00:27:00",
            calories: 127,
            heart_rate_avg: 115,
            heart_rate_max: 151
        },
        createdAt: "2026-01-17T19:10:00.000Z"
    },

    // 18/01 - Fuerza SUPERIOR 11:28 (CORREGIDO: era inferior en el script anterior)
    "log_20260118_s0": {
        date: "2026-01-18",
        sessionIndex: 0,
        weekId: "week_01",
        sessionType: "strength_upper",
        planned: { title: "Fuerza tren superior", type: "strength_upper", duration: 30 },
        actual: {
            completed: true,
            duration: "00:27:24",
            calories: 72,
            heart_rate_avg: 95,
            heart_rate_max: 114
        },
        createdAt: "2026-01-18T11:28:00.000Z"
    },

    // 19/01 - Fuerza inferior 19:48 (session 0, fue primero)
    "log_20260119_s0": {
        date: "2026-01-19",
        sessionIndex: 0,
        weekId: "week_01",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 10 },
        actual: {
            completed: true,
            duration: "00:08:39",
            calories: 22,
            heart_rate_avg: 96,
            heart_rate_max: 114
        },
        createdAt: "2026-01-19T19:48:00.000Z"
    },

    // 19/01 - Carrera 19:57 (session 1, fue después)
    "log_20260119_s1": {
        date: "2026-01-19",
        sessionIndex: 1,
        weekId: "week_01",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 15 },
        actual: {
            completed: true,
            duration: "00:14:48",
            distance_km: 1.99,
            pace_avg: "7:26",
            calories: 139,
            heart_rate_avg: 144,
            cadence: 155,
            stride_length: 0.86,
            gct_balance: "50.1/49.9",
            ground_contact_time: 264,
            vo2max: 8.3
        },
        createdAt: "2026-01-19T19:57:00.000Z"
    },

    // ========== WEEK 2 (19-25 enero) ==========

    // 23/01 - Fuerza inferior 17:36
    "log_20260123_s0": {
        date: "2026-01-23",
        sessionIndex: 0,
        weekId: "week_02",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 40 },
        actual: {
            completed: true,
            duration: "00:41:07",
            calories: 121,
            heart_rate_avg: 101,
            heart_rate_max: 132
        },
        createdAt: "2026-01-23T17:36:00.000Z"
    },

    // 24/01 - Carrera 09:28
    "log_20260124_s0": {
        date: "2026-01-24",
        sessionIndex: 0,
        weekId: "week_02",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: {
            completed: true,
            duration: "00:19:01",
            distance_km: 2.84,
            pace_avg: "6:41",
            calories: 223,
            heart_rate_avg: 162,
            cadence: 155,
            stride_length: 0.96,
            gct_balance: "49.6/50.4",
            ground_contact_time: 251,
            vo2max: 9.8
        },
        createdAt: "2026-01-24T09:28:00.000Z"
    },

    // 25/01 - Carrera 17:59
    "log_20260125_s0": {
        date: "2026-01-25",
        sessionIndex: 0,
        weekId: "week_02",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 30 },
        actual: {
            completed: true,
            duration: "00:30:13",
            distance_km: 4.13,
            pace_avg: "7:18",
            calories: 302,
            heart_rate_avg: 149,
            cadence: 159,
            stride_length: 0.85,
            gct_balance: "50.0/50.0",
            ground_contact_time: 268,
            vo2max: 8.7
        },
        createdAt: "2026-01-25T17:59:00.000Z"
    },

    // ========== WEEK 3 (26 enero - 1 febrero) ==========

    // 27/01 - Carrera 07:29
    "log_20260127_s0": {
        date: "2026-01-27",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 10 },
        actual: {
            completed: true,
            duration: "00:09:58",
            distance_km: 1.09,
            pace_avg: "9:08",
            calories: 70,
            heart_rate_avg: 128,
            cadence: 123,
            stride_length: 0.88,
            gct_balance: "49.8/50.2",
            ground_contact_time: 267,
            vo2max: 8.7
        },
        createdAt: "2026-01-27T07:29:00.000Z"
    },

    // 29/01 - Carrera 07:47
    "log_20260129_s0": {
        date: "2026-01-29",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 30 },
        actual: {
            completed: true,
            duration: "00:30:07",
            distance_km: 4.59,
            pace_avg: "6:33",
            calories: 228,
            heart_rate_avg: 153,
            cadence: 167,
            stride_length: 0.91,
            gct_balance: "49.9/50.1",
            ground_contact_time: 271,
            vo2max: 8.8
        },
        createdAt: "2026-01-29T07:47:00.000Z"
    },

    // 30/01 - Carrera 15:49
    "log_20260130_s0": {
        date: "2026-01-30",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 35 },
        actual: {
            completed: true,
            duration: "00:35:05",
            distance_km: 4.80,
            pace_avg: "7:18",
            calories: 270,
            heart_rate_avg: 152,
            cadence: 162,
            stride_length: 0.84,
            gct_balance: "50.9/49.1",
            ground_contact_time: 296,
            vo2max: 8.5
        },
        createdAt: "2026-01-30T15:49:00.000Z"
    },

    // 01/02 - Tirada larga 12:32
    "log_20260201_s0": {
        date: "2026-02-01",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Tirada larga", type: "running", duration: 45 },
        actual: {
            completed: true,
            duration: "00:45:10",
            distance_km: 6.31,
            pace_avg: "7:09",
            calories: 352,
            heart_rate_avg: 153,
            cadence: 164,
            stride_length: 0.84,
            gct_balance: "50.8/49.2",
            ground_contact_time: 294,
            vo2max: 8.5
        },
        createdAt: "2026-02-01T12:32:00.000Z"
    }
};

async function uploadHistoricalData() {
    try {
        console.log('=== Carga de datos historicos semanas 1-3 ===\n');

        // First, check for existing logs to avoid duplicates
        console.log('1. Verificando logs existentes...');
        const existingLogsSnapshot = await db.ref(`workoutLogs/${uid}`).once('value');
        const existingLogs = existingLogsSnapshot.val() || {};

        const existingKeys = Object.keys(existingLogs);
        const newKeys = Object.keys(historicalLogs);

        // Find which logs need to be added/updated
        const toUpdate = [];
        const toAdd = [];

        for (const key of newKeys) {
            if (existingKeys.includes(key)) {
                toUpdate.push(key);
            } else {
                toAdd.push(key);
            }
        }

        console.log(`   - Logs existentes: ${existingKeys.length}`);
        console.log(`   - Logs a actualizar: ${toUpdate.length}`);
        console.log(`   - Logs nuevos a agregar: ${toAdd.length}\n`);

        // 2. Upload/update historical logs
        console.log('2. Subiendo logs historicos...');
        let uploaded = 0;

        for (const [logId, logData] of Object.entries(historicalLogs)) {
            await db.ref(`workoutLogs/${uid}/${logId}`).set(logData);
            uploaded++;
            const tipo = logData.sessionType === 'running' ? 'Carrera' :
                        logData.sessionType === 'strength_upper' ? 'Fuerza superior' : 'Fuerza inferior';
            console.log(`   [${uploaded}/${newKeys.length}] ${logData.date} - ${tipo}`);
        }

        console.log(`\n   Total subidos: ${uploaded} logs\n`);

        // 3. Summary
        console.log('=== RESUMEN ===\n');

        // Count by type
        let runningCount = 0, strengthLowerCount = 0, strengthUpperCount = 0;
        let totalDistanceKm = 0, totalRunningMinutes = 0;

        for (const log of Object.values(historicalLogs)) {
            if (log.sessionType === 'running') {
                runningCount++;
                totalDistanceKm += log.actual.distance_km || 0;
                // Parse duration to minutes
                const parts = log.actual.duration.split(':');
                const mins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
                totalRunningMinutes += mins;
            } else if (log.sessionType === 'strength_upper') {
                strengthUpperCount++;
            } else if (log.sessionType === 'strength_lower') {
                strengthLowerCount++;
            }
        }

        console.log('Sesiones cargadas (semanas 1-3):');
        console.log(`  - Carreras: ${runningCount}`);
        console.log(`  - Fuerza inferior: ${strengthLowerCount}`);
        console.log(`  - Fuerza superior: ${strengthUpperCount}`);
        console.log(`  - Total: ${runningCount + strengthLowerCount + strengthUpperCount}\n`);

        console.log('Totales de carrera:');
        console.log(`  - Distancia: ${totalDistanceKm.toFixed(2)} km`);
        console.log(`  - Tiempo: ${Math.round(totalRunningMinutes)} minutos\n`);

        console.log('Volumen semanal esperado:');
        console.log('  - Semana 1: ~35 min (carrera 20+15 min)');
        console.log('  - Semana 2: ~49 min (carrera 19+30 min)');
        console.log('  - Semana 3: ~120 min (carrera 10+30+35+45 min)\n');

        console.log('Tirada larga por semana:');
        console.log('  - Semana 1: 20 min');
        console.log('  - Semana 2: 30 min');
        console.log('  - Semana 3: 45 min\n');

        console.log('Correccion aplicada:');
        console.log('  - 18/01 cambiado de fuerza_inferior a fuerza_superior\n');

        console.log('OK - Datos historicos cargados correctamente!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

uploadHistoricalData();
