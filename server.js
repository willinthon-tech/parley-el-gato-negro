const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
});

app.get('/api/top-events', async (req, res) => {
    try {
        console.log('🔄 Iniciando barrido y escáner profundo de Fútbol, Béisbol y Baloncesto...');
        
        const headers = {
            'accept': '*/*',
            'accept-language': 'es-ES,es;q=0.9',
            'authorization': 'V2xoc1MyRkhTa2haTW14UVlWVndTbFpZY0VwTlZUVndVMWhPU21Kc1NURlpNRTVLVG10c2NtTkdhRmRSTUc4MVRHMVdOVk51UW1wUk1Hc3lVMWR3Ums1Vk1VUk9SRTVPWVZSU05GUlZVa3BrVlRGeFVsaGtTbUZZWkhCWGEyTTFaRVpzV0dKSVZrcGhiVGx3V1ZWb1UwMUhUa2xVVkZwTlpWUnNjVmRXWTNoaFIwcHdUbFJLYUZkRlJuQlVSVTVMWTBkS2RWVnRlR0ZOTUhCdldrVmtjMlJ0U25CVFZGcEtZbFUxYjFsc1pFZGtWbXgwVm1wQ1NtRllaSEJhUm1oUFlrZE9jbEp0TldGV2VsVjNVMWR3ZG1GV1VsaFBWRnBvVmpOb2VsZFdUVFJOVlhoeFVWZGtURkp0VW5kWmJURlRaRzFSZWxSWFpGVmlSa1p1VkZaU1FtUlZNVVZqTW1SWFRXMTRNVlJ0Y0ZKT01HeEpXbnBLVDFFeWRHNVZWbWhEWkRKS1NGWnNhR0ZXTUhCTldWWm9VbVJyTlZWVVZFNU5ZV3N3ZVZOVlRtOVVSazVIVldzMVZWRXpaRzVaYTJSelkyeHdWRkZyYUdGV01EVjVXVzVzY2xveFJYbGhTR3hwVFdwR2MxUkljRVpOUlRGRVRraGtUV0ZyUmpGVVZVNURWa1pzV0ZkdGFHcGlWM1F5Vkd4U1RrMHdlSEZVVkVwS1lWaGtjRmxxVGs1aFZUbHdVMjFPU21KSFVuZFpiVEZUWkcxUmVsUnRUa3BoVld4NlUxY3hWMDVIVGtSVFZGcE9Wa2ROZUZRd1VuSk5hekZGVkZoc1QxTkVRWFZOYlRWdVdtcGtNbFJGVGtsaU1IYzFXbGRrVkdSV1FYaFVNbEpNWWpGV2VsTXpRbXBhVlZZMFpGaEdVRk13YkZaUFV6RlpZVWRWZDA1QlBUMD0=',
            'dnt': '1',
            'origin': 'https://caman.vip',
            'priority': 'u=1, i',
            'referer': 'https://caman.vip/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        };

        const sportIds = [66, 67, 76];
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

        // 1. CARGA INICIAL
        const fetchPromises = sportIds.map(async (sportId) => {
            const liveUrl = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetLivenow?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&eventCount=0&sportId=${sportId}`;
            const upcomingUrl = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetCouponEvents?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&eventCount=0&sportId=${sportId}&couponType=8`;
            
            try {
                const [liveRes, upcomingRes] = await Promise.all([
                    fetch(liveUrl, { method: 'GET', headers }).catch(() => null),
                    fetch(upcomingUrl, { method: 'GET', headers }).catch(() => null)
                ]);
                if (liveRes && liveRes.ok) processData(await liveRes.json().catch(() => null));
                if (upcomingRes && upcomingRes.ok) processData(await upcomingRes.json().catch(() => null));
            } catch (err) {}
        });

        await Promise.all(fetchPromises);

        // 2. FILTRAR ESTRICTAMENTE SOLO PARTIDOS DE HOY
        const caracasTimeString = new Date().toLocaleString("en-US", {timeZone: "America/Caracas"});
        const todayCaracas = new Date(caracasTimeString);
        const todayStart = new Date(todayCaracas.getFullYear(), todayCaracas.getMonth(), todayCaracas.getDate(), 0, 0, 0);
        const todayEnd = new Date(todayCaracas.getFullYear(), todayCaracas.getMonth(), todayCaracas.getDate(), 23, 59, 59);
        
        const finalDates = [];
        let todayEventIds = [];

        Array.from(dateMap.values()).forEach(dateGroup => {
            if (!dateGroup.dateTime) return;
            let dateString = dateGroup.dateTime;
            if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-')) dateString += 'Z';
            
            const eventDateUTC = new Date(dateString);
            const eventDateCaracas = new Date(eventDateUTC.toLocaleString("en-US", {timeZone: "America/Caracas"}));
            
            if (eventDateCaracas >= todayStart && eventDateCaracas <= todayEnd) {
                finalDates.push({ dateTime: dateGroup.dateTime, eventIds: Array.from(dateGroup.eventIds) });
                todayEventIds.push(...Array.from(dateGroup.eventIds));
            }
        });

        // 3. ESCÁNER PROFUNDO DE MERCADOS SOLO PARA LOS DE HOY (Backend para no tumbar la web)
        console.log(`🔎 Escaneando detalles profundos de ${todayEventIds.length} eventos de hoy...`);
        const chunkSize = 15;
        for (let i = 0; i < todayEventIds.length; i += chunkSize) {
            const chunk = todayEventIds.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (eventId) => {
                const detailUrl = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetEventDetails?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&eventId=${eventId}`;
                try {
                    const res = await fetch(detailUrl, { method: 'GET', headers });
                    if (res.ok) {
                        const detailData = await res.json();
                        const ev = detailData.event || detailData;
                        
                        if (ev.markets) {
                            const targetEvent = eventMap.get(eventId);
                            if (targetEvent) {
                                if (!targetEvent.marketIds) targetEvent.marketIds = [];
                                ev.markets.forEach(m => {
                                    if (!marketMap.has(m.id)) marketMap.set(m.id, m);
                                    if (!targetEvent.marketIds.includes(m.id)) targetEvent.marketIds.push(m.id);
                                });
                            }
                        }
                        
                        const oddsSource = detailData.odds || ev.odds || [];
                        oddsSource.forEach(o => {
                            if (!oddMap.has(o.id)) oddMap.set(o.id, o);
                        });
                    }
                } catch (e) {}
            }));
        }

        const combinedData = {
            events: Array.from(eventMap.values()).filter(e => todayEventIds.includes(e.id)),
            markets: Array.from(marketMap.values()),
            odds: Array.from(oddMap.values()),
            competitors: Array.from(competitorMap.values()),
            sports: Array.from(sportMap.values()),
            categories: Array.from(categoryMap.values()),
            championships: Array.from(champMap.values()),
            dates: finalDates
        };

        console.log(`✅ Data lista y masticada. Enviando al navegador.`);
        res.json(combinedData);
        
    } catch (error) {
        console.error('❌ Error general:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/event-details/:eventId', async (req, res) => {
    // Ya no se usa mucho en el front, pero lo dejamos por si acaso.
    const eventId = req.params.eventId;
    const upstream = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetEventDetails?eventId=${eventId}&culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE`;
    try {
        const r = await fetch(upstream, { headers: { 'accept': '*/*', 'dnt': '1', 'origin': 'https://caman.vip', 'user-agent': 'Mozilla/5.0' } });
        const ct = r.headers.get('content-type') || '';
        res.status(r.status);
        if (ct.includes('application/json')) res.json(await r.json());
        else res.type(ct).send(await r.text());
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
});

app.post('/api/place-bet', express.json(), async (req, res) => {
    try {
        const betData = req.body;
        if (!betData.betslip || betData.betslip.length === 0) return res.status(400).json({ error: 'Datos inválidos' });
        
        const apiPayload = {
            culture: betData.culture || "es-ES", timezoneOffset: betData.timezoneOffset || 240, integration: betData.integration || "camanbet", deviceType: betData.deviceType || 1, numFormat: betData.numFormat || "en-GB", countryCode: betData.countryCode || "VE", betslip: betData.betslip
        };
        
        const response = await fetch('https://sb2betslip-altenar2.biahosted.com/api/Betslip/reserveBet', {
            method: 'POST',
            headers: {
                'accept': '*/*', 'content-type': 'application/json', 'origin': 'https://caman.vip', 'user-agent': 'Mozilla/5.0',
                'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDb25maWd1cmF0aW9uSWQiOiIxMiIsIlBlcnNvblR5cGUiOiIzIiwiUGVyc29uSWQiOiI2NTE0MDA3NyIsIlVzZXJOYW1lIjoiVXN1YXJpbzExMTU0Mzk3IiwiTG9naW5JZCI6IjczMTUxNjg1IiwiQ3VycmVuY3lTaWduIjoiVkVTIiwiTWluQm9udXNQcmljZSI6IjEuMiIsIkJvbnVzVGVtcGxhdGVJZCI6IjMwNSIsIkN1cnJlbmN5SWQiOiI5MjgiLCJDdXJyZW5jeUNvZGUiOiJWRVMiLCJDb3VudHJ5Q29kZSI6IlZFIiwiQnJhbmRJZCI6IjQ4NyIsIkNsaWVudElQIjoiMTkwLjcyLjEwMi4yMTAiLCJleHAiOjE3NTg5NjA1MDksImlzcyI6IlNCMiIsImF1ZCI6IlNCMiJ9.RnpHbbFWYzFZ7WQjmXv0HBsadA9LAC7jxFLw_NhZvDU'
            },
            body: JSON.stringify(apiPayload)
        });
        
        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const result = await response.json();
        
        res.json({ success: true, transactionId: result.transactionId || `TXN_${Date.now()}`, apiResponse: result });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la apuesta', message: error.message });
    }
});

app.use((req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.listen(PORT, () => { console.log(`✅ Servidor iniciado en puerto ${PORT}`); });