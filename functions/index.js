/**
 * RunTracker — Cloud Function: Gemini OCR Proxy
 *
 * Recibe una imagen en base64 desde el frontend y la envía a la API
 * de Google Gemini 2.0 Flash para extraer datos del reloj deportivo.
 * La API key se almacena en variables de entorno de Firebase Functions,
 * nunca se expone en el frontend.
 *
 * SETUP:
 * 1. Obtén tu API key gratis en: https://aistudio.google.com/apikey
 * 2. Configura la key en Firebase:
 *    firebase functions:config:set gemini.apikey="TU_API_KEY_AQUI"
 * 3. Deploy:
 *    firebase deploy --only functions
 *
 * NOTA: Si usas Firebase Functions v2 (Gen 2), puedes usar variables
 * de entorno con defineString(). Esta versión usa functions.config()
 * compatible con v1/v2.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// CORS headers
const ALLOWED_ORIGINS = [
  "https://entrenos-45561.web.app",
  "https://entrenos-45561.firebaseapp.com",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://127.0.0.1:5000",
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
}

/**
 * analyzeWatchScreenshot
 *
 * POST body: { imageBase64: string, mimeType: string }
 * Requires Firebase Auth token in Authorization header.
 */
exports.analyzeWatchScreenshot = functions
  .region("europe-west1")
  .https.onRequest(async (req, res) => {
    // Handle CORS preflight
    setCorsHeaders(req, res);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No autorizado. Token requerido." });
      return;
    }

    try {
      const idToken = authHeader.split("Bearer ")[1];
      await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      res.status(401).json({ error: "Token inválido o expirado." });
      return;
    }

    // Get API key from config
    const apiKey = functions.config().gemini?.apikey;
    if (!apiKey) {
      console.error("Gemini API key not configured. Run: firebase functions:config:set gemini.apikey=\"YOUR_KEY\"");
      res.status(500).json({ error: "API key no configurada en el servidor." });
      return;
    }

    // Parse request body
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: "Se requiere imageBase64 y mimeType." });
      return;
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = "Analiza esta captura de pantalla de un reloj deportivo OnePlus Watch 2. " +
      "Extrae TODOS los datos visibles y devuélvelos en JSON con estos campos: " +
      "{distance_km, duration, pace_avg, calories, cadence_avg, steps, stride_length_m, " +
      "heart_rate_avg, elevation_m, ground_contact_balance, ground_contact_time_ms, " +
      "vertical_oscillation_cm, power_watts}. " +
      "Si un campo no es visible en la imagen, usa null. " +
      "Devuelve SOLO el JSON sin texto adicional ni markdown.";

    const geminiBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      }],
    };

    try {
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        res.status(502).json({
          error: `Error de Gemini API: ${response.status}`,
          details: errorText,
        });
        return;
      }

      const geminiData = await response.json();

      // Extract text from Gemini response
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        res.status(502).json({ error: "Respuesta vacía de Gemini." });
        return;
      }

      // Clean response — remove ```json ... ``` wrappers
      let cleanText = rawText.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      // Parse JSON
      let extractedData;
      try {
        extractedData = JSON.parse(cleanText);
      } catch (parseErr) {
        console.error("Failed to parse Gemini response:", cleanText);
        res.status(502).json({
          error: "No se pudo parsear la respuesta de Gemini.",
          rawText: cleanText,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: extractedData,
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      res.status(500).json({ error: "Error de conexión con Gemini API." });
    }
  });
