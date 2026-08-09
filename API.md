# Transit API configuration

The app reads API endpoints from `window.BENGALURU_TRANSIT_API_CONFIG` in `index.html`.
Keep URLs empty to use the bundled fallback data. Add public CORS-enabled endpoints, or point these URLs at your own proxy if the official BMRCL/BMTC feeds require tokens.

```html
<script>
  window.BENGALURU_TRANSIT_API_CONFIG = {
    timeoutMs: 10000,
    refreshMs: 60000,
    geocodingUrl: "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&viewbox=77.45,13.18,77.85,12.75&bounded=1&q={query}%2C%20Bengaluru%2C%20Karnataka%2C%20India",
    metro: {
      stationsUrl: "data/metro-stations.kml",
      scheduleUrl: "https://example.com/metro/schedules",
      faresUrl: "https://example.com/metro/fares",
      linesUrl: "https://example.com/metro/lines",
      arrivalsUrl: "https://example.com/metro/arrivals?station={station}"
    },
    bus: {
      routesUrl: "https://example.com/bmtc/routes",
      stopsUrl: "data/bmtc-stops.json",
      arrivalsUrl: "https://example.com/bmtc/arrivals?stop={stop}",
      vehiclesUrl: "https://example.com/bmtc/vehicles?route={route}"
    }
  };
</script>
```

## Accepted JSON shapes

The loader accepts plain arrays, CKAN datastore responses, objects with `records`, `results`, `data`, `items`, `result.records`, GeoJSON `features`, and KML placemarks.

The `geocodingUrl` is used when a metro search box contains a place, landmark, or address instead of an exact station name. The app replaces `{query}`, reads latitude/longitude from the first returned map results, then selects the nearest known metro station.

Geocoding records should include:

```json
{
  "display_name": "Forum Mall Koramangala, Bengaluru, Karnataka, India",
  "lat": "12.9349503",
  "lon": "77.6121482"
}
```

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

The checked-in OpenCity public datasets are cached under `data/` so GitHub Pages can serve them from the same origin as the app. This avoids browser CORS blocks from third-party data hosts. The `.github/workflows/update-transit-data.yml` workflow refreshes the cached BMRCL station KML and BMTC stop JSON every day and can also be run manually from GitHub Actions.

Official live feeds are often protected by CORS rules, API keys, or unreliable legacy hosts. For live train or bus GPS feeds, do not put private keys in `index.html`; use a small serverless proxy and expose only the cleaned JSON needed by this app.
