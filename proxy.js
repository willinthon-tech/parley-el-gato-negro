const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.static('public'));

app.get('/api/top-events', async (req, res) => {
  const upstream = 'https://sb2frontend-altenar2.biahosted.com/api/widget/GetCouponEvents?culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE&playerRegDate=2025-09-24T15%3A32%3A12.67&eventCount=0&sportId=66&period=5&couponType=1';
  try {
    const r = await fetch(upstream, {
      headers: {
        'accept': '*/*',
        'accept-language': 'es-ES,es;q=0.9',
        'authorization': 'V2xoc1MyRkhTa2haTW14UVlWVndTbFpZY0VwTlZUVndVMWhPU21Kc1NURlpNRTVLVG10c2NtTkdhRmRSTUc4MVRHMVdOVk51UW1wUk1Hc3lVMWR3Ums1Rk5YQk9TR2hQWVcxT01WUldVbHBPVlhoeFUxaHNUbEV3YkhwVFZ6RlRaRzFLV0ZKdVFtbGhWV3N5VTFjeGIwMUhVa2xSYm5CUVlWUm9NbGRVU2tka1JteFlUa2hXYTJKWGVETlRWMnd6WVZkR1dFNVVRbUZXTWxJMVYxWm9VMk5IU1hsT1IyeFFZVlZ3Y1ZkV1kzaGhSMHAwVTIxNGExRXdiSHBUVnpWWFpXeHdXVk5yU21GTmJGb3hXa1ZPU2s1cmJISk5XRnBzWWxkNGVsbHJaRVprYXpWVVRraGtTbEV5YUZsWlZtTXhZVEpKZWxwSWNFcFNWRlpXVTFWU1JtUXdlSEZSVkdSS1VtMVNkMWx0Y0ZwTlJUazFVV3BTVDJGc1JuZFRWVlpIWkRKT1NHVkhlRmROYkZwd1ZYcEtjMDFGZURaV1dIQlBaVlJTTmxSdGJFSmlNVTEzWVVaV1ZWWllaSHBUVldRMFkwZEZlVlpYWkZOTmJGcHhXVlJKTkdORmJFWlViVGxxWWxSc01GZHNUVFJsUlRWRlVWaFdUbEY2VWpOVVIzQkNXakZWZVZKdE1WcFhSWEIzVkVod1ZtVnJOVFZPU0hCUFlWVnNlbE5YTURWbGEyeHhZakpzV1ZFd2NGbFpWbU14WVRKSmVscEljRmxSTUd4d1ZFVk9TMkpIVmtsUlYyeFFZV3RWZWxSc1VtNU9SVFUyVkZSR1QyVnJORFZNYlZaTllrWnNSV0p0VW5kak0xbDNWREZDUjAxVVpGZGlSVkY2VTJ4Q01tSXlaSGxPVXpGb1lWZEtOVTB3YjNSTmJURnNZVlJTUkdNd1JUMD0=',
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

// Endpoint para obtener detalles de un evento específico
app.get('/api/event-details/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  const upstream = `https://sb2frontend-altenar2.biahosted.com/api/widget/GetEventDetails?eventId=${eventId}&culture=es-ES&timezoneOffset=240&integration=camanbet&deviceType=1&numFormat=en-GB&countryCode=VE`;
  
  try {
    const r = await fetch(upstream, {
      headers: {
        'accept': '*/*',
        'accept-language': 'es-ES,es;q=0.9',
        'authorization': 'V2xoc1MyRkhTa2haTW14UVlWVndTbFpZY0VwTlZUVndVMWhPU21Kc1NURlpNRTVLVG10c2NtTkdhRmRSTUc4MVRHMVdOVk51UW1wUk1Hc3lVMWR3Ums1Rk5YQk9TR2hQWVcxT01WUldVbHBPVlhoeFUxaHNUbEV3YkhwVFZ6RlRaRzFLV0ZKdVFtbGhWV3N5VTFjeGIwMUhVa2xSYm5CUVlWUm9NbGRVU2tka1JteFlUa2hXYTJKWGVETlRWMnd6WVZkR1dFNVVRbUZXTWxJMVYxWm9VMk5IU1hsT1IyeFFZVlZ3Y1ZkV1kzaGhSMHAwVTIxNGExRXdiSHBUVnpWWFpXeHdXVk5yU21GTmJGb3hXa1ZPU2s1cmJISk5XRnBzWWxkNGVsbHJaRVprYXpWVVRraGtTbEV5YUZsWlZtTXhZVEpKZWxwSWNFcFNWRlpXVTFWU1JtUXdlSEZSVkdSS1VtMVNkMWx0Y0ZwTlJUazFVV3BTVDJGc1JuZFRWVlpIWkRKT1NHVkhlRmROYkZwd1ZYcEtjMDFGZURaV1dIQlBaVlJTTmxSdGJFSmlNVTEzWVVaV1ZWWllaSHBUVldRMFkwZEZlVlpYWkZOTmJGcHhXVlJKTkdORmJFWlViVGxxWWxSc01GZHNUVFJsUlRWRlVWaFdUbEY2VWpOVVIzQkNXakZWZVZKdE1WcFhSWEIzVkVod1ZtVnJOVFZPU0hCUFlWVnNlbE5YTURWbGEyeHhZakpzV1ZFd2NGbFpWbU14WVRKSmVscEljRmxSTUd4d1ZFVk9TMkpIVmtsUlYyeFFZV3RWZWxSc1VtNU9SVFUyVkZSR1QyVnJORFZNYlZaTllrWnNSV0p0VW5kak0xbDNWREZDUjAxVVpGZGlSVkY2VTJ4Q01tSXlaSGxPVXpGb1lWZEtOVTB3YjNSTmJURnNZVlJTUkdNd1JUMD0=',
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

app.listen(3000, () => console.log('Servidor en http://localhost:3000 (GET /api/top-events, GET /api/event-details/:id)'));
