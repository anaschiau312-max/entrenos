const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();
const uid = 'P6x4IIyFOYa6CPKK5RKJzErokUH2';

// Historical workout logs with complete data
const historicalLogs = {
    // WEEK 1 (12-18 enero)
    "log_20260117_s0": {
        date: "2026-01-17",
        sessionIndex: 0,
        weekId: "week_01",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 30 },
        actual: { completed: true, duration: "00:27:13", calories: 127 },
        createdAt: "2026-01-17T18:00:00.000Z"
    },
    "log_20260117_s1": {
        date: "2026-01-17",
        sessionIndex: 1,
        weekId: "week_01",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: { completed: true, duration: "00:20:03", distance_km: 2.70, pace_avg: "7:25", calories: 202 },
        createdAt: "2026-01-17T19:00:00.000Z"
    },
    "log_20260118": {
        date: "2026-01-18",
        sessionIndex: 0,
        weekId: "week_01",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 30 },
        actual: { completed: true, duration: "00:27:24", calories: 72 },
        createdAt: "2026-01-18T18:00:00.000Z"
    },
    "log_20260119_s0": {
        date: "2026-01-19",
        sessionIndex: 0,
        weekId: "week_01",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 10 },
        actual: { completed: true, duration: "00:08:39", calories: 22 },
        createdAt: "2026-01-19T10:00:00.000Z"
    },
    "log_20260119_s1": {
        date: "2026-01-19",
        sessionIndex: 1,
        weekId: "week_01",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 15 },
        actual: { completed: true, duration: "00:14:48", distance_km: 1.99, pace_avg: "7:26", calories: 139 },
        createdAt: "2026-01-19T11:00:00.000Z"
    },

    // WEEK 2 (19-25 enero)
    "log_20260123": {
        date: "2026-01-23",
        sessionIndex: 0,
        weekId: "week_02",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 40 },
        actual: { completed: true, duration: "00:41:07", calories: 121 },
        createdAt: "2026-01-23T18:00:00.000Z"
    },
    "log_20260124": {
        date: "2026-01-24",
        sessionIndex: 0,
        weekId: "week_02",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: { completed: true, duration: "00:19:01", distance_km: 2.84, pace_avg: "6:41", calories: 223 },
        createdAt: "2026-01-24T18:00:00.000Z"
    },
    "log_20260125": {
        date: "2026-01-25",
        sessionIndex: 0,
        weekId: "week_02",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 30 },
        actual: { completed: true, duration: "00:30:13", distance_km: 4.13, pace_avg: "7:18", calories: 302 },
        createdAt: "2026-01-25T10:00:00.000Z"
    },

    // WEEK 3 (26 enero - 1 febrero)
    "log_20260127": {
        date: "2026-01-27",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 10 },
        actual: { completed: true, duration: "00:09:58", distance_km: 1.09, pace_avg: "9:08", calories: 70 },
        createdAt: "2026-01-27T18:00:00.000Z"
    },
    "log_20260129": {
        date: "2026-01-29",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 30 },
        actual: { completed: true, duration: "00:30:07", distance_km: 4.59, pace_avg: "6:33", calories: 228 },
        createdAt: "2026-01-29T18:00:00.000Z"
    },
    "log_20260130": {
        date: "2026-01-30",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 35 },
        actual: { completed: true, duration: "00:35:05", distance_km: 4.80, pace_avg: "7:18", calories: 270 },
        createdAt: "2026-01-30T18:00:00.000Z"
    },
    "log_20260201": {
        date: "2026-02-01",
        sessionIndex: 0,
        weekId: "week_03",
        sessionType: "running",
        planned: { title: "Tirada larga", type: "running", duration: 45 },
        actual: { completed: true, duration: "00:45:10", distance_km: 6.31, pace_avg: "7:09", calories: 352 },
        createdAt: "2026-02-01T10:00:00.000Z"
    },

    // WEEK 4 (2-8 febrero) - Episodio dolor rodilla
    "log_20260204": {
        date: "2026-02-04",
        sessionIndex: 0,
        weekId: "week_04",
        sessionType: "running",
        planned: { title: "Carrera exterior", type: "running", duration: 20 },
        actual: { completed: true, duration: "00:11:35", distance_km: 1.72, pace_avg: "6:44", calories: 79 },
        notes: "Episodio dolor rodilla",
        createdAt: "2026-02-04T18:00:00.000Z"
    },
    "log_20260206": {
        date: "2026-02-06",
        sessionIndex: 0,
        weekId: "week_04",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: { completed: true, duration: "00:20:03", distance_km: 2.85, pace_avg: "7:02", calories: 152 },
        createdAt: "2026-02-06T18:00:00.000Z"
    },
    "log_20260208": {
        date: "2026-02-08",
        sessionIndex: 0,
        weekId: "week_04",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: {
            completed: true,
            duration: "00:20:13",
            distance_km: 2.73,
            pace_avg: "7:24",
            calories: 139,
            heart_rate_avg: 142,
            cadence: 168,
            stride_length: 0.80,
            ground_contact_balance: "50.9/49.1",
            ground_contact_time: 297,
            vertical_oscillation: 7.8
        },
        createdAt: "2026-02-08T10:00:00.000Z"
    },

    // WEEK 5 (9-15 febrero) - Reevaluación post-dolor
    "log_20260210": {
        date: "2026-02-10",
        sessionIndex: 0,
        weekId: "week_05",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 20 },
        actual: {
            completed: true,
            duration: "00:20:15",
            distance_km: 2.72,
            pace_avg: "7:26",
            calories: 147,
            heart_rate_avg: 147,
            cadence: 167,
            stride_length: 0.80,
            ground_contact_balance: "51.0/49.0",
            ground_contact_time: 298,
            vertical_oscillation: 8.0
        },
        notes: "Reevaluación post-dolor",
        createdAt: "2026-02-10T18:00:00.000Z"
    },
    "log_20260213_s0": {
        date: "2026-02-13",
        sessionIndex: 0,
        weekId: "week_05",
        sessionType: "running",
        planned: { title: "Carrera interior", type: "running", duration: 25 },
        actual: {
            completed: true,
            duration: "00:25:12",
            distance_km: 3.40,
            pace_avg: "7:24",
            calories: 193,
            heart_rate_avg: 151,
            cadence: 166,
            stride_length: 0.81,
            ground_contact_balance: "50.9/49.1",
            ground_contact_time: 292,
            vertical_oscillation: 8.2
        },
        createdAt: "2026-02-13T14:00:00.000Z"
    },
    "log_20260213_s1": {
        date: "2026-02-13",
        sessionIndex: 1,
        weekId: "week_05",
        sessionType: "strength_lower",
        planned: { title: "Fuerza tren inferior", type: "strength_lower", duration: 35 },
        actual: { completed: true, duration: "00:35:00" },
        createdAt: "2026-02-13T15:00:00.000Z"
    },
    "log_20260215": {
        date: "2026-02-15",
        sessionIndex: 0,
        weekId: "week_05",
        sessionType: "running",
        planned: { title: "Tirada larga", type: "running", duration: 40 },
        actual: {
            completed: true,
            duration: "00:40:07",
            distance_km: 5.56,
            pace_avg: "7:12",
            calories: 335,
            heart_rate_avg: 160,
            cadence: 166,
            stride_length: 0.83,
            ground_contact_balance: "50.3/49.7",
            ground_contact_time: 281,
            vertical_oscillation: 8.6
        },
        createdAt: "2026-02-15T10:00:00.000Z"
    }
};

