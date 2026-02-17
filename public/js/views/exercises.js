// Exercises View — Exercise library with categorized tabs

const ExercisesView = {

    state: {
        allExercises: null,
        activeTab: 'tren_inferior',
        warmupView: 'selection',
        selectedWarmup: null,
        cooldownView: 'selection',
        selectedCooldown: null,
        mobilityView: 'selection',
        mobilityMode: null
    },

    categories: [
        { key: 'tren_inferior', icon: '🦵', label: 'Tren Inferior' },
        { key: 'tren_superior', icon: '💪', label: 'Tren Superior' },
        { key: 'pliometria', icon: '⚡', label: 'Pliometría' },
        { key: 'calentamiento', icon: '🔥', label: 'Calentamiento' },
        { key: 'vuelta_calma', icon: '🧘', label: 'Vuelta a la calma' },
        { key: 'movilidad', icon: '🤸', label: 'Movilidad' },
        { key: 'tecnica_respiracion', icon: '🧠', label: 'Técnica y Respiración' }
    ],

    warmupRoutines: {
            "carrera_corta": {
                    "id": "carrera_corta",
                    "icon": "🏃‍♀️",
                    "title": "Carrera corta",
                    "subtitle": "≤35 min",
                    "duration": "8-10 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Caminata activa",
                                    "reps": "1 min",
                                    "tips": "Caminar rapido, brazos activos, talon-punta marcado"
                            },
                            {
                                    "order": 2,
                                    "name": "Sentadilla controlada",
                                    "reps": "10 reps",
                                    "tips": "Bajada 3 segundos. Rodillas alineadas con segundo dedo. Espalda neutra"
                            },
                            {
                                    "order": 3,
                                    "name": "Monster Walks con banda",
                                    "reps": "2 rondas: 10 adelante + 10 atras + 10 laterales/lado",
                                    "tips": "Banda encima de rodillas. Mini-sentadilla constante"
                            },
                            {
                                    "order": 4,
                                    "name": "Zancadas alternas",
                                    "reps": "8 por pierna",
                                    "tips": "Paso largo. Rodilla estable. Ligera inclinacion del tronco"
                            },
                            {
                                    "order": 5,
                                    "name": "Elevaciones de talon (soleo)",
                                    "reps": "15 reps",
                                    "tips": "Rodillas ligeramente flexionadas. Subida y bajada lentas"
                            },
                            {
                                    "order": 6,
                                    "name": "Sentadilla unilateral suave",
                                    "reps": "5 por pierna",
                                    "tips": "Rango pequeno. Foco en que la rodilla no colapse hacia dentro"
                            }
                    ]
            },
            "carrera_larga": {
                    "id": "carrera_larga",
                    "icon": "🏃‍♀️",
                    "title": "Carrera larga",
                    "subtitle": "≥40 min",
                    "duration": "12-15 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Caminata activa",
                                    "reps": "2 min",
                                    "tips": "Caminar rapido, brazos activos. Mas tiempo para activar progresivamente"
                            },
                            {
                                    "order": 2,
                                    "name": "Sentadilla controlada",
                                    "reps": "12 reps",
                                    "tips": "Bajada 3 segundos. Rodillas alineadas con segundo dedo. Espalda neutra"
                            },
                            {
                                    "order": 3,
                                    "name": "Monster Walks con banda",
                                    "reps": "3 rondas: 10 adelante + 10 atras + 10 laterales/lado",
                                    "tips": "Banda encima de rodillas. Mini-sentadilla constante. Una ronda extra para mayor activacion"
                            },
                            {
                                    "order": 4,
                                    "name": "Zancadas alternas",
                                    "reps": "10 por pierna",
                                    "tips": "Paso largo. Rodilla estable. Ligera inclinacion del tronco"
                            },
                            {
                                    "order": 5,
                                    "name": "Zancada con rotacion de tronco",
                                    "reps": "6 por pierna",
                                    "tips": "Zancada adelante + rotar tronco hacia pierna delantera"
                            },
                            {
                                    "order": 6,
                                    "name": "Elevaciones de talon (soleo)",
                                    "reps": "2x15 reps",
                                    "tips": "Rodillas ligeramente flexionadas. Subida y bajada lentas"
                            },
                            {
                                    "order": 7,
                                    "name": "Sentadilla unilateral suave",
                                    "reps": "6 por pierna",
                                    "tips": "Rango pequeno. Foco en que la rodilla no colapse hacia dentro"
                            },
                            {
                                    "order": 8,
                                    "name": "Trote suave progresivo",
                                    "reps": "2 min",
                                    "tips": "Empezar muy despacio e ir subiendo ritmo gradualmente"
                            }
                    ]
            },
            "fuerza_superior": {
                    "id": "fuerza_superior",
                    "icon": "💪",
                    "title": "Fuerza tren superior",
                    "subtitle": "Press, remo, etc.",
                    "duration": "5 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Circunduccion de hombros",
                                    "reps": "10+10",
                                    "tips": "Rango amplio, sin peso. Soltar articulacion"
                            },
                            {
                                    "order": 2,
                                    "name": "Rotacion toracica en cuadrupedia",
                                    "reps": "8 por lado",
                                    "tips": "Mano detras de la nuca, rotar abriendo codo al techo"
                            },
                            {
                                    "order": 3,
                                    "name": "Dislocaciones de hombro",
                                    "reps": "10 reps",
                                    "tips": "Agarre amplio. Movimiento lento"
                            },
                            {
                                    "order": 4,
                                    "name": "Pasada ligera del primer ejercicio",
                                    "reps": "12 reps",
                                    "tips": "Con peso ligero para preparar patron motor"
                            },
                            {
                                    "order": 5,
                                    "name": "Activacion escapular",
                                    "reps": "10 reps",
                                    "tips": "Separar y juntar escapulas de forma controlada"
                            }
                    ]
            },
            "fuerza_inferior": {
                    "id": "fuerza_inferior",
                    "icon": "🦵",
                    "title": "Fuerza tren inferior",
                    "subtitle": "Sentadilla, peso muerto, etc.",
                    "duration": "8-10 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Caminata activa",
                                    "reps": "1 min",
                                    "tips": "Caminar rapido para subir temperatura"
                            },
                            {
                                    "order": 2,
                                    "name": "Sentadilla controlada",
                                    "reps": "10 reps",
                                    "tips": "Bajada 3 segundos. Rodillas alineadas. Espalda neutra"
                            },
                            {
                                    "order": 3,
                                    "name": "Clamshell con banda",
                                    "reps": "15 por lado",
                                    "tips": "Activar gluteo medio ANTES de la sesion de fuerza"
                            },
                            {
                                    "order": 4,
                                    "name": "Monster Walks con banda",
                                    "reps": "2 rondas",
                                    "tips": "Banda encima de rodillas. Mini-sentadilla constante"
                            },
                            {
                                    "order": 5,
                                    "name": "Peso muerto rumano sin peso",
                                    "reps": "8 reps",
                                    "tips": "Patron de bisagra de cadera"
                            },
                            {
                                    "order": 6,
                                    "name": "Elevaciones de talon",
                                    "reps": "10 reps",
                                    "tips": "Preparar soleo y gemelo"
                            },
                            {
                                    "order": 7,
                                    "name": "Sentadilla unilateral suave",
                                    "reps": "5 por pierna",
                                    "tips": "Test de control de rodilla antes de meter carga"
                            }
                    ]
            }
    },

    cooldownRoutines: {
            "post_carrera_corta": {
                    "id": "post_carrera_corta",
                    "icon": "🏃‍♀️",
                    "title": "Post carrera corta",
                    "subtitle": "≤35 min",
                    "duration": "6-8 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Cuádriceps suave",
                                    "reps": "30\" por pierna",
                                    "tips": "De pie, talón hacia glúteo. Rodillas juntas. No arquear zona lumbar. Si tira demasiado, hacerlo tumbada de lado"
                            },
                            {
                                    "order": 2,
                                    "name": "Glúteo / piriforme (Figura 4)",
                                    "reps": "30\" por lado",
                                    "tips": "Tumbada boca arriba. Tirar suave hacia el pecho. Debe sentirse en el glúteo, no en la rodilla"
                            },
                            {
                                    "order": 3,
                                    "name": "Isquiotibiales",
                                    "reps": "30\" por pierna",
                                    "tips": "Pierna extendida en banco o escalón. Espalda recta. Inclinar desde cadera. No rebotar"
                            },
                            {
                                    "order": 4,
                                    "name": "Flexor de cadera",
                                    "reps": "30\" por pierna",
                                    "tips": "Zancada baja, rodilla trasera al suelo. Pelvis neutra, no arquear lumbar. Apretar glúteo del lado que estiras"
                            },
                            {
                                    "order": 5,
                                    "name": "Sóleo",
                                    "reps": "30\" por pierna",
                                    "tips": "Apoyo contra pared. Rodilla ligeramente flexionada. Talón pegado al suelo. Muy importante para proteger tendón de Aquiles"
                            },
                            {
                                    "order": 6,
                                    "name": "Gemelo",
                                    "reps": "30\" por pierna",
                                    "tips": "Misma posición contra pared pero rodilla estirada"
                            },
                            {
                                    "order": 7,
                                    "name": "Movilidad de cadera",
                                    "reps": "5 reps por lado",
                                    "tips": "Zancada profunda dinámica: bajar, mover ligeramente hacia delante. Sin dolor"
                            }
                    ]
            },
            "post_carrera_larga": {
                    "id": "post_carrera_larga",
                    "icon": "🏃‍♀️",
                    "title": "Post carrera larga",
                    "subtitle": "≥40 min",
                    "duration": "12-15 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Caminata de vuelta a la calma",
                                    "reps": "2-3 min",
                                    "tips": "Caminar suave para bajar pulsaciones gradualmente. No parar en seco después de la tirada"
                            },
                            {
                                    "order": 2,
                                    "name": "Cuádriceps suave",
                                    "reps": "40-45\" por pierna",
                                    "tips": "De pie, talón hacia glúteo. Rodillas juntas. No arquear zona lumbar. Más tiempo que en carrera corta: más rigidez acumulada"
                            },
                            {
                                    "order": 3,
                                    "name": "Glúteo / piriforme (Figura 4)",
                                    "reps": "40-45\" por lado",
                                    "tips": "Tumbada boca arriba. Tirar suave hacia el pecho. Debe sentirse en el glúteo, no en la rodilla"
                            },
                            {
                                    "order": 4,
                                    "name": "Isquiotibiales",
                                    "reps": "40-45\" por pierna",
                                    "tips": "Pierna extendida en banco o escalón. Espalda recta. Inclinar desde cadera. No rebotar. Los isquios se cargan mucho en tiradas largas"
                            },
                            {
                                    "order": 5,
                                    "name": "Aductores",
                                    "reps": "40\" por pierna",
                                    "tips": "Sentada en el suelo, planta contra planta (mariposa). Presionar rodillas suavemente hacia abajo. O de pie: piernas abiertas, desplazar peso hacia un lado"
                            },
                            {
                                    "order": 6,
                                    "name": "Flexor de cadera",
                                    "reps": "40\" por pierna",
                                    "tips": "Zancada baja, rodilla trasera al suelo. Pelvis neutra. Apretar glúteo del lado que estiras. Clave después de tiradas largas en cinta"
                            },
                            {
                                    "order": 7,
                                    "name": "Sóleo",
                                    "reps": "40-45\" por pierna",
                                    "tips": "Apoyo contra pared. Rodilla ligeramente flexionada. Talón pegado al suelo"
                            },
                            {
                                    "order": 8,
                                    "name": "Gemelo",
                                    "reps": "40\" por pierna",
                                    "tips": "Misma posición pero rodilla estirada"
                            },
                            {
                                    "order": 9,
                                    "name": "Movilidad de cadera",
                                    "reps": "6 reps por lado",
                                    "tips": "Zancada profunda dinámica. Más reps que en carrera corta para mayor descompresión articular"
                            },
                            {
                                    "order": 10,
                                    "name": "Foam roller cuádriceps",
                                    "reps": "45-60\" por pierna",
                                    "tips": "Boca abajo sobre el rodillo. Movimiento lento desde cadera hasta justo encima de la rodilla. No pasar por encima de la rodilla. Si no tienes foam roller, omitir",
                                    "optional": true
                            },
                            {
                                    "order": 11,
                                    "name": "Foam roller IT band",
                                    "reps": "45-60\" por pierna",
                                    "tips": "De lado sobre el rodillo. Desde cadera hasta justo encima de la rodilla. Doloroso pero importante para proteger la rodilla por el lado externo. Si no tienes foam roller, omitir",
                                    "optional": true
                            }
                    ]
            },
            "post_fuerza_inferior": {
                    "id": "post_fuerza_inferior",
                    "icon": "🦵",
                    "title": "Post fuerza tren inferior",
                    "subtitle": "Sentadilla, peso muerto, etc.",
                    "duration": "8-10 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Glúteo / piriforme (Figura 4)",
                                    "reps": "40\" por lado",
                                    "tips": "Tumbada boca arriba. Prioridad después de hip thrust, sentadillas y step-ups"
                            },
                            {
                                    "order": 2,
                                    "name": "Isquiotibiales",
                                    "reps": "35\" por pierna",
                                    "tips": "Pierna extendida en banco o escalón. Espalda recta. Descargar después de peso muerto rumano"
                            },
                            {
                                    "order": 3,
                                    "name": "Cuádriceps suave",
                                    "reps": "35\" por pierna",
                                    "tips": "De pie, talón hacia glúteo. Rodillas juntas. Descargar después de sentadillas y step-ups"
                            },
                            {
                                    "order": 4,
                                    "name": "Flexor de cadera",
                                    "reps": "35\" por pierna",
                                    "tips": "Zancada baja, rodilla trasera al suelo. Pelvis neutra. Se acorta mucho con sentadillas"
                            },
                            {
                                    "order": 5,
                                    "name": "Aductores",
                                    "reps": "30\" por pierna",
                                    "tips": "Mariposa o desplazamiento lateral de pie. Trabajan como estabilizadores en todos los ejercicios unilaterales"
                            },
                            {
                                    "order": 6,
                                    "name": "Sóleo",
                                    "reps": "30\" por pierna",
                                    "tips": "Apoyo contra pared. Rodilla ligeramente flexionada. Talón pegado al suelo"
                            },
                            {
                                    "order": 7,
                                    "name": "Postura del niño (child's pose)",
                                    "reps": "30-40\"",
                                    "tips": "Rodillas separadas, brazos extendidos, frente al suelo. Soltar espalda baja que se tensa con sentadillas y peso muerto"
                            },
                            {
                                    "order": 8,
                                    "name": "Movilidad de cadera",
                                    "reps": "5 reps por lado",
                                    "tips": "Zancada profunda dinámica. Descomprimir cadera después de la carga"
                            }
                    ]
            },
            "post_fuerza_superior": {
                    "id": "post_fuerza_superior",
                    "icon": "💪",
                    "title": "Post fuerza tren superior",
                    "subtitle": "Press, remo, etc.",
                    "duration": "5-6 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "Pectoral en marco de puerta",
                                    "reps": "30\" por lado",
                                    "tips": "Antebrazo apoyado en el marco, paso adelante. Sentir apertura en pecho. Dos alturas: codo a la altura del hombro y codo por encima del hombro"
                            },
                            {
                                    "order": 2,
                                    "name": "Dorsal",
                                    "reps": "30\" por lado",
                                    "tips": "Agarrar un marco de puerta o poste con una mano, dejar caer el peso del cuerpo hacia atrás. Sentir estiramiento en lateral de la espalda"
                            },
                            {
                                    "order": 3,
                                    "name": "Trapecio / cuello",
                                    "reps": "20\" por lado",
                                    "tips": "Inclinar cabeza lateralmente, oreja hacia el hombro. Mano contraria relajada hacia el suelo. Sin forzar, solo peso de la cabeza"
                            },
                            {
                                    "order": 4,
                                    "name": "Rotación torácica",
                                    "reps": "6 reps por lado",
                                    "tips": "Tumbada de lado, rodillas flexionadas. Brazo de arriba abre rotando hacia el otro lado. Movimiento lento y controlado"
                            },
                            {
                                    "order": 5,
                                    "name": "Estiramiento de bíceps y antebrazo",
                                    "reps": "20\" por brazo",
                                    "tips": "Brazo extendido, palma hacia arriba, con la otra mano tirar dedos hacia abajo suavemente"
                            },
                            {
                                    "order": 6,
                                    "name": "Postura del niño (child's pose)",
                                    "reps": "30\"",
                                    "tips": "Brazos extendidos, frente al suelo. Soltar hombros y espalda"
                            }
                    ]
            }
    },

    mobilityRoutines: {
            "dia_descanso": {
                    "id": "dia_descanso",
                    "title": "Movilidad — Día de descanso",
                    "fullDuration": "~15 minutos",
                    "expressDuration": "~7 minutos",
                    "exercises": [
                            {
                                    "order": 1,
                                    "name": "90/90 Hip switches",
                                    "reps": "8 por lado",
                                    "tips": "Sentada en el suelo, ambas piernas a 90 grados, rotar de un lado a otro. Movilidad de rotación interna y externa de cadera. Lento y controlado",
                                    "express": true
                            },
                            {
                                    "order": 2,
                                    "name": "Zancada profunda con rotación torácica",
                                    "reps": "6 por lado",
                                    "tips": "Desde zancada baja, rotar tronco hacia la pierna delantera con brazo extendido. Abre cadera y columna torácica a la vez",
                                    "express": false
                            },
                            {
                                    "order": 3,
                                    "name": "Mariposa activa",
                                    "reps": "30-40\"",
                                    "tips": "Plantas de los pies juntas, presionar rodillas suave hacia abajo con los codos. Aductores y rotación externa de cadera",
                                    "express": false
                            },
                            {
                                    "order": 4,
                                    "name": "Pigeon pose (paloma)",
                                    "reps": "40\" por lado",
                                    "tips": "Pierna delantera cruzada, bajar el tronco hacia el suelo. Si molesta la rodilla, hacerlo tumbada boca arriba como figura 4. Glúteo profundo y piriforme",
                                    "express": false
                            },
                            {
                                    "order": 5,
                                    "name": "Cat-cow (gato-vaca)",
                                    "reps": "10 reps lentas",
                                    "tips": "En cuadrupedia, alternar arquear y redondear la espalda. Movilidad general de columna",
                                    "express": false
                            },
                            {
                                    "order": 6,
                                    "name": "Rotación torácica en cuadrupedia",
                                    "reps": "8 por lado",
                                    "tips": "Mano detrás de la nuca, rotar abriendo el codo al techo. Donde más rigidez se acumula con horas sentada trabajando",
                                    "express": true
                            },
                            {
                                    "order": 7,
                                    "name": "Child's pose con extensión lateral",
                                    "reps": "30\" por lado",
                                    "tips": "Postura del niño pero caminando las manos hacia un lado. Estira dorsal y oblicuos",
                                    "express": false
                            },
                            {
                                    "order": 8,
                                    "name": "Flexión-extensión de rodilla en descarga",
                                    "reps": "10 reps por pierna",
                                    "tips": "Sentada, estirar y flexionar la rodilla lentamente sin peso. Lubricación articular. Mover la rodilla sin carga ayuda a nutrir el cartílago",
                                    "express": true
                            },
                            {
                                    "order": 9,
                                    "name": "Movilidad de tobillo contra pared",
                                    "reps": "10 reps por lado",
                                    "tips": "Pie a 10 cm de la pared, llevar rodilla hacia delante hasta tocar la pared sin levantar el talón. Dorsiflexión de tobillo: si está limitada, aumenta la carga en la rodilla al correr",
                                    "express": true
                            },
                            {
                                    "order": 10,
                                    "name": "Estiramiento de flexor de cadera",
                                    "reps": "45\" por lado",
                                    "tips": "Zancada baja, rodilla trasera al suelo, apretar glúteo del lado que estiras. Opción de añadir brazo arriba del mismo lado para intensificar. El más importante si trabajas sentada",
                                    "express": true
                            }
                    ]
            }
    },

    techniqueContent: {
        tecnica: {
            title: "Técnica de carrera",
            icon: "🏃‍♀️",
            tips: [
                {
                    id: "cadencia",
                    title: "Cadencia",
                    priority: true,
                    summary: "Pasos cortos y rápidos: 170-175 pasos/min",
                    details: [
                        "Objetivo actual: subir de 164-168 a 170-175 pasos/min",
                        "No forzar zancadas más rápidas: acortar el paso ligeramente",
                        "Se puede usar un metrónomo en el móvil a 170 bpm de fondo para calibrar",
                        "Cadencia más alta = menos impacto por zancada = protección directa para la rodilla",
                        "Es el cambio técnico con mayor impacto inmediato"
                    ]
                },
                {
                    id: "pisada",
                    title: "Pisada debajo del cuerpo",
                    priority: true,
                    summary: "El pie aterriza debajo de tu centro de gravedad, no delante",
                    details: [
                        "Cuando el pie llega por delante del cuerpo actúa como freno",
                        "Toda la fuerza de frenado sube por la tibia hasta la rodilla",
                        "En cinta es más fácil que en exterior, pero aún así se tiende a sobreextender",
                        "Pensar en que el pie \"cae debajo de ti\", no en que \"llega lejos\"",
                        "No intentar cambiar pisada de talón a mediopié forzadamente: eso viene solo con la cadencia correcta"
                    ]
                },
                {
                    id: "inclinacion",
                    title: "Inclinación corporal",
                    priority: false,
                    summary: "Ligera inclinación desde los tobillos, 2-3 grados hacia delante",
                    details: [
                        "Inclinarse desde los tobillos, NO desde la cintura",
                        "Imaginar que eres un poste entero que se inclina ligeramente hacia delante",
                        "La gravedad ayuda a avanzar sin necesidad de empujar tanto con cada zancada",
                        "Inclinarse desde la cintura sobrecarga la zona lumbar y acorta la respiración",
                        "Señal de que lo haces mal: dolor lumbar después de correr"
                    ]
                },
                {
                    id: "brazos",
                    title: "Brazos y manos",
                    priority: false,
                    summary: "Codos a ~90°, movimiento hacia atrás, manos relajadas",
                    details: [
                        "Codos a aproximadamente 90 grados",
                        "El movimiento de brazos va hacia atrás, no cruzando el cuerpo por delante",
                        "Cruzar los brazos genera rotación de tronco que desperdicia energía",
                        "Manos sueltas: imaginar que llevas una patata frita entre pulgar e índice que no quieres romper",
                        "Puños cerrados = tensión en brazos → hombros → cuello → gasto energético innecesario"
                    ]
                },
                {
                    id: "hombros",
                    title: "Hombros",
                    priority: false,
                    summary: "Bajos y relajados. Check cada 10 minutos",
                    details: [
                        "Los hombros deben estar bajos, alejados de las orejas",
                        "La tensión en hombros se transmite a todo el cuerpo y gasta energía",
                        "Hacer un \"check de hombros\" cada 10 minutos: ¿están subidos?",
                        "Si están subidos: sacudirlos, soltar brazos un momento, y recolocar",
                        "Muy común que suban a partir del minuto 20-25 por fatiga"
                    ]
                },
                {
                    id: "mirada",
                    title: "Mirada",
                    priority: false,
                    summary: "Al frente, 10-15 metros por delante",
                    details: [
                        "En cinta: mirar recto al frente, no a la pantalla ni a los pies",
                        "En exterior: mirar 10-15 metros por delante",
                        "Mirar abajo inclina la cabeza y desalinea toda la columna",
                        "Una mala posición de cabeza afecta a hombros, espalda y cadera",
                        "Si necesitas mirar el reloj, subir la muñeca en vez de bajar la cabeza"
                    ]
                },
                {
                    id: "uncambio",
                    title: "Un cambio a la vez",
                    priority: true,
                    summary: "Elige un solo aspecto técnico por sesión",
                    details: [
                        "No intentar corregir todo a la vez: genera descoordinación y frustra",
                        "Elegir UN aspecto por sesión y enfocarse solo en ese",
                        "Orden recomendado de trabajo:",
                        "  1. Cadencia (mayor impacto protector para la rodilla)",
                        "  2. Pisada debajo del cuerpo",
                        "  3. Brazos y hombros",
                        "  4. Inclinación",
                        "Con el tiempo se automatizan y ya no hay que pensar en ellos"
                    ]
                }
            ]
        },
        respiracion: {
            title: "Respiración",
            icon: "💨",
            tips: [
                {
                    id: "nasal",
                    title: "Respiración nasal en rodajes",
                    priority: true,
                    summary: "En Z2 (rodajes), respirar por la nariz todo lo posible",
                    details: [
                        "La respiración nasal es el regulador de intensidad más fiable",
                        "Si puedes respirar por nariz → estás en zona aeróbica",
                        "Cuando la nariz no es suficiente → estás saliendo de zona",
                        "No obsesionarse con patrones fijos tipo \"3 pasos inhala, 2 exhala\"",
                        "Respirar de forma natural y usar la nariz como señal"
                    ]
                },
                {
                    id: "regulador",
                    title: "Regulador de intensidad",
                    priority: true,
                    summary: "La nariz te dice cuándo bajar ritmo",
                    details: [
                        "Puedes mantener nariz + conversación → estás en zona, sigue",
                        "Necesitas soltar aire por boca de vez en cuando (como suspiro) → borde superior de zona, aceptable pero no ideal para todos los días",
                        "Necesitas abrir la boca para respirar → bajar la cinta 0.2-0.3 km/h",
                        "Jadeas o no puedes hablar → muy por encima de zona, bajar significativamente",
                        "En rodajes cortos: FC ≤153 + nariz como doble control",
                        "En tiradas largas: nariz manda, FC se revisa después"
                    ]
                },
                {
                    id: "abdominal",
                    title: "Respiración abdominal (diafragmática)",
                    priority: false,
                    summary: "Respirar con el diafragma, no con el pecho",
                    details: [
                        "Al inhalar, la barriga se hincha (no el pecho)",
                        "La respiración torácica (con el pecho) es superficial y menos eficiente",
                        "Practicar tumbada boca arriba en casa 5 minutos al día ayuda a automatizarlo",
                        "Poner una mano en el pecho y otra en la barriga: solo debe moverse la de la barriga",
                        "Con el tiempo esto se transfiere automáticamente a la carrera"
                    ]
                },
                {
                    id: "tiradas",
                    title: "En tiradas largas",
                    priority: false,
                    summary: "La nariz es el jefe. Si pide boca, baja ritmo",
                    details: [
                        "Respiración nasal como regulador principal durante toda la tirada",
                        "La FC se registra pero NO se mira durante la sesión",
                        "A partir del minuto 35-40 es normal que cueste más mantener nariz",
                        "Si necesitas abrir la boca: bajar cinta un punto, no forzar la nariz",
                        "No forzar mantener nariz si el cuerpo pide más aire: es señal de que hay que bajar",
                        "Después de la sesión revisamos FC media juntos"
                    ]
                },
                {
                    id: "futuras",
                    title: "Fases futuras (referencia)",
                    priority: false,
                    summary: "Cuando llegue intensidad, la respiración cambia",
                    details: [
                        "En sesiones de ritmo controlado y tempo (a partir de semana 11-12), la respiración nasal no será posible",
                        "En esas sesiones se usa respiración boca-nariz",
                        "La referencia será: poder decir frases cortas pero no mantener conversación",
                        "Esto NO aplica todavía en la fase actual (base aeróbica)",
                        "Se introducirá cuando el volumen esté consolidado"
                    ]
                }
            ]
        }
    },

    strengthRoutines: {
            "tren_inferior": {
                    "id": "tren_inferior",
                    "title": "Fuerza Tren Inferior",
                    "duration": "35-40 minutos",
                    "frequency": "Mínimo 2 veces/semana",
                    "blocks": [
                            {
                                    "name": "Activación",
                                    "description": "Siempre primero",
                                    "color": "var(--warning)",
                                    "exercises": [
                                            {
                                                    "order": 1,
                                                    "name": "Clamshell con banda",
                                                    "sets": "4×15",
                                                    "setsDetail": "por lado",
                                                    "rest": "30s",
                                                    "tips": "Tumbada de lado, pies juntos, abrir rodilla contra la banda. Ejercicio prioritario. Activar glúteo medio antes de meter carga"
                                            },
                                            {
                                                    "order": 2,
                                                    "name": "Monster walk con banda",
                                                    "sets": "3×10",
                                                    "setsDetail": "pasos cada dirección",
                                                    "rest": "30s",
                                                    "tips": "Banda encima de rodillas. Mini-sentadilla constante. Adelante, atrás, lateral"
                                            }
                                    ]
                            },
                            {
                                    "name": "Fuerza principal",
                                    "description": "Bloque central",
                                    "color": "var(--accent)",
                                    "exercises": [
                                            {
                                                    "order": 3,
                                                    "name": "Hip thrust o puente de glúteo",
                                                    "sets": "3×12",
                                                    "setsDetail": "",
                                                    "rest": "60-90s",
                                                    "tips": "Si no hay banco disponible, puente en suelo. Apretar glúteo arriba 2 segundos. Motor principal de carrera"
                                            },
                                            {
                                                    "order": 4,
                                                    "name": "Sentadilla goblet",
                                                    "sets": "3×10",
                                                    "setsDetail": "",
                                                    "rest": "90s",
                                                    "tips": "Mancuerna al pecho. Rango que no moleste la rodilla. Si hay molestia, reducir profundidad o sustituir por sentadilla a cajón"
                                            },
                                            {
                                                    "order": 5,
                                                    "name": "Peso muerto rumano",
                                                    "sets": "3×10",
                                                    "setsDetail": "",
                                                    "rest": "90s",
                                                    "tips": "Mancuernas o barra. Espalda neutra siempre. Isquiotibiales débiles sobrecargan la rodilla"
                                            },
                                            {
                                                    "order": 6,
                                                    "name": "Step-up a cajón",
                                                    "sets": "3×8",
                                                    "setsDetail": "por pierna",
                                                    "rest": "60s",
                                                    "tips": "Cajón bajo (20-30 cm). No empujar con la pierna de atrás. Toda la fuerza desde la pierna de arriba. El ejercicio que más replica el gesto de carrera"
                                            }
                                    ]
                            },
                            {
                                    "name": "Core",
                                    "description": "Estabilización",
                                    "color": "var(--info)",
                                    "exercises": [
                                            {
                                                    "order": 7,
                                                    "name": "Plancha frontal",
                                                    "sets": "3×30-40s",
                                                    "setsDetail": "",
                                                    "rest": "45s",
                                                    "tips": "Cuerpo recto, no hundir cadera ni subir glúteo"
                                            },
                                            {
                                                    "order": 8,
                                                    "name": "Plancha lateral",
                                                    "sets": "3×20-25s",
                                                    "setsDetail": "por lado",
                                                    "rest": "45s",
                                                    "tips": "Estabiliza cadera en plano frontal. Clave para compensar glúteo medio"
                                            },
                                            {
                                                    "order": 9,
                                                    "name": "Dead bug",
                                                    "sets": "3×8",
                                                    "setsDetail": "por lado",
                                                    "rest": "45s",
                                                    "tips": "Tumbada boca arriba. Extender brazo y pierna contrarios a la vez. Lumbar pegada al suelo todo el rato"
                                            }
                                    ]
                            }
                    ]
            },
            "tren_superior": {
                    "id": "tren_superior",
                    "title": "Fuerza Tren Superior",
                    "duration": "20-25 minutos",
                    "frequency": "1 vez/semana",
                    "blocks": [
                            {
                                    "name": "Fuerza + Anti-rotación",
                                    "description": "Bloque único",
                                    "color": "var(--accent)",
                                    "exercises": [
                                            {
                                                    "order": 1,
                                                    "name": "Remo con mancuerna",
                                                    "sets": "3×10-12",
                                                    "setsDetail": "",
                                                    "rest": "60s",
                                                    "tips": "Un brazo apoyado, rodilla en banco. Tirar hacia la cadera, no hacia el hombro. Espalda y postura"
                                            },
                                            {
                                                    "order": 2,
                                                    "name": "Press de pecho con mancuernas",
                                                    "sets": "3×10",
                                                    "setsDetail": "",
                                                    "rest": "60-90s",
                                                    "tips": "Tumbada en banco. Control en la bajada, no rebotar abajo"
                                            },
                                            {
                                                    "order": 3,
                                                    "name": "Press de hombro",
                                                    "sets": "3×10",
                                                    "setsDetail": "",
                                                    "rest": "60s",
                                                    "tips": "Sentada o de pie. Peso ligero. Hombros tensos por exceso de peso se transfieren negativamente a la carrera"
                                            },
                                            {
                                                    "order": 4,
                                                    "name": "Pallof press",
                                                    "sets": "3×10",
                                                    "setsDetail": "por lado",
                                                    "rest": "45s",
                                                    "tips": "Cable o banda elástica. Brazos al frente, resistir la rotación. Conecta core con tren superior"
                                            }
                                    ]
                            }
                    ]
            }
    },

    async render() {
        this.state.allExercises = await DB.getAllExercises();
        // Reset view states when rendering
        this.state.warmupView = 'selection';
        this.state.selectedWarmup = null;
        this.state.cooldownView = 'selection';
        this.state.selectedCooldown = null;
        this.state.mobilityView = 'selection';
        this.state.mobilityMode = null;
        return this.renderPage();
    },

    renderPage() {
        const s = this.state;

        // Tabs
        let tabsHtml = '';
        for (const cat of this.categories) {
            const active = cat.key === s.activeTab ? 'active' : '';
            tabsHtml += `<button class="ex-tab ${active}" data-tab="${cat.key}">${cat.icon} ${cat.label}</button>`;
        }

        // Content
        const contentHtml = this.renderCategory(s.activeTab);

        return `
        <div class="ex-header">
            <h1 class="section-title">Biblioteca de ejercicios</h1>
        </div>

        <div class="ex-tabs-scroll">
            <div class="ex-tabs">
                ${tabsHtml}
            </div>
        </div>

        <div class="ex-content" id="ex-content">
            ${contentHtml}
        </div>`;
    },

    renderCategory(key) {
        // Special handling for strength routines
        if (key === 'tren_inferior' || key === 'tren_superior') {
            return this.renderStrengthRoutine(key);
        }

        // Special handling for calentamiento
        if (key === 'calentamiento') {
            return this.renderWarmupSection();
        }

        // Special handling for vuelta_calma
        if (key === 'vuelta_calma') {
            return this.renderCooldownSection();
        }

        // Special handling for movilidad
        if (key === 'movilidad') {
            return this.renderMobilitySection();
        }

        // Special handling for tecnica_respiracion
        if (key === 'tecnica_respiracion') {
            return this.renderTechniqueSection();
        }

        const data = this.state.allExercises ? this.state.allExercises[key] : null;
        if (!data) return '<div class="empty-state"><div class="empty-state-icon">📭</div><p class="empty-state-text">No hay datos disponibles.</p></div>';

        switch (key) {
            case 'pliometria':
                return this.renderExerciseCards(data);
            default:
                return '';
        }
    },

    // === Strength Routine (Tren Inferior / Tren Superior) ===
    renderStrengthRoutine(key) {
        const routine = this.strengthRoutines[key];
        if (!routine) return '<div class="empty-state"><div class="empty-state-icon">📭</div><p class="empty-state-text">No hay datos disponibles.</p></div>';

        let blocksHtml = '';
        for (const block of routine.blocks) {
            let exercisesHtml = '';
            for (const ex of block.exercises) {
                const setsDisplay = ex.setsDetail ? `${ex.sets} <span class="str-sets-detail">${ex.setsDetail}</span>` : ex.sets;
                exercisesHtml += `
                <div class="str-exercise-item">
                    <div class="str-exercise-order">${ex.order}</div>
                    <div class="str-exercise-content">
                        <div class="str-exercise-name">${ex.name}</div>
                        <div class="str-exercise-meta">
                            <span class="str-exercise-sets">${setsDisplay}</span>
                            <span class="str-exercise-rest">⏱ ${ex.rest}</span>
                        </div>
                        <div class="str-exercise-tips">${ex.tips}</div>
                    </div>
                </div>`;
            }

            blocksHtml += `
            <div class="str-block">
                <div class="str-block-header" style="--block-color: ${block.color}">
                    <div class="str-block-title">${block.name}</div>
                    <div class="str-block-desc">${block.description}</div>
                </div>
                <div class="str-block-exercises">
                    ${exercisesHtml}
                </div>
            </div>`;
        }

        return `
        <div class="str-routine-header">
            <div class="str-routine-title">${routine.title}</div>
            <div class="str-routine-meta">
                <span class="str-routine-duration">⏱ ${routine.duration}</span>
                <span class="str-routine-frequency">📅 ${routine.frequency}</span>
            </div>
        </div>
        <div class="str-blocks">
            ${blocksHtml}
        </div>`;
    },

    // === Warmup Section ===
    renderWarmupSection() {
        if (this.state.warmupView === 'routine' && this.state.selectedWarmup) {
            return this.renderWarmupRoutine(this.state.selectedWarmup);
        }
        return this.renderWarmupSelection();
    },

    renderWarmupSelection() {
        const routines = this.warmupRoutines;

        let cardsHtml = '';
        for (const [key, routine] of Object.entries(routines)) {
            cardsHtml += `
            <div class="wu-selection-card" data-warmup-id="${key}">
                <div class="wu-selection-icon">${routine.icon}</div>
                <div class="wu-selection-info">
                    <div class="wu-selection-title">${routine.title}</div>
                    <div class="wu-selection-subtitle">${routine.subtitle}</div>
                </div>
                <div class="wu-selection-duration">${routine.duration}</div>
                <div class="wu-selection-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
            </div>`;
        }

        return `
        <div class="ex-category-name">Calentamientos</div>
        <div class="wu-selection-intro text-sm text-muted mb-16">Selecciona el tipo de entrenamiento para ver la rutina de calentamiento adecuada</div>
        <div class="wu-selection-grid">
            ${cardsHtml}
        </div>`;
    },

    renderWarmupRoutine(warmupId) {
        const routine = this.warmupRoutines[warmupId];
        if (!routine) return this.renderWarmupSelection();

        let exercisesHtml = '';
        for (const ex of routine.exercises) {
            exercisesHtml += `
            <div class="wu-exercise-item">
                <div class="wu-exercise-order">${ex.order}</div>
                <div class="wu-exercise-content">
                    <div class="wu-exercise-name">${ex.name}</div>
                    <div class="wu-exercise-reps">${ex.reps}</div>
                    <div class="wu-exercise-tips">${ex.tips}</div>
                </div>
            </div>`;
        }

        return `
        <div class="wu-routine-header">
            <button class="wu-back-btn" id="warmupBackBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                Volver
            </button>
            <div class="wu-routine-title-group">
                <span class="wu-routine-icon">${routine.icon}</span>
                <div class="wu-routine-title">${routine.title}</div>
            </div>
            <div class="wu-routine-duration">${routine.duration}</div>
        </div>
        <div class="wu-exercise-list">
            ${exercisesHtml}
        </div>`;
    },

    // === Cooldown Section ===
    renderCooldownSection() {
        if (this.state.cooldownView === 'routine' && this.state.selectedCooldown) {
            return this.renderCooldownRoutine(this.state.selectedCooldown);
        }
        return this.renderCooldownSelection();
    },

    renderCooldownSelection() {
        const routines = this.cooldownRoutines;

        let cardsHtml = '';
        for (const [key, routine] of Object.entries(routines)) {
            cardsHtml += `
            <div class="wu-selection-card" data-cooldown-id="${key}">
                <div class="wu-selection-icon">${routine.icon}</div>
                <div class="wu-selection-info">
                    <div class="wu-selection-title">${routine.title}</div>
                    <div class="wu-selection-subtitle">${routine.subtitle}</div>
                </div>
                <div class="wu-selection-duration">${routine.duration}</div>
                <div class="wu-selection-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
            </div>`;
        }

        return `
        <div class="ex-category-name">Vuelta a la calma</div>
        <div class="wu-selection-intro text-sm text-muted mb-16">Selecciona el tipo de entrenamiento para ver la rutina de estiramientos adecuada</div>
        <div class="wu-selection-grid">
            ${cardsHtml}
        </div>`;
    },

    renderCooldownRoutine(cooldownId) {
        const routine = this.cooldownRoutines[cooldownId];
        if (!routine) return this.renderCooldownSelection();

        let exercisesHtml = '';
        for (const ex of routine.exercises) {
            const optionalClass = ex.optional ? ' wu-exercise-optional' : '';
            exercisesHtml += `
            <div class="wu-exercise-item${optionalClass}">
                <div class="wu-exercise-order">${ex.order}</div>
                <div class="wu-exercise-content">
                    <div class="wu-exercise-name">${ex.name}${ex.optional ? ' <span class="wu-optional-badge">Opcional</span>' : ''}</div>
                    <div class="wu-exercise-reps">${ex.reps}</div>
                    <div class="wu-exercise-tips">${ex.tips}</div>
                </div>
            </div>`;
        }

        return `
        <div class="wu-routine-header">
            <button class="wu-back-btn" id="cooldownBackBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                Volver
            </button>
            <div class="wu-routine-title-group">
                <span class="wu-routine-icon">${routine.icon}</span>
                <div class="wu-routine-title">${routine.title}</div>
            </div>
            <div class="wu-routine-duration">${routine.duration}</div>
        </div>
        <div class="wu-exercise-list">
            ${exercisesHtml}
        </div>`;
    },

    // === Mobility Section ===
    renderMobilitySection() {
        if (this.state.mobilityView === 'routine' && this.state.mobilityMode) {
            return this.renderMobilityRoutine(this.state.mobilityMode);
        }
        return this.renderMobilitySelection();
    },

    renderMobilitySelection() {
        return `
        <div class="ex-category-name">Movilidad</div>
        <div class="wu-selection-intro text-sm text-muted mb-16">Rutina de movilidad para días de descanso. Elige según el tiempo disponible</div>
        <div class="wu-selection-grid">
            <div class="wu-selection-card" data-mobility-mode="full">
                <div class="wu-selection-icon">🧘</div>
                <div class="wu-selection-info">
                    <div class="wu-selection-title">Rutina completa</div>
                    <div class="wu-selection-subtitle">10 ejercicios</div>
                </div>
                <div class="wu-selection-duration">~15 min</div>
                <div class="wu-selection-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
            </div>
            <div class="wu-selection-card" data-mobility-mode="express">
                <div class="wu-selection-icon">⚡</div>
                <div class="wu-selection-info">
                    <div class="wu-selection-title">Rutina express</div>
                    <div class="wu-selection-subtitle">5 ejercicios prioritarios</div>
                </div>
                <div class="wu-selection-duration">~7 min</div>
                <div class="wu-selection-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
            </div>
        </div>`;
    },

    renderMobilityRoutine(mode) {
        const routine = this.mobilityRoutines.dia_descanso;
        if (!routine) return this.renderMobilitySelection();

        const isExpress = mode === 'express';
        const exercises = isExpress
            ? routine.exercises.filter(ex => ex.express)
            : routine.exercises;

        const duration = isExpress ? routine.expressDuration : routine.fullDuration;
        const title = isExpress ? 'Rutina express' : 'Rutina completa';
        const icon = isExpress ? '⚡' : '🧘';

        let exercisesHtml = '';
        let orderNum = 1;
        for (const ex of exercises) {
            const expressClass = !isExpress && ex.express ? ' wu-exercise-express' : '';
            const expressBadge = !isExpress && ex.express ? ' <span class="wu-express-badge">⚡</span>' : '';
            exercisesHtml += `
            <div class="wu-exercise-item${expressClass}">
                <div class="wu-exercise-order">${orderNum}</div>
                <div class="wu-exercise-content">
                    <div class="wu-exercise-name">${ex.name}${expressBadge}</div>
                    <div class="wu-exercise-reps">${ex.reps}</div>
                    <div class="wu-exercise-tips">${ex.tips}</div>
                </div>
            </div>`;
            orderNum++;
        }

        return `
        <div class="wu-routine-header">
            <button class="wu-back-btn" id="mobilityBackBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                Volver
            </button>
            <div class="wu-routine-title-group">
                <span class="wu-routine-icon">${icon}</span>
                <div class="wu-routine-title">${title}</div>
            </div>
            <div class="wu-routine-duration">${duration}</div>
        </div>
        ${!isExpress ? '<div class="wu-express-legend text-sm text-muted mb-12">Los ejercicios con ⚡ forman parte de la rutina express</div>' : ''}
        <div class="wu-exercise-list">
            ${exercisesHtml}
        </div>`;
    },

    // === Plyometrics exercise cards (legacy) ===
    renderExerciseCards(data) {
        if (!data.exercises) return '';

        let html = `<div class="ex-category-name">${data.name}</div><div class="ex-cards">`;

        for (const [exId, ex] of Object.entries(data.exercises)) {
            const hasVideo = ex.videoUrl && ex.videoUrl.length > 0;

            html += `
            <div class="card ex-card" data-exercise-id="${exId}">
                <div class="ex-card-image">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
                        <path d="M6.5 6.5L17.5 17.5"/>
                        <path d="M3 10L7 6"/><path d="M10 3L6 7"/>
                        <path d="M17.5 6.5L21 10"/><path d="M14 3L17.5 6.5"/>
                        <path d="M6.5 17.5L3 14"/><path d="M10 21L6.5 17.5"/>
                        <path d="M14 21L17.5 17.5"/><path d="M21 14L17.5 17.5"/>
                    </svg>
                    <span class="ex-card-image-name">${ex.name}</span>
                </div>
                <div class="ex-card-body">
                    <div class="ex-card-title">${ex.name}</div>
                    <div class="ex-card-badges">
                        <span class="ex-badge ex-badge-sets">${ex.sets} &times; ${ex.reps}</span>
                        ${ex.rest ? `<span class="ex-badge ex-badge-rest">⏱ ${ex.rest}</span>` : ''}
                    </div>
                    ${ex.tips ? `<div class="ex-card-tips">${ex.tips}</div>` : ''}
                    ${hasVideo ? `
                    <div class="ex-card-expand">
                        <a href="${ex.videoUrl}" target="_blank" rel="noopener" class="ex-video-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            Ver vídeo
                        </a>
                    </div>` : ''}
                </div>
            </div>`;
        }

        html += '</div>';
        return html;
    },

    // === Technique and Breathing Section ===
    renderTechniqueSection() {
        const content = this.techniqueContent;

        let html = `
        <div class="tech-intro">
            <div class="tech-intro-text">Consejos de técnica de carrera y respiración para mejorar tu rendimiento y prevenir lesiones</div>
        </div>`;

        // Render both sections
        for (const [sectionKey, section] of Object.entries(content)) {
            html += `
            <div class="tech-section">
                <div class="tech-section-header">
                    <span class="tech-section-icon">${section.icon}</span>
                    <span class="tech-section-title">${section.title}</span>
                </div>
                <div class="tech-tips-list">`;

            for (const tip of section.tips) {
                const priorityBadge = tip.priority
                    ? '<span class="tech-priority-badge">⭐ Prioritario</span>'
                    : '';

                let detailsHtml = '<ul class="tech-tip-details-list">';
                for (const detail of tip.details) {
                    detailsHtml += `<li>${detail}</li>`;
                }
                detailsHtml += '</ul>';

                html += `
                <div class="tech-tip-card card" data-tip-id="${tip.id}">
                    <div class="tech-tip-header">
                        <div class="tech-tip-title-row">
                            <span class="tech-tip-title">${tip.title}</span>
                            ${priorityBadge}
                        </div>
                        <div class="tech-tip-summary">${tip.summary}</div>
                        <div class="tech-tip-toggle">
                            <svg class="tech-tip-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                    </div>
                    <div class="tech-tip-details">
                        ${detailsHtml}
                    </div>
                </div>`;
            }

            html += `
                </div>
            </div>`;
        }

        return html;
    },

    mount() {
        // Tab switching
        document.querySelectorAll('.ex-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.tab;
                if (key === this.state.activeTab) return;

                this.state.activeTab = key;
                // Reset view states when switching tabs
                this.state.warmupView = 'selection';
                this.state.selectedWarmup = null;
                this.state.cooldownView = 'selection';
                this.state.selectedCooldown = null;
                this.state.mobilityView = 'selection';
                this.state.mobilityMode = null;

                // Update tab active state
                document.querySelectorAll('.ex-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Update content with animation
                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateY(8px)';

                setTimeout(() => {
                    content.innerHTML = this.renderCategory(key);
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        });

        // Scroll active tab into view
        const activeTab = document.querySelector('.ex-tab.active');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }

        // Mount section handlers
        this.mountSectionHandlers();
    },

    mountSectionHandlers() {
        // Warmup selection cards
        document.querySelectorAll('.wu-selection-card[data-warmup-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                const warmupId = e.currentTarget.dataset.warmupId;
                this.state.warmupView = 'routine';
                this.state.selectedWarmup = warmupId;

                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateX(20px)';

                setTimeout(() => {
                    content.innerHTML = this.renderWarmupSection();
                    content.style.opacity = '1';
                    content.style.transform = 'translateX(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        });

        // Cooldown selection cards
        document.querySelectorAll('.wu-selection-card[data-cooldown-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                const cooldownId = e.currentTarget.dataset.cooldownId;
                this.state.cooldownView = 'routine';
                this.state.selectedCooldown = cooldownId;

                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateX(20px)';

                setTimeout(() => {
                    content.innerHTML = this.renderCooldownSection();
                    content.style.opacity = '1';
                    content.style.transform = 'translateX(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        });

        // Mobility selection cards
        document.querySelectorAll('.wu-selection-card[data-mobility-mode]').forEach(card => {
            card.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mobilityMode;
                this.state.mobilityView = 'routine';
                this.state.mobilityMode = mode;

                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateX(20px)';

                setTimeout(() => {
                    content.innerHTML = this.renderMobilitySection();
                    content.style.opacity = '1';
                    content.style.transform = 'translateX(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        });

        // Warmup back button
        const warmupBackBtn = document.getElementById('warmupBackBtn');
        if (warmupBackBtn) {
            warmupBackBtn.addEventListener('click', () => {
                this.state.warmupView = 'selection';
                this.state.selectedWarmup = null;

                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateX(-20px)';

                setTimeout(() => {
                    content.innerHTML = this.renderWarmupSection();
                    content.style.opacity = '1';
                    content.style.transform = 'translateX(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        }

        // Cooldown back button
        const cooldownBackBtn = document.getElementById('cooldownBackBtn');
        if (cooldownBackBtn) {
            cooldownBackBtn.addEventListener('click', () => {
                this.state.cooldownView = 'selection';
                this.state.selectedCooldown = null;

                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateX(-20px)';

                setTimeout(() => {
                    content.innerHTML = this.renderCooldownSection();
                    content.style.opacity = '1';
                    content.style.transform = 'translateX(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        }

        // Mobility back button
        const mobilityBackBtn = document.getElementById('mobilityBackBtn');
        if (mobilityBackBtn) {
            mobilityBackBtn.addEventListener('click', () => {
                this.state.mobilityView = 'selection';
                this.state.mobilityMode = null;

                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateX(-20px)';

                setTimeout(() => {
                    content.innerHTML = this.renderMobilitySection();
                    content.style.opacity = '1';
                    content.style.transform = 'translateX(0)';
                    this.mountSectionHandlers();
                }, 150);
            });
        }

        // Technique tip cards (collapsible)
        document.querySelectorAll('.tech-tip-card').forEach(card => {
            card.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                // Close all other cards in the same section
                card.closest('.tech-tips-list').querySelectorAll('.tech-tip-card').forEach(c => {
                    c.classList.remove('expanded');
                });
                // Toggle this card
                if (!isExpanded) {
                    card.classList.add('expanded');
                }
            });
        });
    }
};

// Register with router
Router.registerView('exercises', ExercisesView);
