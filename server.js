const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Added for proxying

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
});

// Proxy para evitar CORS - BARRIDO DINÁMICO MULTIDEPORTE + NORMALIZADOR DE CUOTAS
app.get('/api/top-events', async (req, res) => {
    try {
        console.log('🔄 Iniciando barrido exclusivo de Fútbol, Béisbol y Baloncesto...');
        
        const headers = {
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
        };

        // 1. DEPORTES RESTRINGIDOS: Solo Fútbol (66), Baloncesto (67) y Béisbol (76)
        const sportIds = [66, 67, 76];

        // Mapas para fusionar TODOS los datos sin duplicados
        const eventMap = new Map();
        const marketMap = new Map();
        const oddMap = new Map();
        const dateMap = new Map();
        const competitorMap = new Map();
        const sportMap = new Map();
        const categoryMap = new Map();
        const champMap = new Map();

        const processData = (data) => {
            if (!data) return;
            if (data.events) data.events.forEach(e => eventMap.set(e.id, e));
            if (data.markets) data.markets.forEach(m => marketMap.set(m.id, m));
            if (data.odds) data.odds.forEach(o => oddMap.set(o.id, o));
            if (data.competitors) data.competitors.forEach(c => competitorMap.set(c.id, c));
            if (data.sports) data.sports.forEach(s => sportMap.set(s.id, s));
            if (data.categories) data.categories.forEach(c => categoryMap.set(c.id, c));
            if (data.championships) data.championships.forEach(c => champMap.set(c.id, c));
            
            if (data.dates) {
                data.dates.forEach(d => {
                    if (!dateMap.has(d.dateTime)) {
                        dateMap.set(d.dateTime, { dateTime: d.dateTime, eventIds: new Set() });
                    }
                    d.eventIds.forEach(id => dateMap.get(d.dateTime).eventIds.add(id));
                });
            }
        };

        // 2. HACER BARRIDO DE EVENTOS POR CADA DEPORTE (En Vivo y Próximos)
        const fetchPromises = sportIds.map(async (sportId) => {
            const liveUrl = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetLivenow?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&eventCount=0&sportId=${sportId}`;
            const upcomingUrl = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetCouponEvents?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&playerRegDate=2025-09-24T15%3A32%3A12.67&eventCount=0&sportId=${sportId}&couponType=8`;
            
            try {
                const [liveRes, upcomingRes] = await Promise.all([
                    fetch(liveUrl, { method: 'GET', headers }).catch(() => null),
                    fetch(upcomingUrl, { method: 'GET', headers }).catch(() => null)
                ]);

                if (liveRes && liveRes.ok) {
                    const liveData = await liveRes.json().catch(() => null);
                    processData(liveData);
                }
                
                if (upcomingRes && upcomingRes.ok) {
                    const upcomingData = await upcomingRes.json().catch(() => null);
                    processData(upcomingData);
                }
            } catch (err) {
                console.error(`Error procesando deporte ID ${sportId}:`, err.message);
            }
        });

        await Promise.all(fetchPromises);

        const combinedData = {
            events: Array.from(eventMap.values()),
            markets: Array.from(marketMap.values()),
            odds: Array.from(oddMap.values()),
            competitors: Array.from(competitorMap.values()),
            sports: Array.from(sportMap.values()),
            categories: Array.from(categoryMap.values()),
            championships: Array.from(champMap.values()),
            dates: []
        };

        console.log(`📊 Data total extraída: ${combinedData.events.length} eventos (Fútbol, Basket, Béisbol).`);
        
        // =========================================================
        // 3. NORMALIZADOR INTELIGENTE DE CUOTAS PARA EL FRONTEND
        // =========================================================
        console.log('🔧 Normalizando mercados para el frontend...');
        
        combinedData.markets.forEach(market => {
            const mName = market.name?.toLowerCase() || '';
            
            const isWinnerMarket = market.typeId === 1 || market.typeId === 11 || 
                                   mName.includes('ganador') || 
                                   mName.includes('money line') ||
                                   mName.includes('moneyline') ||
                                   mName === '1x2';
                                   
            if (isWinnerMarket) {
                market.typeId = 1; 
                
                let id1 = null, idX = null, id2 = null;
                
                market.oddIds.forEach(oddId => {
                    const odd = combinedData.odds.find(o => o.id === oddId);
                    if (odd) {
                        if (odd.typeId === 1) id1 = oddId;
                        else if (odd.typeId === 2) idX = oddId;
                        else if (odd.typeId === 3) id2 = oddId;
                    }
                });
                
                if (!id1 && !idX && !id2 && market.oddIds.length > 0) {
                    id1 = market.oddIds[0];
                    if (market.oddIds.length > 1) id2 = market.oddIds[market.oddIds.length - 1];
                }
                
                if (!id1) {
                    const f = 7770000000 + market.id;
                    combinedData.odds.push({ id: f, typeId: 1, price: 0.00, name: "1" });
                    id1 = f;
                }
                if (!idX) {
                    const f = 7771000000 + market.id;
                    combinedData.odds.push({ id: f, typeId: 2, price: 0.00, name: "X" });
                    idX = f;
                }
                if (!id2) {
                    const f = 7772000000 + market.id;
                    combinedData.odds.push({ id: f, typeId: 3, price: 0.00, name: "2" });
                    id2 = f;
                }
                
                market.oddIds = [id1, idX, id2];
            }
            
            const isDoubleChance = market.typeId === 2 || market.typeId === 10 || 
                                   mName.includes('doble') || mName.includes('double');
                                   
            if (isDoubleChance) {
                market.typeId = 2; 
                
                let id1X = null, id12 = null, id2X = null;
                
                market.oddIds.forEach(oddId => {
                    const odd = combinedData.odds.find(o => o.id === oddId);
                    if (odd) {
                        if (odd.typeId === 9) id1X = oddId;
                        else if (odd.typeId === 10) id12 = oddId;
                        else if (odd.typeId === 11) id2X = oddId;
                    }
                });
                
                if (!id1X && !id12 && !id2X && market.oddIds.length >= 3) {
                    id1X = market.oddIds[0];
                    id12 = market.oddIds[1];
                    id2X = market.oddIds[2];
                }
                
                if (!id1X) {
                    const f = 8880000000 + market.id;
                    combinedData.odds.push({ id: f, typeId: 9, price: 0.00, name: "1X" });
                    id1X = f;
                }
                if (!id12) {
                    const f = 8881000000 + market.id;
                    combinedData.odds.push({ id: f, typeId: 10, price: 0.00, name: "12" });
                    id12 = f;
                }
                if (!id2X) {
                    const f = 8882000000 + market.id;
                    combinedData.odds.push({ id: f, typeId: 11, price: 0.00, name: "2X" });
                    id2X = f;
                }
                
                market.oddIds = [id1X, id12, id2X];
            }
        });

        // =========================================================
        // FILTRO ESTRICTO: SOLO EL DÍA EN CURSO (HOY EN VENEZUELA)
        // =========================================================
        console.log('🔍 Aplicando filtro: SOLO PARTIDOS DE HOY (Hora Venezuela)...');
        
        const caracasTimeString = new Date().toLocaleString("en-US", {timeZone: "America/Caracas"});
        const todayCaracas = new Date(caracasTimeString);
        
        const todayStart = new Date(todayCaracas.getFullYear(), todayCaracas.getMonth(), todayCaracas.getDate(), 0, 0, 0);
        const todayEnd = new Date(todayCaracas.getFullYear(), todayCaracas.getMonth(), todayCaracas.getDate(), 23, 59, 59);
        
        Array.from(dateMap.values()).forEach(dateGroup => {
            if (!dateGroup.dateTime) return;
            
            let dateString = dateGroup.dateTime;
            if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-')) {
                dateString += 'Z';
            }
            
            const eventDateUTC = new Date(dateString);
            const eventDateCaracas = new Date(eventDateUTC.toLocaleString("en-US", {timeZone: "America/Caracas"}));
            
            if (eventDateCaracas >= todayStart && eventDateCaracas <= todayEnd) {
                combinedData.dates.push({
                    dateTime: dateGroup.dateTime,
                    eventIds: Array.from(dateGroup.eventIds)
                });
            }
        });
        
        const totalEvents = combinedData.dates.reduce((sum, dateGroup) => sum + (dateGroup.eventIds?.length || 0), 0);
        console.log(`🎉 Filtro aplicado: ${totalEvents} eventos para el DÍA EN CURSO en Venezuela.`);
        
        res.json(combinedData);
        
    } catch (error) {
        console.error('❌ Error general:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Endpoint para obtener detalles de un evento específico
app.get('/api/event-details/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const upstream = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetEventDetails?eventId=${eventId}&culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE`;
    
    try {
        const r = await fetch(upstream, {
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
        const ct = r.headers.get('content-type') || '';
        res.status(r.status);
        if (ct.includes('application/json')) res.json(await r.json());
        else res.type(ct).send(await r.text());
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

// Endpoint para procesar apuestas
app.post('/api/place-bet', express.json(), async (req, res) => {
    try {
        const betData = req.body;
        
        if (!betData.betslip || betData.betslip.length === 0) {
            return res.status(400).json({ 
                error: 'Datos de apuesta inválidos',
                message: 'No se encontró el campo betslip'
            });
        }
        
        const apiPayload = {
            culture: betData.culture || "es-ES",
            timezoneOffset: betData.timezoneOffset || 240,
            integration: betData.integration || "camanbet",
            deviceType: betData.deviceType || 1,
            numFormat: betData.numFormat || "en-GB",
            countryCode: betData.countryCode || "VE",
            betslip: betData.betslip
        };
        
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

// Ruta de fallback para SPA
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
});

app.listen(PORT, () => {
    console.log(`✅ Servidor iniciado en puerto ${PORT}`);
});