// Plan projections - corrected values
const planProjections = {
    totalWeeks: 17,
    raceDate: "2026-05-10",
    projectedTotals: {
        runningSessions: 57,
        strengthLowerSessions: 30,
        strengthUpperSessions: 12,
        totalSessions: 99,
        runningTimeMinutes: 2760,
        runningDistanceKm: 370
    },
    weeklyProjections: {
        "week_01": { phase: "inicio", runningSessions: 2, strengthLower: 3, strengthUpper: 0, longRunMin: 20, volumeMin: 35 },
        "week_02": { phase: "inicio", runningSessions: 2, strengthLower: 1, strengthUpper: 0, longRunMin: 30, volumeMin: 49 },
        "week_03": { phase: "inicio", runningSessions: 4, strengthLower: 0, strengthUpper: 0, longRunMin: 45, volumeMin: 120 },
        "week_04": { phase: "base", runningSessions: 3, strengthLower: 0, strengthUpper: 0, longRunMin: 20, volumeMin: 52 },
        "week_05": { phase: "base", runningSessions: 3, strengthLower: 1, strengthUpper: 0, longRunMin: 40, volumeMin: 86 },
        "week_06": { phase: "base", runningSessions: 4, strengthLower: 1, strengthUpper: 1, longRunMin: 50, volumeMin: 135 },
        "week_07": { phase: "base", runningSessions: 4, strengthLower: 1, strengthUpper: 1, longRunMin: 55, volumeMin: 145 },
        "week_08": { phase: "descarga", runningSessions: 3, strengthLower: 1, strengthUpper: 1, longRunMin: 40, volumeMin: 100 },
        "week_09": { phase: "base", runningSessions: 4, strengthLower: 2, strengthUpper: 1, longRunMin: 60, volumeMin: 155 },
        "week_10": { phase: "base", runningSessions: 4, strengthLower: 2, strengthUpper: 1, longRunMin: 67, volumeMin: 165 },
        "week_11": { phase: "descarga", runningSessions: 3, strengthLower: 1, strengthUpper: 1, longRunMin: 50, volumeMin: 110 },
        "week_12": { phase: "desarrollo", runningSessions: 4, strengthLower: 2, strengthUpper: 1, longRunMin: 75, volumeMin: 175 },
        "week_13": { phase: "desarrollo", runningSessions: 4, strengthLower: 2, strengthUpper: 1, longRunMin: 85, volumeMin: 190 },
        "week_14": { phase: "especifica", runningSessions: 4, strengthLower: 2, strengthUpper: 1, longRunMin: 92, volumeMin: 195 },
        "week_15": { phase: "taper", runningSessions: 3, strengthLower: 1, strengthUpper: 1, longRunMin: 70, volumeMin: 130 },
        "week_16": { phase: "taper", runningSessions: 3, strengthLower: 1, strengthUpper: 0, longRunMin: 45, volumeMin: 100 },
        "week_17": { phase: "carrera", runningSessions: 3, strengthLower: 1, strengthUpper: 0, longRunMin: 0, volumeMin: 50 }
    }
};

