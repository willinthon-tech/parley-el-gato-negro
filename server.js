const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Added for proxying

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
});

// Proxy para evitar CORS para la API de eventos
app.get('/api/top-events', async (req, res) => {
    try {
        // Proxying external API call to avoid CORS
        const response = await fetch('https://sb2frontend-altenar2.biahosted.com/api/widget/GetCouponEvents?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&playerRegDate=2025-09-24T15%3A32%3A12.67&eventCount=0&sportId=66&period=5&couponType=1', {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'accept-language': 'es-ES,es;q=0.9',
                'authorization': 'V2xoc1MyRkhTa2haTW14UVlWVndTbFpZY0VwTlZUVndVMWhPU21Kc1NURlpNRTVLVG10c2NtTkdhRmRSTUc4MVRHMVdOVk51UW1wUk1Hc3lVMWR3Ums1Vk1VUk9SRTVPWVZSU05GUlZVa3BrVlRGeFVsaGtTbUZZWkhCWGEyTTFaRVpzV0dKSVZrcGhiVGx3V1ZWb1UwMUhUa2xVVkZwTlpWUnNjVmRXWTNoaFIwcHdUbFJLYUZkRlJuQlVSVTVMWTBkS2RWVnRlR0ZOTUhCdldrVmtjMlJ0U25CVFZGcEtZbFUxYjFsc1pFZGtWbXgwVm1wQ1NtRllaSEJhUm1oUFlrZE9jbEp0TldGV2VsVjNVMWR3ZG1GV1VsaFBWRnBvVmpOb2VsZFdUVFJOVlhoeFVWZGtURkp0VW5kWmJURlRaRzFSZWxSWFpGVmlSa1p1VkZaU1FtUlZNVVZqTW1SWFRXMTRNVlJ0Y0ZKT01HeEpXbnBLVDFFeWRHNVZWbWhEWkRKS1NGWnNhR0ZXTUhCTldWWm9VbVJyTlZWVVZFNU5ZV3N3ZVZOVlRtOVVSazVIVldzMVZWRXpaRzVaYTJSelkyeHdWRkZyYUdGV01EVjVXVzVzY2xveFJYbGhTR3hwVFdwR2MxUkljRVpOUlRGRVRraGtUV0ZyUmpGVVZVNURWa1pzV0ZkdGFHcGlWM1F5Vkd4U1RrMHdlSEZVVkVwS1lWaGtjRmxxVGs1aFZUbHdVMjFPU21KSFVuZFpiVEZUWkcxUmVsUnRUa3BoVld4NlUxY3hWMDVIVGtSVFZGcE9Wa2ROZUZRd1VuSk5hekZGVkZoc1QxTkVRWFZOYlRWdVdtcGtNbFJGVGtsaU1IYzFXbGRrVkdSV1FYaFVNbEpNWWpGV2VsTXpRbXBhVlZZMFpGaEdVRk13YkZaUFV6RlpZVWRWZDA1QlBUMD0=',
                'dnt': '1',
                'origin': 'https://caman.vip',
                'priority': 'u=1, i',
                'referer': 'https://caman.vip/',
                'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // Error fetching external API
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Endpoint para procesar apuestas - Proxy al endpoint real
app.post('/api/place-bet', express.json(), async (req, res) => {
    try {
        const betData = req.body;
        
        // Validar datos recibidos - nuevo formato
        if (!betData.betslip) {
            return res.status(400).json({ 
                error: 'Datos de apuesta inválidos',
                message: 'No se encontró el campo betslip'
            });
        }
        
        // Validar que el betslip no esté vacío
        if (!betData.betslip || betData.betslip.length === 0) {
            return res.status(400).json({ 
                error: 'Datos de apuesta inválidos',
                message: 'El campo betslip está vacío'
            });
        }
        
        
        // El frontend ya envía el formato correcto, solo reenviar al endpoint externo
        const apiPayload = {
            culture: betData.culture || "es-ES",
            timezoneOffset: betData.timezoneOffset || 240,
            integration: betData.integration || "camanbet",
            deviceType: betData.deviceType || 1,
            numFormat: betData.numFormat || "en-GB",
            countryCode: betData.countryCode || "VE",
            betslip: betData.betslip
        };
        
        // Enviar petición al endpoint real
        const response = await fetch('https://sb2betslip-altenar2.biahosted.com/api/Betslip/reserveBet', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'accept-language': 'es-ES,es;q=0.9',
                'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDb25maWd1cmF0aW9uSWQiOiIxMiIsIlBlcnNvblR5cGUiOiIzIiwiUGVyc29uSWQiOiI2NTE0MDA3NyIsIlVzZXJOYW1lIjoiVXN1YXJpbzExMTU0Mzk3IiwiTG9naW5JZCI6IjczMTUxNjg1IiwiQ3VycmVuY3lTaWduIjoiVkVTIiwiTWluQm9udXNQcmljZSI6IjEuMiIsIkJvbnVzVGVtcGxhdGVJZCI6IjMwNSIsIkN1cnJlbmN5SWQiOiI5MjgiLCJDdXJyZW5jeUNvZGUiOiJWRVMiLCJDb3VudHJ5Q29kZSI6IlZFIiwiQnJhbmRJZCI6IjQ4NyIsIkNsaWVudElQIjoiMTkwLjcyLjEwMi4yMTAiLCJleHAiOjE3NTg5NjA1MDksImlzcyI6IlNCMiIsImF1ZCI6IlNCMiJ9.RnpHbbFWYzFZ7WQjmXv0HBsadA9LAC7jxFLw_NhZvDU',
                'content-type': 'application/json',
                'dnt': '1',
                'origin': 'https://caman.vip',
                'priority': 'u=1, i',
                'referer': 'https://caman.vip/',
                'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(apiPayload)
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        
        
        // Respuesta exitosa
        res.json({
            success: true,
            transactionId: result.transactionId || `TXN_${Date.now()}`,
            apiResponse: result,
            message: 'Apuesta procesada exitosamente en el servidor real',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al procesar la apuesta',
            message: error.message,
            details: 'No se pudo conectar con el servidor de apuestas'
        });
    }
});

// Ruta de fallback para SPA - cualquier ruta no encontrada sirve index.html
// DEBE ir al final, después de todas las rutas de API
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
});

app.listen(PORT, () => {
    // Servidor iniciado
});