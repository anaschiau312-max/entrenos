# RunTracker - Media Maratón

PWA para gestionar un plan de entrenamiento de media maratón.

## Stack

- HTML5 + CSS3 + JavaScript vanilla
- Firebase (Auth, Realtime Database, Hosting, Storage)
- Google Gemini 2.0 Flash (OCR capturas reloj)
- Chart.js (gráficas)
- PWA con Service Worker

## Estructura

```
public/
├── index.html          # Login
├── app.html            # App principal (SPA)
├── css/styles.css      # Estilos (tema oscuro deportivo)
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── router.js
│   ├── db.js
│   ├── offline.js
│   ├── ocr.js
│   ├── stats.js
│   ├── utils.js
│   └── views/
│       ├── dashboard.js
│       ├── weekly.js
│       ├── calendar.js
│       ├── workout-log.js
│       ├── exercises.js
│       ├── stats-view.js
│       ├── settings.js
│       └── edit-plan.js
├── img/
│   ├── exercises/
│   └── icons/
├── manifest.json
└── sw.js
```

## Deploy

```bash
firebase login
firebase deploy
```
