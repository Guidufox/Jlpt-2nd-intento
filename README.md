# 🇯🇵 JLPT Master — Plataforma Completa N5 → N1

Plataforma web de preparación para el **Japanese Language Proficiency Test (JLPT)**, niveles N5 a N1.

Filosofía: velocidad, claridad y control total del usuario.  
Sin gamificación forzada. Sin desbloqueos. Sin vidas. El usuario estudia lo que quiere, cuando quiere.

---

## ⚡ Instalación rápida (XAMPP)

### Requisitos
- [XAMPP](https://www.apachefriends.org/) con **Apache** + **PHP 8.0+**
- Extensión **PDO SQLite** habilitada (viene por defecto en XAMPP)
- Navegador moderno (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)

### Pasos

```
1. Descomprime el ZIP en:
   Windows → C:\xampp\htdocs\jlpt\
   macOS   → /Applications/XAMPP/htdocs/jlpt/
   Linux   → /opt/lampp/htdocs/jlpt/

2. Inicia XAMPP → Arranca Apache

3. Abre en el navegador:
   http://localhost/jlpt/setup.php
   → Crea la base de datos SQLite y carga datos de ejemplo

4. Ve a la aplicación:
   http://localhost/jlpt/
```

> ⚠️ `setup.php` solo es accesible desde `localhost` por seguridad.  
> Si necesitas ejecutarlo desde otra máquina, edita `.htaccess` temporalmente.

---

## 📁 Estructura del proyecto

```
jlpt/
│
├── index.html              ← SPA shell (entrada principal)
├── setup.php               ← Inicialización de BD (ejecutar una vez)
├── .htaccess               ← Configuración Apache (seguridad, caché, UTF-8)
│
├── api/                    ← Backend PHP (REST JSON)
│   ├── db.php              ← Conexión PDO + helpers compartidos
│   ├── vocabulary.php      ← CRUD vocabulario + progreso usuario
│   ├── grammar.php         ← Puntos gramaticales
│   ├── kanji.php           ← Kanji + progreso usuario
│   ├── theory.php          ← Artículos de teoría
│   ├── exams.php           ← Sesiones de examen + preguntas + resultados
│   ├── srs.php             ← Algoritmo SM-2 (repetición espaciada)
│   ├── dashboard.php       ← Estadísticas globales de progreso
│   ├── favorites.php       ← Toggle de favoritos
│   └── progress.php        ← Registro de sesiones de estudio + racha
│
├── assets/
│   ├── css/
│   │   └── main.css        ← Estilos completos (~700 líneas)
│   └── js/
│       ├── app.js          ← Router SPA + pantalla de inicio
│       ├── api.js          ← Cliente HTTP centralizado
│       ├── shared/
│       │   └── utils.js    ← Utilidades compartidas (DOM, toast, modal…)
│       └── modules/
│           ├── dashboard.js    ← Dashboard de progreso
│           ├── vocabulary.js   ← Vocabulario (lista/tarjetas/flashcards)
│           ├── grammar.js      ← Gramática (lista/detalle)
│           ├── kanji.js        ← Kanji (rejilla/lista/flashcards)
│           ├── theory.js       ← Biblioteca de teoría
│           ├── exams.js        ← Simulacros (práctica/examen)
│           ├── srs.js          ← Cola de repaso SRS
│           └── settings.js     ← Preferencias de usuario
│
├── data/
│   └── jlpt.db             ← Base de datos SQLite (generada por setup.php)
│
└── sql/
    ├── schema.sql           ← Esquema completo (15 tablas + índices)
    └── seed.sql             ← Datos de ejemplo (90 vocab, 64 kanji, 25 gramática, 30 preguntas)
```

---

## 🗄️ Esquema de base de datos

| Tabla               | Descripción                                      |
|---------------------|--------------------------------------------------|
| `vocabulary`        | Palabras JLPT con kanji, kana, ejemplos, notas   |
| `kanji`             | Kanji con onyomi, kunyomi, trazos, radical        |
| `grammar_points`    | Patrones gramaticales con estructura y ejemplos   |
| `theory_articles`   | Artículos de teoría (HTML enriquecido)            |
| `exam_questions`    | Preguntas de examen por nivel y tipo              |
| `exam_options`      | Opciones A/B/C/D para cada pregunta               |
| `user_vocabulary`   | Progreso del usuario en vocabulario               |
| `user_kanji`        | Progreso del usuario en kanji                     |
| `srs_cards`         | Tarjetas SRS con datos SM-2 (ease, interval…)     |
| `exam_sessions`     | Sesiones de examen con puntuación y tiempo        |
| `exam_results`      | Respuestas individuales por sesión                |
| `favorites`         | Favoritos (vocab, kanji, gramática)               |
| `study_sessions`    | Historial de sesiones de estudio                  |

---

## 🧠 Algoritmo SRS (SM-2)

El sistema usa una versión simplificada del algoritmo **SuperMemo 2**:

| Botón   | Calidad | Efecto                                   |
|---------|---------|------------------------------------------|
| ↩ Again | 0       | Reinicia el intervalo a 1 día            |
| ◑ Hard  | 1       | Incremento mínimo (~1.2× intervalo)      |
| ✓ Good  | 2       | Incremento normal (ease_factor × actual) |
| ✦ Easy  | 3       | Incremento ampliado + sube ease_factor   |

El `ease_factor` empieza en **2.5** y se ajusta tras cada revisión (mínimo 1.3).

---

## 🔗 Rutas SPA

```
#/                    → Inicio (selector de módulo y nivel)
#/dashboard           → Panel de progreso global
#/vocabulary          → Vocabulario (todos los niveles)
#/vocabulary/N5       → Vocabulario filtrado por nivel
#/vocabulary/N5/flashcards → Modo flashcard
#/grammar             → Gramática
#/grammar/N3          → Gramática N3
#/grammar/42          → Detalle de un punto gramatical
#/kanji               → Kanji
#/kanji/N4            → Kanji N4
#/kanji/N4/flashcards → Flashcards de kanji
#/theory              → Biblioteca de teoría
#/theory/2            → Artículo de teoría individual
#/exams               → Simulacros JLPT
#/srs                 → Cola de repaso SRS
#/intensive           → Guía de preparación intensiva
#/favorites           → Favoritos
#/settings            → Configuración de usuario
```

---

## 📡 API Endpoints (PHP)

Todos devuelven `{ ok: true, data: {...} }` o `{ ok: false, error: "..." }`.

### Vocabulario
| Método | URL                        | Descripción                       |
|--------|----------------------------|-----------------------------------|
| GET    | `api/vocabulary.php`       | Listar (level, search, status…)   |
| GET    | `api/vocabulary.php?id=N`  | Obtener una palabra               |
| POST   | `api/vocabulary.php`       | Actualizar progreso usuario        |

### Gramática
| Método | URL                      | Descripción                    |
|--------|--------------------------|--------------------------------|
| GET    | `api/grammar.php`        | Listar puntos gramaticales      |
| GET    | `api/grammar.php?id=N`   | Detalle con ejemplos y relaciones|

### Kanji
| Método | URL                   | Descripción                       |
|--------|-----------------------|-----------------------------------|
| GET    | `api/kanji.php`       | Listar kanji (level, search…)     |
| GET    | `api/kanji.php?id=N`  | Detalle de un kanji               |
| POST   | `api/kanji.php`       | Actualizar progreso usuario        |

### SRS
| Método | URL                              | Descripción                  |
|--------|----------------------------------|------------------------------|
| GET    | `api/srs.php?action=due`         | Tarjetas pendientes de hoy   |
| GET    | `api/srs.php?action=stats`       | Estadísticas del mazo        |
| POST   | `api/srs.php?action=add`         | Añadir tarjeta al mazo       |
| POST   | `api/srs.php?action=review`      | Registrar revisión (SM-2)    |
| POST   | `api/srs.php?action=remove`      | Eliminar del mazo            |

### Exámenes
| Método | URL                                | Descripción              |
|--------|------------------------------------|--------------------------|
| GET    | `api/exams.php?action=questions`   | Obtener preguntas        |
| POST   | `api/exams.php?action=start`       | Iniciar sesión           |
| POST   | `api/exams.php?action=answer`      | Registrar respuesta       |
| POST   | `api/exams.php?action=finish`      | Finalizar y calcular nota |
| GET    | `api/exams.php?action=sessions`    | Historial de exámenes    |

---

## ✨ Funcionalidades

### Módulo Vocabulario
- **Vista Lista**: tabla paginada con búsqueda y filtros
- **Vista Tarjetas**: grid visual con significado y estado
- **Vista Flashcards**: modo inmersivo con flip animation
- **Filtros**: nivel, estado (nuevo/aprendiendo/conocido/dominado), favoritos
- **Integración SRS**: botones Again/Hard/Good/Easy en modo flashcard
- **Favoritos**: marcado con ☆ desde cualquier vista
- **Detalle modal**: ejemplos, furigana, notas, control de estado

### Módulo Gramática
- Lista organizada por nivel y categoría
- Detalle completo: patrón, estructura, explicación, ejemplos
- Puntos gramaticales relacionados
- Marcado como favorito

### Módulo Kanji
- **Vista Rejilla**: cuadrícula visual por nivel
- **Vista Lista**: tabla con lecturas y estado
- **Vista Flashcards**: front=kanji, back=lecturas+significado+ejemplos
- Indicador de estado por punto de color
- Integración SRS

### Módulo Teoría
- Biblioteca de artículos con HTML enriquecido
- Categorías: partículas, verbos, adjetivos, consejos JLPT…
- Filtro por nivel y categoría

### Módulo Exámenes
- **Modo Práctica**: corrección inmediata + explicación
- **Modo Examen**: cronómetro, sin corrección hasta el final
- Tipos: vocabulario, gramática, kanji, lectura
- Revisión de respuestas al terminar
- Historial de sesiones con puntuación

### Módulo SRS
- Cola diaria ordenada por fecha de revisión
- Botones SM-2: Again / Hard / Good / Easy
- Estadísticas: pendientes, revisadas hoy, maduras
- Pronóstico de próximos 7 días
- Filtro por tipo (vocab/kanji) y nivel

### Dashboard
- Progreso por nivel (N5–N1) con barras de avance
- Racha de días consecutivos de estudio 🔥
- Últimos exámenes con puntuación
- Estadísticas SRS globales
- Gráfico de actividad últimos 7 días

### Configuración
- Idioma del significado (ES / EN / ambos)
- Furigana visible / oculto
- Tamaño de letra
- SRS global on/off
- Límites diarios de nuevas tarjetas y repasos
- Modo y número de preguntas por defecto en exámenes
- Objetivos diarios (solo referencia, no bloquea el estudio)
- Todo guardado en **localStorage** (sin backend)

---

## 🛠️ Tecnologías

| Capa      | Tecnología                                      |
|-----------|-------------------------------------------------|
| Frontend  | HTML5 + CSS3 + JavaScript ES6 Modules (vanilla) |
| Backend   | PHP 8.0+ con PDO                                |
| Base de datos | SQLite 3 (via PDO_SQLite)                   |
| Servidor  | Apache 2.4 (XAMPP)                              |
| Algoritmo | SM-2 (SuperMemo 2) simplificado                 |

**Sin frameworks** de JS ni de PHP. Sin npm, sin composer, sin dependencias externas.

---

## 📊 Datos de ejemplo incluidos

| Contenido           | N5 | N4 | N3 | N2 | N1 | Total |
|---------------------|----|----|----|----|-----|-------|
| Vocabulario         | 20 | 20 | 20 | 15 | 15  | **90** |
| Kanji               | 16 | 10 | 10 | 10 | 8   | **54** |
| Gramática           | 6  | 6  | 5  | 4  | 4   | **25** |
| Preguntas de examen | 8  | 6  | 6  | 5  | 5   | **30** |
| Artículos de teoría | —  | —  | —  | —  | —   | **5**  |

---

## 🔧 Añadir contenido propio

### Vocabulario
```sql
INSERT INTO vocabulary (kanji, kana, furigana, meaning_es, level, category, frequency, examples)
VALUES (
  '勉強', 'べんきょう', 'べんきょう',
  'estudio / estudiar',
  'N5', 'verbo', 95,
  '[{"jp":"毎日勉強します。","rom":"Mainichi benkyou shimasu.","es":"Estudio todos los días."}]'
);
```

### Kanji
```sql
INSERT INTO kanji (character, onyomi, kunyomi, meaning, meaning_es, level, stroke_count, examples)
VALUES (
  '勉', 'ベン', 'つと', 'endeavor', 'esforzarse',
  'N4', 10,
  '[{"word":"勉強","read":"べんきょう","meaning":"estudio"}]'
);
```

### Preguntas de examen
```sql
INSERT INTO exam_questions (question_text, question_type, level, correct_answer, explanation)
VALUES ('「勉強」の意味はどれですか？', 'vocabulary', 'N5', 'A', 'べんきょう significa "estudio".');

-- Luego añadir las opciones (el ID es el último insertado)
INSERT INTO exam_options (question_id, option_text, option_label) VALUES
(last_insert_rowid(), 'estudio', 'A'),
(last_insert_rowid(), 'trabajo', 'B'),
(last_insert_rowid(), 'comida',  'C'),
(last_insert_rowid(), 'viaje',   'D');
```

---

## 🐛 Solución de problemas

| Problema | Solución |
|----------|----------|
| Pantalla en blanco | Verifica que Apache esté corriendo y la URL es `http://localhost/jlpt/` |
| "Base de datos no encontrada" | Ejecuta `http://localhost/jlpt/setup.php` primero |
| Módulo JS no carga | Los módulos ES6 requieren servidor HTTP; no funciona con `file://` |
| Caracteres japoneses incorrectos | Verifica que el servidor envía UTF-8 (`.htaccess` incluido lo configura) |
| `setup.php` da error 403 | El `.htaccess` lo protege; accede desde `localhost` o `127.0.0.1` |
| PDO SQLite no disponible | En XAMPP: `php.ini` → descomenta `extension=pdo_sqlite` |

---

## 📜 Licencia

MIT — Libre para uso personal y educativo.

---

*JLPT Master — Construido con HTML, CSS, JavaScript y PHP puros. Sin dependencias externas.*