// Phases with weeks
const phases = {
    inicio: { name: 'INICIO', color: '#9c88ff', weeks: [1, 2, 3] },
    base: { name: 'BASE', color: '#4CAF50', weeks: [4, 5, 6, 7, 9, 10] },
    descarga: { name: 'DESCARGA', color: '#FF9800', weeks: [8, 11] },
    desarrollo: { name: 'DESARROLLO', color: '#2196F3', weeks: [12, 13] },
    especifica: { name: 'ESPECÍFICA', color: '#e94560', weeks: [14] },
    taper: { name: 'TAPER', color: '#9C27B0', weeks: [15, 16] },
    carrera: { name: 'CARRERA', color: '#FFD700', weeks: [17] }
};

async function uploadAll() {
    try {
        console.log('Subiendo datos completos...\n');

        // 1. Upload historical workout logs
        console.log('1. Subiendo logs de entrenamientos...');
        for (const [logId, logData] of Object.entries(historicalLogs)) {
            await db.ref(`workoutLogs/${uid}/${logId}`).set(logData);
        }
        console.log(`   ${Object.keys(historicalLogs).length} logs subidos\n`);

        // 2. Upload plan projections
        console.log('2. Subiendo proyecciones del plan...');
        await db.ref('plan/projections').set(planProjections);
        console.log('   Proyecciones subidas\n');

        // 3. Upload phases
        console.log('3. Subiendo fases...');
        await db.ref('phases').set(phases);
        console.log('   Fases subidas\n');

        console.log('✅ Todo subido correctamente!');
        console.log('\nResumen:');
        console.log('- 19 sesiones históricas (semanas 1-5)');
        console.log('- Proyecciones para 17 semanas');
        console.log('- 7 fases del plan');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

uploadAll();
