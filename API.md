# Transit API configuration

The app reads API endpoints from `window.BENGALURU_TRANSIT_API_CONFIG` in `index.html`.
Keep URLs empty to use the bundled fallback data. Add public CORS-enabled endpoints, or point these URLs at your own proxy if the official BMRCL/BMTC feeds require tokens.

```html
<script>
  window.BENGALURU_TRANSIT_API_CONFIG = {
    timeoutMs: 10000,
    refreshMs: 60000,
    metro: {
      stationsUrl: "https://data.opencity.in/dataset/746940cd-cca7-45f5-a3bc-8b0034663605/resource/86e5641c-496c-43fa-8143-bae5f255afc4/download/e13b04fa-bcd8-4fb9-930b-d67ed31bc782.kml",
      scheduleUrl: "https://example.com/metro/schedules",
      faresUrl: "https://example.com/metro/fares",
      linesUrl: "https://example.com/metro/lines",
      arrivalsUrl: "https://example.com/metro/arrivals?station={station}"
    },
    bus: {
      routesUrl: "https://example.com/bmtc/routes",
      stopsUrl: "https://data.opencity.in/api/3/action/datastore_search?resource_id=cce1032b-875e-4722-9cdc-f8fe3601c82b&limit=5000",
      arrivalsUrl: "https://example.com/bmtc/arrivals?stop={stop}",
      vehiclesUrl: "https://example.com/bmtc/vehicles?route={route}"
    }
  };
</script>
```

## Accepted JSON shapes

The loader accepts plain arrays, CKAN datastore responses, objects with `records`, `results`, `data`, `items`, `result.records`, GeoJSON `features`, and KML placemarks.

Metro station records should include:

```json
{
  "station_name": "MG Road",
  "line": "Purple Line",
  "latitude": 12.9755,
  "longitude": 77.6068,
  "order": 19
}
```

BMTC route records should include:

```json
{
  "route_number": "335E",
  "route_name": "Majestic - Whitefield",
  "frequency": "10-15 min",
  "stops": ["Kempegowda Bus Station (Majestic)", "MG Road", "Whitefield"]
}
```

BMTC stop records should include:

```json
{
  "stop_name": "MG Road",
  "latitude": 12.9755,
  "longitude": 77.6068
}
```

BMTC vehicle records should include:

```json
{
  "route_number": "335E",
  "vehicle_id": "KA-01-F-1234",
  "latitude": 12.9755,
  "longitude": 77.6068
}
```

## Notes

The current checked-in URLs call OpenCity public datasets for BMRCL station locations and BMTC stop locations. Official live feeds are often protected by CORS rules, API keys, or unreliable legacy hosts. For a public GitHub Pages site, do not put private keys in `index.html`; use a small serverless proxy and expose only the cleaned JSON needed by this app.
