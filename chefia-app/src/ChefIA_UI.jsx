import { useState, useCallback, useEffect } from "react";

// ─── Constantes del compilador ───────────────────────────────────────────────

const UNITS_MAP = {
  kg: 1000, kilo: 1000, kilogramo: 1000, kilogramos: 1000, kilos: 1000,
  g: 1, gr: 1, gramo: 1, gramos: 1, oz: 28.35, onza: 28.35, onzas: 28.35, lb: 453.6, libra: 453.6,
  ml: 1, mililitro: 1, mililitros: 1, cm3: 1, l: 1000, lt: 1000, litro: 1000, litros: 1000,
  taza: 240, tazas: 240, cda: 15, cdas: 15, cucharada: 15, cucharadas: 15,
  cdta: 5, cdtas: 5, cucharadita: 5, cucharaditas: 5, tbsp: 14.8, tsp: 4.9, cup: 236.6,
  pieza: 1, piezas: 1, pza: 1, pzas: 1, unidad: 1, unidades: 1, diente: 1, dientes: 1,
  rebanada: 1, rebanadas: 1, pizca: 1, pizcas: 1, manojo: 1, manojos: 1, rama: 1, ramas: 1, hoja: 1, hojas: 1
};
const UNIT_TYPE_MAP = {
  kg: "masa", kilo: "masa", kilogramo: "masa", kilogramos: "masa", kilos: "masa",
  g: "masa", gr: "masa", gramo: "masa", gramos: "masa", oz: "masa", onza: "masa", onzas: "masa", lb: "masa", libra: "masa",
  ml: "volumen", mililitro: "volumen", mililitros: "volumen", cm3: "volumen", l: "volumen", lt: "volumen", litro: "volumen", litros: "volumen",
  taza: "volumen", tazas: "volumen", cda: "volumen", cucharada: "volumen", cdta: "volumen", cucharadita: "volumen", tbsp: "volumen", tsp: "volumen", cup: "volumen",
  pieza: "conteo", piezas: "conteo", pza: "conteo", unidad: "conteo", diente: "conteo", rebanada: "conteo",
  pizca: "especial", manojo: "especial", rama: "especial", hoja: "especial"
};
const BASE_LABEL = { masa: "g", volumen: "ml", conteo: "pzas", especial: "porción" };

