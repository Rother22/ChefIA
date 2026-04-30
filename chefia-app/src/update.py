import codecs

file_path = r'c:\Trabajo\ChefIa\chefia-app\src\ChefIA_UI.jsx'
with codecs.open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

state_addition = """  const [activeTab, setActiveTab] = useState("lexer");

  // Modo Oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    codeBg: isDarkMode ? "#0f172a" : "white"
  };
"""

content = content.replace('  const [activeTab, setActiveTab] = useState("lexer");', state_addition)

def r(old, new):
    global content
    content = content.replace(old, new)


r('minHeight:"100vh", background:"#f4f5f7", color:"#1e293b",', 
  'minHeight:"100vh", background:theme.bgApp, color:theme.textMain, transition:"background 0.3s, color 0.3s",')

r('background:"#ffffff",\\n        borderBottom:"1px solid #e2e8f0", padding:"2rem 2.5rem 1.5rem",',
  'background:theme.bgPanel,\\n        borderBottom:`1px solid ${theme.border}`, padding:"2rem 2.5rem 1.5rem", transition:"background 0.3s, border-color 0.3s",')

original_title_area = '''          <div style={{ display:"flex", alignItems:"baseline", gap:"1rem", marginBottom:"0.25rem" }}>
            <span style={{ fontSize:"2.8rem", fontWeight:800, color:"#10b981", letterSpacing:"-1px" }}>ChefIA</span>
            <span style={{ fontSize:"0.85rem", color:"#64748b", fontFamily:"\'Fira Code\', monospace", letterSpacing:"1px", fontWeight:600 }}>COMPILADOR DE RECETAS v1.0</span>
          </div>
          <p style={{ color:"#94a3b8", fontSize:"0.95rem", margin:0, fontStyle:"italic", fontWeight:500 }}>
            Lenguajes y Autómatas II — Instituto Tecnológico de Tijuana
          </p>'''

new_title_area = '''          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.25rem" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:"1rem" }}>
              <span style={{ fontSize:"2.8rem", fontWeight:800, color:"#10b981", letterSpacing:"-1px" }}>ChefIA</span>
              <span style={{ fontSize:"0.85rem", color:theme.textMuted, fontFamily:"\'Fira Code\', monospace", letterSpacing:"1px", fontWeight:600 }}>COMPILADOR DE RECETAS v1.0</span>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              style={{
                background:"transparent", border:"none", fontSize:"1.8rem", cursor:"pointer",
                padding: 0, transition:"transform 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <p style={{ color:theme.textMutedLight, fontSize:"0.95rem", margin:0, fontStyle:"italic", fontWeight:500 }}>
            Lenguajes y Autómatas II — Instituto Tecnológico de Tijuana
          </p>'''
r(original_title_area, new_title_area)

r('background:"white"', 'background:theme.bgPanel')

# inputs background and colors
r('border:"1px solid #cbd5e1"', 'border:`1px solid ${theme.border}`, background:theme.inputBg, color:theme.inputText')
# textarea bg
r('background:theme.bgPanel, border:"1px solid #e2e8f0"', 'background:theme.codeBg, border:`1px solid ${theme.border}`')

# color replacements
r('color:"#64748b"', 'color:theme.textMuted')
r('color:"#475569"', 'color:theme.textSub')
r('color:"#94a3b8"', 'color:theme.textMutedLight')
r('color:"#334155"', 'color:theme.inputText')

# Action buttons
r('background: isGenerating ? "#94a3b8" : "#0f172a"', 'background: isGenerating ? theme.textMutedLight : theme.btnDarkBg')
r('background: loadingCatalog ? "#cbd5e1" : "#10b981",', 'background: loadingCatalog ? theme.textSub : theme.btnPrimaryBg,')
r('color: loadingCatalog ? "#475569" : "white"', 'color: loadingCatalog ? theme.textMuted : "#ffffff"')
r('onMouseOver={e => !loadingCatalog && (e.target.style.background="#059669")}', 'onMouseOver={e => !loadingCatalog && (e.target.style.background=theme.btnPrimaryHover)}')
r('onMouseOut={e => !loadingCatalog && (e.target.style.background="#10b981")}', 'onMouseOut={e => !loadingCatalog && (e.target.style.background=theme.btnPrimaryBg)}')
r('color:"white"', 'color:"#ffffff"')

# Pipelines
r('background: done || active ? theme.bgPanel : "#f8fafc"', 'background: done || active ? theme.pipelineBgDone : theme.pipelineBgWait')
r('border: `1px solid ${done ? "#10b981" : active ? "#34d399" : "#e2e8f0"}`', 'border: `1px solid ${done ? "#10b981" : active ? "#34d399" : theme.border}`')
r('color: done||active ? "#0f172a" : theme.textMuted', 'color: done||active ? theme.textMain : theme.textMuted')
r('color: done ? "#10b981" : active ? "#34d399" : "#cbd5e1"', 'color: done ? "#10b981" : active ? "#34d399" : theme.textSub')

# Panel derecho components
r('borderBottom:"1px solid #e2e8f0"', 'borderBottom:`1px solid ${theme.border}`')
r('border:"1px solid #e2e8f0"', 'border:`1px solid ${theme.border}`')

# Tabs
r('background: activeTab===t.id ? "#10b981" : "#f1f5f9"', 'background: activeTab===t.id ? theme.btnPrimaryBg : theme.tabBgInactive')
r('color: activeTab===t.id ? "#ffffff" : theme.textMuted', 'color: activeTab===t.id ? "#ffffff" : theme.tabTextInactive')

# Tables
r('borderBottom:"2px solid #e2e8f0"', 'borderBottom:`2px solid ${theme.border}`')
r('borderBottom:"1px solid #f1f5f9"', 'borderBottom:`1px solid ${theme.tableRowBorder}`')
r('color: TOKEN_COLORS[t.type] || theme.inputText', 'color: TOKEN_COLORS[t.type] || theme.textMain')

# Totals
r('color:"#0f172a"', 'color:theme.totalTextDark')
r('background:"#f8fafc"', 'background:theme.totalBoxBg')

# Empty state
r('border:"2px dashed #cbd5e1"', 'border:`2px dashed ${theme.emptyBorder}`')
r('background:theme.inputBg', 'background:theme.emptyBg')

# parser Output specific
r('color: item.found ? theme.inputText : theme.textMutedLight', 'color: item.found ? theme.textMain : theme.textMutedLight')

with codecs.open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python modification done.")
