// OCR Module — Watch screenshot analysis via Gemini 2.0 Flash
// Uses Firebase Cloud Function as proxy (API key never in frontend)

const OCR = {

    // Cloud Function URL (europe-west1 region)
    functionUrl: 'https://europe-west1-entrenos-45561.cloudfunctions.net/analyzeWatchScreenshot',

    /**
     * Upload screenshot to Firebase Storage
     * @param {File} file - Image file from input
     * @returns {string} Download URL of uploaded image
     */
    async uploadScreenshot(file) {
        const uid = window.currentUser.uid;
        const date = Utils.formatDate(new Date());
        const timestamp = Date.now();
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `screenshots/${uid}/${date}_${timestamp}.${ext}`;

        const storageRef = storage.ref(path);
        const snapshot = await storageRef.put(file);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        return downloadUrl;
    },

    /**
     * Extract data from image using Gemini 2.0 Flash via Cloud Function
     * @param {string} imageBase64 - Base64 encoded image data (without prefix)
     * @param {string} mimeType - Image MIME type (e.g., "image/jpeg")
     * @returns {Object} Extracted data fields
     */
    async extractDataFromImage(imageBase64, mimeType) {
        // Get Firebase Auth token for the request
        const idToken = await auth.currentUser.getIdToken();

        const response = await fetch(this.functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ imageBase64, mimeType })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success || !result.data) {
            throw new Error('No se pudieron extraer datos de la imagen.');
        }

        return result.data;
    },

    /**
     * Resize image if larger than maxSize (default 2MB)
     * @param {File} file - Original image file
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {Promise<{base64: string, mimeType: string}>}
     */
    async resizeImage(file, maxWidth = 1200) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Check if resize is needed (file > 2MB or width > maxWidth)
                    if (file.size <= 2 * 1024 * 1024 && img.width <= maxWidth) {
                        // No resize needed — return original as base64
                        const base64 = e.target.result.split(',')[1];
                        resolve({ base64, mimeType: file.type || 'image/jpeg' });
                        return;
                    }

                    // Resize using canvas
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to JPEG for smaller size
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    const base64 = dataUrl.split(',')[1];
                    resolve({ base64, mimeType: 'image/jpeg' });
                };
                img.onerror = () => reject(new Error('Error al cargar la imagen.'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo.'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Get base64 from file without resizing
     * @param {File} file
     * @returns {Promise<{base64: string, mimeType: string}>}
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                resolve({ base64, mimeType: file.type || 'image/jpeg' });
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo.'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Map Gemini extracted data to form field IDs
     * Returns array of {fieldId, value, label} for fields that have data
     */
    mapDataToFields(data) {
        const mappings = [];

        if (data.distance_km != null) {
            mappings.push({ fieldId: 'wl-distance', value: data.distance_km, label: 'Distancia' });
        }

        if (data.duration) {
            // Parse duration — could be "HH:MM:SS" or "MM:SS" or "45:30"
            const parts = String(data.duration).split(':');
            if (parts.length === 3) {
                mappings.push({ fieldId: 'wl-dur-h', value: parseInt(parts[0]) || 0, label: 'Horas' });
                mappings.push({ fieldId: 'wl-dur-m', value: parseInt(parts[1]) || 0, label: 'Minutos' });
                mappings.push({ fieldId: 'wl-dur-s', value: parseInt(parts[2]) || 0, label: 'Segundos' });
            } else if (parts.length === 2) {
                mappings.push({ fieldId: 'wl-dur-h', value: 0, label: 'Horas' });
                mappings.push({ fieldId: 'wl-dur-m', value: parseInt(parts[0]) || 0, label: 'Minutos' });
                mappings.push({ fieldId: 'wl-dur-s', value: parseInt(parts[1]) || 0, label: 'Segundos' });
            }
        }

        if (data.pace_avg) {
            mappings.push({ fieldId: 'wl-pace', value: data.pace_avg, label: 'Ritmo medio' });
        }

        if (data.heart_rate_avg != null) {
            mappings.push({ fieldId: 'wl-hr', value: data.heart_rate_avg, label: 'FC media' });
        }

        if (data.cadence_avg != null) {
            mappings.push({ fieldId: 'wl-cadence', value: data.cadence_avg, label: 'Cadencia' });
        }

        if (data.steps != null) {
            mappings.push({ fieldId: 'wl-steps', value: data.steps, label: 'Pasos' });
        }

        if (data.stride_length_m != null) {
            mappings.push({ fieldId: 'wl-stride', value: data.stride_length_m, label: 'Longitud paso' });
        }

        if (data.elevation_m != null) {
            mappings.push({ fieldId: 'wl-elevation', value: data.elevation_m, label: 'Ascenso' });
        }

        if (data.power_watts != null) {
            mappings.push({ fieldId: 'wl-power', value: data.power_watts, label: 'Potencia' });
        }

        // Advanced fields
        if (data.ground_contact_balance) {
            mappings.push({ fieldId: 'wl-gct-balance', value: data.ground_contact_balance, label: 'Eq. contacto suelo' });
        }

        if (data.ground_contact_time_ms != null) {
            mappings.push({ fieldId: 'wl-gct', value: data.ground_contact_time_ms, label: 'T. contacto suelo' });
        }

        if (data.vertical_oscillation_cm != null) {
            // Map to VO2max field if no specific field — or just store in notes
            // For now we skip this as there's no direct field
        }

        return mappings;
    }
};