const UNIT_WORDS = new Set(Object.keys(UNITS_MAP));
const CONNECTORS = new Set(["de", "y", "o", "con", "al", "a", "en", "sin", "por"]);
const UNICODE_FRAC = { "½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };

// Este objeto simula la base de datos externa. En un entorno real,
// estos datos vivirían en una BD de verdad (PostgreSQL, MongoDB, etc.)
// y se accederían a través de una API (REST o GraphQL).
const MOCK_DB_CATALOG = {
  "harina": { price: 28.90, pres: "1 kg", pUnit: "kg" },
  "leche": { price: 24.50, pres: "1 L", pUnit: "l" },
  "huevo": { price: 45.00, pres: "12 pzas", pUnit: "pzas" },
  "huevos": { price: 45.00, pres: "12 pzas", pUnit: "pzas" },
  "azúcar": { price: 32.00, pres: "1 kg", pUnit: "kg" },
  "azucar": { price: 32.00, pres: "1 kg", pUnit: "kg" },
  "aceite de oliva": { price: 89.00, pres: "500 ml", pUnit: "ml" },
  "aceite": { price: 55.00, pres: "1 L", pUnit: "l" },
  "sal": { price: 15.00, pres: "1 kg", pUnit: "kg" },
  "mantequilla": { price: 55.00, pres: "250 g", pUnit: "g" },
  "jitomate": { price: 22.00, pres: "1 kg", pUnit: "kg" },
  "tomate": { price: 22.00, pres: "1 kg", pUnit: "kg" },
  "cebolla": { price: 18.00, pres: "1 kg", pUnit: "kg" },
  "ajo": { price: 30.00, pres: "200 g", pUnit: "g" },
  "chile": { price: 25.00, pres: "250 g", pUnit: "g" },
  "pollo": { price: 95.00, pres: "1 kg", pUnit: "kg" },
  "carne": { price: 185.00, pres: "1 kg", pUnit: "kg" },
  "pasta": { price: 22.00, pres: "500 g", pUnit: "g" },
  "arroz": { price: 35.00, pres: "1 kg", pUnit: "kg" },
  "frijol": { price: 40.00, pres: "1 kg", pUnit: "kg" },
  "queso": { price: 120.00, pres: "400 g", pUnit: "g" },
  "crema": { price: 38.00, pres: "500 ml", pUnit: "ml" },
  "limón": { price: 15.00, pres: "1 kg", pUnit: "kg" },
  "limon": { price: 15.00, pres: "1 kg", pUnit: "kg" },
  "naranja": { price: 20.00, pres: "1 kg", pUnit: "kg" },
  "vinagre": { price: 28.00, pres: "500 ml", pUnit: "ml" },
  "pimienta": { price: 45.00, pres: "100 g", pUnit: "g" },
  "comino": { price: 50.00, pres: "100 g", pUnit: "g" },
  "orégano": { price: 35.00, pres: "100 g", pUnit: "g" },
  "laurel": { price: 25.00, pres: "50 g", pUnit: "g" },
  "cilantro": { price: 12.00, pres: "1 manojo", pUnit: "manojo" },
};

// ─── LEXER ───────────────────────────────────────────────────────────────────
function runLexer(text) {
  const tokens = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    if (line.trim().startsWith("#") || line.trim() === "") return;
    let i = 0;
    while (i < line.length) {
      if (/\s/.test(line[i])) { i++; continue; }
      // Unicode fractions
      if (UNICODE_FRAC[line[i]]) {
        tokens.push({ type: "FRACTION", value: UNICODE_FRAC[line[i]], line: li + 1, col: i + 1 });
        i++; continue;
      }
      // Fraction  N/M
      const fracM = line.slice(i).match(/^(\d+)\s*\/\s*(\d+)/);
      if (fracM) {
        tokens.push({ type: "FRACTION", value: fracM[0].replace(/\s/g, ""), line: li + 1, col: i + 1 });
        i += fracM[0].length; continue;
      }
      // Number
      const numM = line.slice(i).match(/^\d+(\.\d+)?/);
      if (numM) {
        tokens.push({ type: "NUMBER", value: numM[0], line: li + 1, col: i + 1 });
        i += numM[0].length; continue;
      }
      // Comma
      if (line[i] === ",") {
        tokens.push({ type: "COMMA", value: ",", line: li + 1, col: i + 1 });
        i++; continue;
      }
      // Word
      const wordM = line.slice(i).match(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+(?:['-][a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+)*/u);
      if (wordM) {
        const w = wordM[0], wl = w.toLowerCase();
        let type = "WORD";
        if (UNIT_WORDS.has(wl)) type = "UNIT";
        else if (CONNECTORS.has(wl)) type = "OF";
        tokens.push({ type, value: w, line: li + 1, col: i + 1 });
        i += w.length; continue;
      }
      i++;
    }
    tokens.push({ type: "NEWLINE", value: "\\n", line: li + 1, col: line.length + 1 });
  });
  tokens.push({ type: "EOF", value: "", line: lines.length, col: 0 });
  return tokens;
}

// ─── PARSER ──────────────────────────────────────────────────────────────────
function runParser(tokens) {
  let pos = 0;
  const cur = () => tokens[pos] || { type: "EOF" };
  const advance = () => tokens[pos++];
  const skipSep = () => { while (["NEWLINE", "COMMA"].includes(cur().type)) advance(); };

  function parseQty() {
    let intPart = null, fracPart = null;
    if (cur().type === "NUMBER") { intPart = advance().value; }
    if (cur().type === "FRACTION") { fracPart = advance().value; }
    if (!intPart && !fracPart) return null;
    const float = (intPart ? parseFloat(intPart) : 0) + (fracPart ? eval(fracPart) : 0);
    return { intPart, fracPart, float, str: [intPart, fracPart].filter(Boolean).join(" ") };
  }

  function parseIngredient() {
    const qty = parseQty();
    if (!qty) return null;
    let unit = null;
    if (cur().type === "UNIT") { unit = advance().value.toLowerCase(); }
    if (cur().type === "OF") advance();
    const words = [];
    while (["WORD", "OF"].includes(cur().type)) words.push(advance().value);
    if (!words.length) return null;
    return { qty, unit, name: words.join(" ") };
  }

  const ingredients = [];
  while (cur().type !== "EOF") {
    skipSep();
    if (cur().type === "EOF") break;
    if (["NUMBER", "FRACTION"].includes(cur().type)) {
      const ing = parseIngredient();
      if (ing) ingredients.push(ing);
    } else { advance(); }
  }
  return ingredients;
}

// ─── SEMANTIC ────────────────────────────────────────────────────────────────
function runSemantic(ingredients, catalog) {
  const normalized = ingredients.map(ing => {
    const unitL = ing.unit?.toLowerCase();
    const factor = unitL ? (UNITS_MAP[unitL] || 1) : 1;
    const utype = unitL ? (UNIT_TYPE_MAP[unitL] || "conteo") : "conteo";
    return {
      name: ing.name.toLowerCase().trim(),
      displayName: ing.name,
      qtyBase: ing.qty.float * factor,
      unitType: utype,
      baseUnit: BASE_LABEL[utype],
      origQty: ing.qty.float,
      origUnit: unitL || "pieza",
    };
  });

  // Group
  const grouped = {};
  normalized.forEach(n => {
    const key = n.name;
    if (!grouped[key]) grouped[key] = { ...n, qtyBase: 0 };
    grouped[key].qtyBase += n.qtyBase;
  });

  // Price lookup
  const shopping = Object.values(grouped).map(item => {
    let cKey = Object.keys(catalog).find(k => item.name.includes(k) || k.includes(item.name));
    const cat = cKey ? catalog[cKey] : null;
    if (!cat) {
      return { ...item, presentation: "1 unidad", unitsNeeded: 1, pricePerUnit: 50, totalPrice: 50, found: false };
    }
    const presQty = parseFloat(cat.pres) * (UNITS_MAP[cat.pUnit] || 1);
    const needed = Math.max(1, Math.ceil(item.qtyBase / presQty));
    return {
      ...item,
      displayName: (cKey || item.name).replace(/\b\w/g, c => c.toUpperCase()),
      presentation: cat.pres,
      unitsNeeded: needed,
      pricePerUnit: cat.price,
      totalPrice: cat.price * needed,
      found: true,
    };
  });

  shopping.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return shopping;
}

// ─── DEMO TEXT ───────────────────────────────────────────────────────────────
const DEMO = `# Panqué de naranja
500 gr de harina
2 tazas de leche
3 huevos
½ kg de azúcar
250 ml de aceite
1 cdta de sal

# Ensalada fresca
3 jitomates
1 cebolla
2 dientes de ajo
¼ kg de queso
200 ml de vinagre
1 pizca de orégano`;

// ─── COMPONENTES ─────────────────────────────────────────────────────────────

const TOKEN_COLORS = {
  NUMBER: "#f59e0b", FRACTION: "#f59e0b", UNIT: "#10b981",
  WORD: "#3b82f6", OF: "#a855f7", COMMA: "#ef4444",
  NEWLINE: "#94a3b8", EOF: "#64748b",
};

export default function ChefIA() {
  const [text, setText] = useState(DEMO);
  const [phase, setPhase] = useState(null); // "lexer"|"parser"|"semantic"
  const [tokens, setTokens] = useState([]);
  const [ast, setAst] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [activeTab, setActiveTab] = useState("lexer");
  const [appView, setAppView] = useState("generator"); // "generator" | "compiler"

  // New state: Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Tema de colores
  const theme = {
    bgApp: isDarkMode ? "#0f172a" : "#f4f5f7",
    textMain: isDarkMode ? "#f8fafc" : "#1e293b",
    bgPanel: isDarkMode ? "#1e293b" : "#ffffff",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    textMuted: isDarkMode ? "#94a3b8" : "#64748b",
    textMutedLight: isDarkMode ? "#64748b" : "#94a3b8",
    textSub: isDarkMode ? "#cbd5e1" : "#475569",
    inputBg: isDarkMode ? "#0f172a" : "white",
    inputText: isDarkMode ? "#f8fafc" : "#334155",
    tabBgInactive: isDarkMode ? "#334155" : "#f1f5f9",
    tabTextInactive: isDarkMode ? "#94a3b8" : "#64748b",
    pipelineBgDone: isDarkMode ? "#1e293b" : "white",
    pipelineBgWait: isDarkMode ? "#0f172a" : "#f8fafc",
    tableRowBorder: isDarkMode ? "#334155" : "#f1f5f9",
    totalBoxBg: isDarkMode ? "#0f172a" : "#f8fafc",
    totalTextDark: isDarkMode ? "#f8fafc" : "#0f172a",
    emptyBg: isDarkMode ? "#1e293b" : "white",
    emptyBorder: isDarkMode ? "#334155" : "#cbd5e1",
    btnPrimaryBg: isDarkMode ? "#059669" : "#10b981",
    btnPrimaryHover: isDarkMode ? "#047857" : "#059669",
    btnDarkBg: isDarkMode ? "#334155" : "#0f172a",
    codeBg: isDarkMode ? "#0f172a" : "white",
  };

  // New states for dynamic catalog
  const [catalog, setCatalog] = useState({});
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // New States for Google AI
  const [dishName, setDishName] = useState("");
  const [peopleCount, setPeopleCount] = useState("4");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch del catálogo desde el nuevo Backend
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      try {
        // Obtenemos los nombres de los ingredientes del MOCK_DB_CATALOG para cotizarlos
        const ingredientsToCrawl = Object.keys(MOCK_DB_CATALOG);

        // Petición real al backend de Puppeteer (Scraper)
        const res = await fetch(`http://${window.location.hostname}:3001/api/precios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: ingredientsToCrawl })
        });

        if (!res.ok) throw new Error("Error en el servidor scraper");

        const sorianaCatalog = await res.json();

        // Combinar datos: Si el scraper falló en encontrar alguno, usamos el precio de fallback del mock
        const finalCatalog = { ...MOCK_DB_CATALOG };
        Object.keys(sorianaCatalog).forEach(key => {
          if (finalCatalog[key] && sorianaCatalog[key].price) {
            finalCatalog[key].price = sorianaCatalog[key].price;
            // Dejamos la unidad (pres/pUnit) del mock para no romper la matemática del compilador
            // aunque el scraper haya encontrado otra presentación.
          } else if (!finalCatalog[key]) {
            finalCatalog[key] = sorianaCatalog[key];
          }
        });

        setCatalog(finalCatalog);
      } catch (error) {
        console.error("Error al obtener catálogo, usando fallback:", error);
        setCatalog(MOCK_DB_CATALOG);
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCatalog();
  }, []);

  const compile = useCallback(() => {
    if (loadingCatalog) return; // Prevent compiling if data is missing
    setPhase("compiling");
    setTimeout(() => {
      const toks = runLexer(text);
      setTokens(toks);
      setPhase("lexer");
      setTimeout(() => {
        const ings = runParser(toks);
        setAst(ings);
        setPhase("parser");
        setTimeout(() => {
          const shop = runSemantic(ings, catalog); // Pasamos el catálogo extraído dinámicamente
          setShopping(shop);
          setPhase("semantic");
          setActiveTab("lexer");
        }, 600);
      }, 600);
    }, 300);
  }, [text, catalog, loadingCatalog]);

  const generateRecipe = useCallback(async () => {
    if (!dishName.trim() || !peopleCount) {
      alert("Por favor ingresa el Platillo y el Número de Personas.");
      return;
    }
    setIsGenerating(true);
    setPhase(null); // Reset pipeline

    try {
      const prompt = `Eres el asistente de ChefIA, un compilador de recetas experto.
Tu objetivo es generar la lista de ingredientes para el platillo solicitado.

REGLAS ESTRICTAS:
1. Si el platillo es una receta real que existe en el mundo (ej. "huevos rancheros", "tacos de cabeza", "flautas", "pizza"), devuelve SOLO la lista de ingredientes.
2. Si el platillo NO EXISTE, es inventado, absurdo, no es comestible o es un objeto (ej. "sopa de llanta", "taco de zapato", "casa", "nubes fritas"), responde ÚNICAMENTE con la palabra: ERROR
3. El formato DEBE ser: "cantidad unidad nombre". Un ingrediente por línea. SIN guiones o viñetas.

Ejemplo 1 (Platillo real):
Platillo: Huevos rancheros para 2 personas
Respuesta:
4 piezas huevo
4 piezas tortilla
200 gr tomate

Ejemplo 2 (Platillo que no existe):
Platillo: Sopa de llanta para 1 personas
Respuesta:
ERROR

Platillo: ${dishName} para ${peopleCount} personas
Respuesta:`;

      const res = await fetch(`http://${window.location.hostname}:3001/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error || "Error al conectar con Ollama.");

      if (data.response !== undefined) {
        let reply = data.response.trim();
        if (reply.toUpperCase().includes("ERROR")) {
          alert(`ERROR: Por favor ingresa un platillo de verdad.\n\nNo puedo generar la lista de ingredientes para "${dishName}" ya que no es un platillo real.`);
          setText("");
        } else {
          reply = reply.replace(/^[-*•]\s*/gm, '').trim(); // Remove bullets just in case
          setText(reply);
        }
      } else {
        throw new Error("Respuesta inesperada de la API local.");
      }
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
    setIsGenerating(false);
  }, [dishName, peopleCount]);

  const total = shopping.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <div style={{
      minHeight: "100vh", background: theme.bgApp, color: theme.textMain,
      fontFamily: "system-ui, -apple-system, sans-serif", padding: "0",
      transition: "background 0.3s, color 0.3s", display: "flex", flexDirection: "column"
    }}>
      {/* ── Header ── */}
      <div className="app-header" style={{
        background: theme.bgPanel,
        borderBottom: `1px solid ${theme.border}`, padding: "2rem 2.5rem 1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        transition: "background 0.3s, border-color 0.3s"
      }}>
        <div className="header-content-wrapper" style={{ maxWidth: 1100, margin: "0 auto", flex: 1 }}>
          <div className="header-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <div className="header-titles" style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
              <span className="header-main-title" style={{ fontSize: "2.8rem", fontWeight: 800, color: "#10b981", letterSpacing: "-1px" }}>ChefIA</span>
              <span className="header-subtitle" style={{ fontSize: "0.85rem", color: theme.textMuted, fontFamily: "'Fira Code', monospace", letterSpacing: "1px", fontWeight: 600 }}>COMPILADOR DE RECETAS v1.0</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              className="dark-mode-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              style={{
                background: "transparent", border: "none", fontSize: "1.8rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.2s", padding: 0
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <p className="university-text" style={{ color: theme.textMutedLight, fontSize: "0.95rem", margin: 0, fontStyle: "italic", fontWeight: 500 }}>
            Lenguajes y Autómatas II — Instituto Tecnológico de Tijuana
          </p>
        </div>
      </div>

      {/* ── Navegación ── */}
      <div style={{
        background: theme.bgPanel,
        borderBottom: `1px solid ${theme.border}`,
        padding: "0 2.5rem",
        display: "flex",
        justifyContent: "center",
        gap: "2rem",
        transition: "background 0.3s, border-color 0.3s"
      }}>
        {[
          { id: "generator", icon: "✨", label: "Generador IA" },
          { id: "compiler", icon: "⚙️", label: "Compilador y Precios" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAppView(tab.id)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: appView === tab.id ? `3px solid ${theme.btnPrimaryBg}` : "3px solid transparent",
              color: appView === tab.id ? theme.btnPrimaryBg : theme.textMuted,
              padding: "1rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── VISTA GENERADOR DE RECETAS ── */}
      {appView === "generator" && (
        <div className="main-container" style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 2.5rem", width: "100%", boxSizing: "border-box" }}>
          <div style={{ background: theme.bgPanel, padding: "2.5rem", borderRadius: "12px", border: `1px solid ${theme.border}`, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", transition: "background 0.3s, border-color 0.3s" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: theme.btnPrimaryBg, marginTop: 0, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ✨ Generador de Recetas con IA
            </h2>
            <p style={{ color: theme.textMuted, fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
              Ingresa el platillo que deseas preparar y el número de comensales. Nuestra IA especializada generará la lista exacta de ingredientes para que luego puedas compilarla y obtener los precios en tiempo real.
            </p>

            <div className="ai-input-grid" style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "1.5rem", marginBottom: "2rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: theme.textSub, marginBottom: "0.5rem" }}>¿Qué platillo deseas preparar?</label>
                <input type="text" placeholder="Ej. Tacos al pastor" value={dishName} onChange={e => setDishName(e.target.value)} style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: `1px solid ${theme.emptyBorder}`, background: theme.inputBg, color: theme.inputText, outline: "none", boxSizing: "border-box", transition: "background 0.3s, color 0.3s, border-color 0.3s", fontSize: "1rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: theme.textSub, marginBottom: "0.5rem" }}>Nº Personas</label>
                <input type="number" min="1" value={peopleCount} onChange={e => setPeopleCount(e.target.value)} style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: `1px solid ${theme.emptyBorder}`, background: theme.inputBg, color: theme.inputText, outline: "none", boxSizing: "border-box", transition: "background 0.3s, color 0.3s, border-color 0.3s", fontSize: "1rem" }} />
              </div>
            </div>

            <button onClick={generateRecipe} disabled={isGenerating} style={{
              width: "100%", background: isGenerating ? theme.textMutedLight : theme.btnDarkBg, color: "#ffffff", border: "none", borderRadius: "8px",
              padding: "1rem", cursor: isGenerating ? "not-allowed" : "pointer",
              fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "transform 0.2s, background 0.2s"
            }}
              onMouseOver={e => !isGenerating && (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseOut={e => !isGenerating && (e.currentTarget.style.transform = "translateY(0)")}
            >
              {isGenerating ? "◌ Investigando ingredientes..." : "✧ Consultar a la IA"}
            </button>

            <div style={{ marginTop: "2.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 700, color: theme.textSub, marginBottom: "0.75rem", fontFamily: "'Fira Code', monospace" }}>
                <span>📋</span> RECETA GENERADA (EDITABLE)
              </label>
              <textarea
                className="code-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                spellCheck="false"
                style={{
                  width: "100%", height: 250, background: theme.codeBg, border: `1px solid ${theme.border}`,
                  borderRadius: "8px", color: theme.inputText, fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontSize: "0.9rem", padding: "1.25rem", resize: "vertical", outline: "none",
                  lineHeight: 1.7, boxSizing: "border-box", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                  transition: "background 0.3s, color 0.3s, border-color 0.3s"
                }}
                placeholder="Aquí aparecerá la receta... (También puedes editarla antes de compilarla)"
              />
            </div>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setAppView("compiler")}
                style={{
                  background: theme.btnPrimaryBg, color: "#ffffff", border: "none", borderRadius: "8px",
                  padding: "0.8rem 1.5rem", cursor: "pointer",
                  fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s",
                  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                }}
                onMouseOver={e => { e.currentTarget.style.background = theme.btnPrimaryHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.background = theme.btnPrimaryBg; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Llevar al Compilador ➡️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VISTA COMPILADOR Y PRECIOS ── */}
      {appView === "compiler" && (
        <div className="main-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2.5rem", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", boxSizing: "border-box" }}>

          {/* Panel izquierdo: Input */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: theme.textSub, marginBottom: "0.75rem", fontFamily: "'Fira Code', monospace" }}>
              <span style={{ color: theme.textMutedLight }}>{'</>'}</span> CÓDIGO FUENTE
            </label>
            <div style={{ position: "relative", flex: 1, display: "flex" }}>
              <textarea
                className="code-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                spellCheck="false"
                style={{
                  width: "100%", height: "100%", minHeight: 280, background: theme.codeBg, border: `1px solid ${theme.border}`,
                  borderRadius: "8px", color: theme.inputText, fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontSize: "0.85rem", padding: "1rem", resize: "vertical", outline: "none",
                  lineHeight: 1.7, boxSizing: "border-box", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                  transition: "background 0.3s, color 0.3s, border-color 0.3s"
                }}
                placeholder="Ingredientes generados o manuales..."
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", fontFamily: "system-ui, sans-serif" }}>
              <button
                onClick={compile}
                disabled={loadingCatalog}
                style={{
                  flex: 1, background: loadingCatalog ? theme.textSub : theme.btnPrimaryBg,
                  color: loadingCatalog ? theme.textMuted : "#ffffff", border: "none", borderRadius: "6px",
                  padding: "0.75rem 1rem", cursor: loadingCatalog ? "not-allowed" : "pointer",
                  fontSize: "0.85rem", fontWeight: 700, letterSpacing: "1px",
                  boxShadow: loadingCatalog ? "none" : "0 2px 4px rgba(16, 185, 129, 0.2)", transition: "background 0.2s, transform 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                }}
                onMouseOver={e => !loadingCatalog && (e.currentTarget.style.background = theme.btnPrimaryHover, e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseOut={e => !loadingCatalog && (e.currentTarget.style.background = theme.btnPrimaryBg, e.currentTarget.style.transform = "translateY(0)")}
              >
                {loadingCatalog ? "⏳ CARGANDO PRECIOS..." : "▶ COMPILAR"}
              </button>
            </div>

            {/* Pipeline status */}
            {phase && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: 700, letterSpacing: "1px", marginBottom: "0.75rem" }}>
                  PIPELINE
                </div>
                {[
                  { id: "lexer", label: "Fase 1: Análisis Léxico", icon: "🔍" },
                  { id: "parser", label: "Fase 2: Análisis Sintáctico", icon: "🌲" },
                  { id: "semantic", label: "Fase 3: Análisis Semántico", icon: "💡" },
                ].map((p, idx) => {
                  const phases = ["lexer", "parser", "semantic"];
                  const myIdx = phases.indexOf(p.id);
                  const curIdx = phases.indexOf(phase);
                  const done = curIdx >= myIdx && phase !== "compiling";
                  const active = phase === p.id || (phase === "compiling" && myIdx === 0);

                  return (
                    <div key={p.id} className="pipeline-step" style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.6rem 1rem", marginBottom: "0.5rem",
                      background: done || active ? theme.pipelineBgDone : theme.pipelineBgWait,
                      border: `1px solid ${done ? "#10b981" : active ? "#34d399" : theme.border}`,
                      boxShadow: done || active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                      borderRadius: "8px", transition: "all 0.3s"
                    }}>
                      <span style={{ color: done ? "#10b981" : active ? "#34d399" : theme.textSub }}>
                        {done ? "✓" : active ? "◌" : "○"}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: done || active ? 600 : 500, color: done || active ? theme.textMain : theme.textMuted }}>
                        {p.icon} {p.label}
                      </span>
                      {done && (
                        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
                          {p.id === "lexer" ? `${tokens.filter(t => t.type !== "EOF").length} tokens` :
                            p.id === "parser" ? `${ast.length} ingredientes` :
                              `${shopping.length} ítems`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel derecho: Output */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {phase === "semantic" ? (
              <div className="output-panel-container" style={{ background: theme.bgPanel, borderRadius: "12px", border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", transition: "background 0.3s, border-color 0.3s" }}>
                {/* Tabs */}
                <div className="tabs-container" style={{ display: "flex", gap: "0.5rem", borderBottom: `1px solid ${theme.border}`, paddingBottom: "1rem", marginBottom: "1.5rem", transition: "border-color 0.3s" }}>
                  {[
                    { id: "lexer", label: "Léxico" },
                    { id: "parser", label: "Sintáctico" },
                    { id: "semantic", label: "Lista de Compras" },
                  ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                      background: activeTab === t.id ? theme.btnPrimaryBg : theme.tabBgInactive,
                      border: "none", borderRadius: "6px",
                      color: activeTab === t.id ? "#ffffff" : theme.tabTextInactive,
                      padding: "0.4rem 0.8rem", cursor: "pointer",
                      fontSize: "0.75rem", fontWeight: 600, transition: "all 0.2s"
                    }}>
                      {t.label.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflow: "auto" }}>
                  {/* Léxico Tab */}
                  {activeTab === "lexer" && (
                    <div>
                      <table className="output-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Fira Code', monospace", fontSize: "0.75rem" }}>
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${theme.border}`, color: theme.textMuted, textAlign: "left" }}>
                            <th style={{ padding: "0.5rem", fontWeight: 700 }}>TIPO</th>
                            <th style={{ padding: "0.5rem", fontWeight: 700 }}>VALOR</th>
                            <th style={{ padding: "0.5rem", fontWeight: 700 }}>L</th>
                            <th style={{ padding: "0.5rem", fontWeight: 700 }}>C</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokens.filter(t => t.type !== "EOF").map((t, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${theme.tableRowBorder}` }}>
                              <td style={{ padding: "0.5rem", color: TOKEN_COLORS[t.type] || theme.textMain, fontWeight: 600 }}>
                                {t.type}
                              </td>
                              <td style={{ padding: "0.5rem", color: theme.textSub }}>
                                {t.type === "NEWLINE" ? "↵" : `'${t.value}'`}
                              </td>
                              <td style={{ padding: "0.5rem", color: theme.textMutedLight }}>{t.line}</td>
                              <td style={{ padding: "0.5rem", color: theme.textMutedLight }}>{t.col}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Parser Tab */}
                  {activeTab === "parser" && (
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.8rem" }}>
                      <div style={{ color: "#a855f7", marginBottom: "0.5rem", fontWeight: 600 }}>ProgramNode</div>
                      <div style={{ color: "#c084fc", marginLeft: "1rem", marginBottom: "0.5rem" }}>└─ RecipeNode</div>
                      {ast.map((ing, i) => (
                        <div key={i} style={{ marginLeft: "2rem", marginBottom: "0.75rem" }}>
                          <div style={{ color: "#3b82f6", fontWeight: 600 }}>
                            {i === ast.length - 1 ? "└─" : "├─"} IngredientNode
                          </div>
                          <div style={{ marginLeft: "2rem", marginTop: "0.2rem" }}>
                            <div style={{ color: "#f59e0b" }}>├─ QuantityNode: <span style={{ color: theme.textSub }}>{ing.qty.str}</span></div>
                            <div style={{ color: "#10b981" }}>├─ UnitNode:     <span style={{ color: theme.textSub }}>{ing.unit || "(sin unidad)"}</span></div>
                            <div style={{ color: "#3b82f6" }}>└─ NameNode:     <span style={{ color: theme.textSub }}>{ing.name}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shopping Tab */}
                  {activeTab === "semantic" && (
                    <div>
                      <table className="output-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ color: theme.textMuted, borderBottom: `2px solid ${theme.border}` }}>
                            <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: 700 }}>INGREDIENTE</th>
                            <th style={{ padding: "0.5rem", textAlign: "right", fontWeight: 700 }}>TOTAL</th>
                            <th style={{ padding: "0.5rem", textAlign: "center", fontWeight: 700 }}>PRES.</th>
                            <th style={{ padding: "0.5rem", textAlign: "right", fontWeight: 700 }}>PRECIO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shopping.map((item, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${theme.tableRowBorder}` }}>
                              <td style={{ padding: "0.75rem 0.5rem", color: item.found ? theme.textMain : theme.textMutedLight, fontWeight: 600 }}>
                                {item.found ? "" : "⚠ "}{item.displayName}
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem", color: theme.textMuted, textAlign: "right" }}>
                                {item.qtyBase.toFixed(1)} {item.baseUnit}
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem", color: theme.textMutedLight, textAlign: "center", fontSize: "0.8rem" }}>
                                {item.presentation} ×{item.unitsNeeded}
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem", color: theme.totalTextDark, textAlign: "right", fontWeight: 700 }}>
                                ${item.totalPrice.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Total Box */}
                {activeTab === "semantic" && (
                  <div className="total-box" style={{
                    marginTop: "1.5rem", padding: "1.25rem 1.5rem",
                    background: theme.totalBoxBg, border: `1px solid ${theme.border}`,
                    borderRadius: "8px", display: "flex", justifyContent: "space-between",
                    alignItems: "center", transition: "background 0.3s, border-color 0.3s"
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#10b981", letterSpacing: "1px" }}>TOTAL ESTIMADO</div>
                      <div style={{ color: theme.textMuted, fontSize: "0.7rem", fontWeight: 500, marginTop: "0.2rem" }}>Includes local VAT</div>
                    </div>
                    <div style={{ fontSize: "1.8rem", color: theme.totalTextDark, fontWeight: 800 }}>
                      <span style={{ fontSize: "1.2rem", color: theme.textMuted, marginRight: "0.2rem" }}>$</span>
                      {total.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                height: "100%", width: "100%", minHeight: 400, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", color: theme.textMuted,
                border: `2px dashed ${theme.emptyBorder}`, borderRadius: "12px", background: theme.emptyBg,
                transition: "background 0.3s, color 0.3s, border-color 0.3s"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem", filter: "grayscale(1)", opacity: 0.3 }}>🍳</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "1px", color: theme.textSub }}>
                  {phase === "compiling" ? "COMPILANDO..." : "ESPERANDO COMPILACIÓN"}
                </div>
                {!phase && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: theme.textMutedLight }}>
                    Presiona ▶ COMPILAR para iniciar
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="app-footer" style={{ borderTop: `1px solid ${theme.border}`, padding: "1.5rem 2.5rem", textAlign: "center", background: theme.bgPanel, marginTop: "auto", transition: "background 0.3s, border-color 0.3s" }}>
        <span style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "1.5px", fontWeight: 600 }}>
          SERNA SAUCEDA J.E. • HERNANDEZ BOJORQUEZ U. • LENGUAJES Y AUTÓMATAS II — 2026
        </span>
      </div>
    </div>
  );
}
