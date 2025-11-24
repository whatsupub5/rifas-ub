# 🤖 Guía de Integración de APIs de IA - RIFAS UBIA

## 📋 Proveedores de IA Soportados

### ✅ Implementados (Simulados)
- ChatGPT (OpenAI)
- Google Gemini
- Microsoft Copilot
- DALL-E (Generación de Imágenes)
- Midjourney
- Stable Diffusion

---

## 🔌 Integración con APIs Reales

### 1. OpenAI (ChatGPT + DALL-E)

#### Configuración:
```javascript
// En js/ai-generator.js, reemplaza simulateImageGeneration con:

async function generateImageWithOpenAI(prompt, style, size, quality) {
    const API_KEY = 'sk-...'; // Tu API key de OpenAI
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            size: size,
            quality: quality,
            n: 1
        })
    });
    
    const data = await response.json();
    return data.data[0].url;
}
```

#### Para Chat:
```javascript
async function getAIResponseWithOpenAI(message) {
    const API_KEY = 'sk-...';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'Eres un asistente experto en rifas y marketing digital.' },
                ...chatHistory.map(h => ({ 
                    role: h.type === 'user' ? 'user' : 'assistant', 
                    content: h.message 
                })),
                { role: 'user', content: message }
            ],
            temperature: 0.7
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

---

### 2. Google Gemini

#### Configuración:
```javascript
async function generateImageWithGemini(prompt, style, size, quality) {
    const API_KEY = '...'; // Tu API key de Google AI
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:generateImages?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                number_of_images: 1,
                aspect_ratio: size
            })
        }
    );
    
    const data = await response.json();
    return data.generatedImages[0].imageUrl;
}
```

#### Para Chat:
```javascript
async function getAIResponseWithGemini(message) {
    const API_KEY = '...';
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        }
    );
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
```

---

### 3. Microsoft Copilot / Azure OpenAI

#### Configuración:
```javascript
async function getAIResponseWithCopilot(message) {
    const ENDPOINT = 'https://YOUR_RESOURCE.openai.azure.com/';
    const API_KEY = '...';
    const DEPLOYMENT_NAME = 'gpt-4';
    
    const response = await fetch(`${ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': API_KEY
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'Eres un asistente experto en rifas.' },
                { role: 'user', content: message }
            ]
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

---

### 4. Stable Diffusion

#### Configuración:
```javascript
async function generateImageWithStableDiffusion(prompt, style, size, quality) {
    const API_KEY = '...'; // Tu API key de Stability AI
    
    const [width, height] = size.split('x');
    
    const response = await fetch(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: parseInt(height),
                width: parseInt(width),
                steps: 30,
                samples: 1
            })
        }
    );
    
    const data = await response.json();
    // Stable Diffusion devuelve base64, necesitas convertirlo
    return `data:image/png;base64,${data.artifacts[0].base64}`;
}
```

---

### 5. Generación de Videos

#### Runway ML:
```javascript
async function generateVideoWithRunway(prompt, duration, resolution, style) {
    const API_KEY = '...';
    
    const response = await fetch('https://api.runwayml.com/v1/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            duration: duration,
            resolution: resolution,
            style: style
        })
    });
    
    const data = await response.json();
    return data.video_url;
}
```

#### Pika Labs:
```javascript
async function generateVideoWithPika(prompt, duration, resolution) {
    const API_KEY = '...';
    
    const response = await fetch('https://api.pika.art/v1/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            duration: duration,
            resolution: resolution
        })
    });
    
    const data = await response.json();
    return data.video_url;
}
```

---

## 🔐 Seguridad de API Keys

### ⚠️ IMPORTANTE: No expongas tus API keys en el código frontend

**Opción 1: Backend Proxy (Recomendado)**
```javascript
// En lugar de llamar directamente a la API:
async function generateImage(prompt) {
    // Llama a tu backend
    const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    return data.imageUrl;
}
```

**Opción 2: Variables de Entorno**
```javascript
// Crea un archivo .env (NO subir a Git)
const API_KEYS = {
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    // ...
};
```

---

## 📝 Ejemplo de Implementación Completa

```javascript
// js/ai-generator.js - Función mejorada

async function generateImage() {
    const prompt = document.getElementById('imagePrompt').value;
    const style = document.getElementById('imageStyle').value;
    const size = document.getElementById('imageSize').value;
    const quality = document.getElementById('imageQuality').value;
    
    // Show loading
    showLoadingState();
    
    try {
        let imageUrl;
        
        // Route to correct API based on selected provider
        switch(selectedProvider) {
            case 'openai':
            case 'dalle':
                imageUrl = await generateImageWithOpenAI(prompt, style, size, quality);
                break;
            case 'stable-diffusion':
                imageUrl = await generateImageWithStableDiffusion(prompt, style, size, quality);
                break;
            case 'gemini':
                imageUrl = await generateImageWithGemini(prompt, style, size, quality);
                break;
            default:
                throw new Error('Proveedor no soportado');
        }
        
        displayGeneratedImage(imageUrl);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Error al generar la imagen. Verifica tu API key.');
    }
}
```

---

## 💰 Costos Aproximados

| Proveedor | Imágenes | Chat | Videos |
|-----------|----------|------|--------|
| OpenAI DALL-E | $0.04-0.12/imagen | $0.03/1K tokens | - |
| Stable Diffusion | $0.02-0.05/imagen | - | - |
| Google Gemini | Gratis (limitado) | Gratis (limitado) | - |
| Runway ML | - | - | $0.05/segundo |

---

## 🚀 Próximos Pasos

1. **Obtén API Keys:**
   - OpenAI: https://platform.openai.com/api-keys
   - Google AI: https://makersuite.google.com/app/apikey
   - Stability AI: https://platform.stability.ai/
   - Runway ML: https://runwayml.com/

2. **Crea un Backend:**
   - Node.js/Express
   - Python/Flask
   - Para manejar API keys de forma segura

3. **Implementa Rate Limiting:**
   - Limita el uso por usuario
   - Previene abuso

4. **Agrega Caché:**
   - Guarda resultados comunes
   - Reduce costos

---

## 📞 Soporte

Para más información sobre integración, consulta la documentación oficial de cada proveedor.

