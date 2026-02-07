#!/usr/bin/env node

/**
 * Analiza capturas de entrenamientos con Gemini Vision
 * y guarda los datos en Firebase
 * 
 * Uso: node analyze-training.js <ruta-imagen> [fecha-sesion]
 * Ejemplo: node analyze-training.js "./captura.jpg" "2026-02-04"
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Inicializar Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app'
});
const db = admin.database();

// Prompt para Gemini
const EXTRACTION_PROMPT = `Analiza esta captura de entrenamiento de running y extrae TODOS los datos visibles.

Devuelve SOLO un JSON válido con este formato exacto (usa null si no encuentras algún dato):

{
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM",
  "tipo": "carrera/caminata/etc",
  "distancia_km": 0.00,
  "duracion": "HH:MM:SS",
  "ritmo_medio": "M'SS\\"",
  "calorias": 0,
  "fc_media": 0,
  "fc_maxima": 0,
  "cadencia": 0,
  "pasos": 0,
  "longitud_paso_m": 0.00,
  "ascenso_m": 0,
  "descenso_m": 0,
  "potencia_w": 0,
  "oscilacion_vertical_cm": 0.0,
  "tiempo_contacto_suelo_ms": 0,
  "equilibrio_contacto": "00.0%/00.0%",
  "dispositivo": "nombre del reloj/dispositivo"
}

IMPORTANTE: Solo devuelve el JSON, sin explicaciones ni markdown.`;

async function analyzeImage(imagePath) {
    console.log(`\nAnalizando imagen: ${imagePath}\n`);
    
    // Leer imagen
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    // Llamar a Gemini Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent([
        EXTRACTION_PROMPT,
        {
            inlineData: {
                mimeType: mimeType,
                data: base64Image
            }
        }
    ]);
    
    const response = await result.response;
    const text = response.text().trim();
    
    // Parsear JSON
    try {
        // Limpiar posibles marcadores de código
        let jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(jsonStr);
        return data;
    } catch (e) {
        console.error('Error parseando respuesta de Gemini:', text);
        throw new Error('No se pudo parsear la respuesta de Gemini');
    }
}

async function findSessionInPlan(fecha) {
    // Buscar la sesión correspondiente a esta fecha en el plan
    const snapshot = await db.ref('plan/weeks').once('value');
    const weeks = snapshot.val();
    
    for (const [weekId, week] of Object.entries(weeks)) {
        if (week.days && week.days[fecha]) {
            const day = week.days[fecha];
            if (day.sessions && day.sessions.length > 0) {
                return { weekId, fecha, day, sessionIndex: 0 };
            }
        }
    }
    return null;
}

async function saveTrainingResult(extractedData, sessionDate) {
    const fecha = sessionDate || extractedData.fecha;
    
    console.log('Datos extraídos:');
    console.log('─'.repeat(40));
    console.log(`  Fecha: ${fecha} ${extractedData.hora || ''}`);
    console.log(`  Distancia: ${extractedData.distancia_km} km`);
    console.log(`  Duración: ${extractedData.duracion}`);
    console.log(`  Ritmo medio: ${extractedData.ritmo_medio}`);
    console.log(`  FC media: ${extractedData.fc_media} lpm`);
    console.log(`  Cadencia: ${extractedData.cadencia} ppm`);
    console.log(`  Calorías: ${extractedData.calorias} kcal`);
    if (extractedData.potencia_w) console.log(`  Potencia: ${extractedData.potencia_w} W`);
    if (extractedData.ascenso_m) console.log(`  Ascenso: ${extractedData.ascenso_m} m`);
    console.log('─'.repeat(40));
    
    // Buscar sesión en el plan
    const sessionInfo = await findSessionInPlan(fecha);
    
    // Crear objeto de resultado
    const trainingResult = {
        fecha: fecha,
        hora: extractedData.hora,
        dispositivo: extractedData.dispositivo,
        importadoEn: new Date().toISOString(),
        metricas: {
            distancia_km: extractedData.distancia_km,
            duracion: extractedData.duracion,
            ritmo_medio: extractedData.ritmo_medio,
            calorias: extractedData.calorias,
            fc_media: extractedData.fc_media,
            fc_maxima: extractedData.fc_maxima,
            cadencia: extractedData.cadencia,
            pasos: extractedData.pasos,
            longitud_paso_m: extractedData.longitud_paso_m,
            ascenso_m: extractedData.ascenso_m,
            descenso_m: extractedData.descenso_m,
            potencia_w: extractedData.potencia_w,
            oscilacion_vertical_cm: extractedData.oscilacion_vertical_cm,
            tiempo_contacto_suelo_ms: extractedData.tiempo_contacto_suelo_ms,
            equilibrio_contacto: extractedData.equilibrio_contacto
        }
    };
    
    // Guardar en Firebase
    if (sessionInfo) {
        // Actualizar sesión existente en el plan
        const sessionPath = `plan/weeks/${sessionInfo.weekId}/days/${fecha}/sessions/0`;
        await db.ref(sessionPath).update({
            completed: true,
            resultado: trainingResult
        });
        console.log(`\n✓ Sesión actualizada en ${sessionInfo.weekId} (${fecha})`);
    } else {
        // Guardar como entrenamiento independiente
        const ref = await db.ref('entrenamientos').push(trainingResult);
        console.log(`\n✓ Entrenamiento guardado con ID: ${ref.key}`);
    }
    
    return trainingResult;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Uso: node analyze-training.js <ruta-imagen> [fecha-YYYY-MM-DD]');
        console.log('Ejemplo: node analyze-training.js "./captura.jpg" "2026-02-04"');
        process.exit(1);
    }
    
    const imagePath = args[0];
    const sessionDate = args[1] || null;
    
    if (!fs.existsSync(imagePath)) {
        console.error(`Error: No se encuentra la imagen: ${imagePath}`);
        process.exit(1);
    }
    
    try {
        const extractedData = await analyzeImage(imagePath);
        await saveTrainingResult(extractedData, sessionDate);
        console.log('\n¡Análisis completado!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
    
    process.exit(0);
}

main();
