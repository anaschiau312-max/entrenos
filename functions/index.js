/**
 * RunTracker — Cloud Function: Gemini OCR Proxy
 * Firebase Functions v2 syntax
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

// Define secret for Gemini API key
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

/**
 * analyzeWatchScreenshot
 *
 * POST body: { imageBase64: string, mimeType: string }
 * Requires Firebase Auth token in Authorization header.
 */
exports.analyzeWatchScreenshot = onRequest(
  {
    region: "europe-west1",
    secrets: [GEMINI_API_KEY],
    cors: true,
    timeoutSeconds: 120,
    memory: "512MiB",
  },
  async (req, res) => {
    console.log("=== Function called ===");
    console.log("Method:", req.method);

    if (req.method !== "POST") {
      console.log("Wrong method, returning 405");
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No Bearer token");
      res.status(401).json({ error: "No autorizado. Token requerido." });
      return;
    }

    try {
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Token verified for user:", decodedToken.uid);
    } catch (authError) {
      console.error("Token verification failed:", authError.message);
      res.status(401).json({ error: "Token inválido o expirado." });
      return;
    }

    // Get API key from secret
    const apiKey = GEMINI_API_KEY.value();
    console.log("API key present:", !!apiKey);

    if (!apiKey) {
      console.error("Gemini API key not configured");
      res.status(500).json({ error: "API key no configurada en el servidor." });
      return;
    }

    // Parse request body
    const { imageBase64, mimeType } = req.body;
    console.log("imageBase64 length:", imageBase64 ? imageBase64.length : 0);
    console.log("mimeType:", mimeType);

    if (!imageBase64 || !mimeType) {
      console.log("Missing imageBase64 or mimeType");
      res.status(400).json({ error: "Se requiere imageBase64 y mimeType." });
      return;
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = "Analiza esta captura de pantalla de un reloj deportivo OnePlus Watch 2. " +
      "Puede ser de running o ciclismo. " +
      "Extrae TODOS los datos visibles y devuélvelos en JSON con estos campos: " +
      "{distance_km, duration, pace_avg, calories, cadence_avg, steps, stride_length_m, " +
      "heart_rate_avg, heart_rate_max, elevation_m, ground_contact_balance, ground_contact_time_ms, " +
      "vertical_oscillation_cm, power_watts, speed_avg, speed_max}. " +
      "Para ciclismo: extrae calories (calorías activas), heart_rate_avg (FC media), heart_rate_max (FC máxima/Mayor). " +
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
      console.log("Calling Gemini API...");
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      console.log("Gemini response status:", response.status);

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
      console.log("Gemini response received");

      // Extract text from Gemini response
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.log("Empty response from Gemini");
        res.status(502).json({ error: "Respuesta vacía de Gemini." });
        return;
      }

      console.log("Raw text from Gemini:", rawText.substring(0, 200));

      // Clean response — remove ```json ... ``` wrappers
      let cleanText = rawText.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      // Parse JSON
      let extractedData;
      try {
        extractedData = JSON.parse(cleanText);
        console.log("Parsed data:", JSON.stringify(extractedData));
      } catch (parseErr) {
        console.error("Failed to parse Gemini response:", cleanText);
        res.status(502).json({
          error: "No se pudo parsear la respuesta de Gemini.",
          rawText: cleanText,
        });
        return;
      }

      console.log("Sending success response");
      res.status(200).json({
        success: true,
        data: extractedData,
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      res.status(500).json({ error: "Error de conexión con Gemini API." });
    }
  }
);
