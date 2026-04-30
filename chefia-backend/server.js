require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Soriana bloquea scraping con Cloudflare agresivo,
// usaremos el buscador público web de Bodega Aurrera (Walmart México)
// que es más tolerante a peticiones automatizadas simples y tiene precios muy precisos de México.
app.post('/api/precios', async (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ error: 'Se esperaba un array de ingredientes' });
    }

    console.log(`\n🔍 Buscando ${ingredients.length} ingredientes en Autosearch Aurrera...`);

    const catalog = {};

    for (const ingredient of ingredients) {
        console.log(`⏳ Cotizando: ${ingredient}...`);

        const query = encodeURIComponent(ingredient);
        // Endpoint público de sugerencias de Walmart/Aurrera México:
        const searchUrl = `https://www.bodegaaurrera.com.mx/api/v1/user/search?query=${query}&storeId=0000009999&page=1`;

        try {
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 10000
            });

            // Parsear el JSON devuelto por Aurrera
            const items = response.data?.item?.props?.pageProps?.initialData?.searchResult?.itemStacks?.[0]?.items || [];
            const primerProducto = items.find(i => i.price !== undefined);

            if (primerProducto) {
                const price = primerProducto.price;
                const title = primerProducto.name || "Producto Aurrera";

                let pUnit = "pza";
                let pres = "1 pieza";
                const titleLower = title.toLowerCase();

                if (titleLower.includes(' kg') || titleLower.includes(' kilo')) { pUnit = "kg"; pres = "1 kg"; }
                else if (titleLower.match(/\d+\s*g\b/)) { pUnit = "g"; const m = titleLower.match(/(\d+)\s*g\b/); pres = m ? `${m[1]} g` : "1 g"; }
                else if (titleLower.includes(' l ') || titleLower.includes(' litro') || titleLower.includes('lt')) { pUnit = "l"; pres = "1 L"; }
                else if (titleLower.match(/\d+\s*ml\b/)) { pUnit = "ml"; const m = titleLower.match(/(\d+)\s*ml\b/); pres = m ? `${m[1]} ml` : "1 ml"; }
                else if (titleLower.includes('manojo')) { pUnit = "manojo"; pres = "1 manojo"; }

                catalog[ingredient] = { price, pres, pUnit, _title: title };
                console.log(`✅ ${ingredient}: $${price} (${pres})`);
            } else {
                console.log(`❌ Sin precio para: ${ingredient}`);
            }

        } catch (err) {
            console.log(`❌ Fallo red para ${ingredient}: ${err.message}`);
        }
    }

    console.log("✨ Catálogo de Aurrera Devuelto");
    res.json(catalog);
});

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Falta el prompt' });
        }

        console.log("⏳ Consultando a Gemini...");

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
            }
        });

        res.json({ response: response.text });
    } catch (error) {
        console.error("Error connecting to Gemini:", error);
        res.status(500).json({ error: `Error conectando con Gemini API: ${error.message}` });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AXIOS Scraper (Aurrera/WM) corriendo en http://0.0.0.0:${PORT}`);
});
