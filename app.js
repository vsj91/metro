  let watchId = null;
  let isTracking = false;
  let currentNearestStation = null;
  let currentNearestBusStop = null;
  let fromStationSource = 'live';
  let busFromSource = 'live';
  let activeTransportMode = 'metro';
  let activeView = 'journey';
  let currentPanel = 'unselected';
  let currentRoutePath = [];
  let currentMapView = { x: 0, y: 0, width: 1100, height: 760 };
  let leafletMap = null;
  let leafletLayerGroup = null;
  let leafletBaseLayers = null;
  let lastLeafletFocusKey = '';
  let lastLeafletRenderKey = '';
  let leafletUserTouched = false;
  let leafletProgrammaticFit = false;
  let leafletAutoFitRequested = true;
  let busRouteOptions = [];
  let selectedBusRouteIndex = -1;
  let busLeafletMap = null;
  let busLeafletLayerGroup = null;
  let transitApiLoadStatus = { metro: 'fallback', bus: 'fallback' };
  let busVehiclePositions = [];

  const DEFAULT_TRANSIT_API_CONFIG = {
    timeoutMs: 10000,
    refreshMs: 60000,
    geocodingUrl: '',
    metro: {
      stationsUrl: '',
      scheduleUrl: '',
      faresUrl: '',
      linesUrl: '',
      arrivalsUrl: ''
    },
    bus: {
      routesUrl: '',
      stopsUrl: '',
      arrivalsUrl: '',
      vehiclesUrl: ''
    }
  };

  const TRANSIT_API_CONFIG = {
    ...DEFAULT_TRANSIT_API_CONFIG,
    ...(window.BENGALURU_TRANSIT_API_CONFIG || {}),
    metro: {
      ...DEFAULT_TRANSIT_API_CONFIG.metro,
      ...((window.BENGALURU_TRANSIT_API_CONFIG || {}).metro || {})
    },
    bus: {
      ...DEFAULT_TRANSIT_API_CONFIG.bus,
      ...((window.BENGALURU_TRANSIT_API_CONFIG || {}).bus || {})
    }
  };

  const STATIONS = {
    // PURPLE LINE
    "Challaghatta": { line: "Purple Line", order: 1, lat: 12.8974200, lng: 77.4612400 },
    "Kengeri": { line: "Purple Line", order: 2, lat: 12.9079540, lng: 77.4765118 },
    "Kengeri Bus Terminal": { line: "Purple Line", order: 3, lat: 12.9148975, lng: 77.4875928 },
    "Pattanagere": { line: "Purple Line", order: 4, lat: 12.9244147, lng: 77.4982564 },
    "Jnanabharathi": { line: "Purple Line", order: 5, lat: 12.9355559, lng: 77.5120187 },
    "Rajarajeshwari Nagar": { line: "Purple Line", order: 6, lat: 12.9367268, lng: 77.5195822 },
    "Pantharapalya - Nayandahalli": { line: "Purple Line", order: 7, lat: 12.9416700, lng: 77.5251200 },
    "Mysuru Road": { line: "Purple Line", order: 8, lat: 12.9467266, lng: 77.5300737 },
    "Deepanjali Nagar": { line: "Purple Line", order: 9, lat: 12.9522153, lng: 77.5371011 },
    "Attiguppe": { line: "Purple Line", order: 10, lat: 12.9619570, lng: 77.5335820 },
    "Vijayanagar": { line: "Purple Line", order: 11, lat: 12.9709156, lng: 77.5374015 },
    "Balagangadharanatha Swamiji Station, Hosahalli": { line: "Purple Line", order: 12, lat: 12.9743030, lng: 77.5454434 },
    "Magadi Road": { line: "Purple Line", order: 13, lat: 12.9756582, lng: 77.5554118 },
    "Krantivira Sangolli Rayanna Railway Station": { line: "Purple Line", order: 14, lat: 12.9758405, lng: 77.5657558 },
    "Nadaprabhu Kempegowda (Majestic)": { line: "Interchange", order: 15, lat: 12.9756893, lng: 77.5728703 },
    "Sir M. Visvesvaraya Station, Central College": { line: "Purple Line", order: 16, lat: 12.9742808, lng: 77.5839458 },
    "Dr. B. R. Ambedkar Station, Vidhana Soudha": { line: "Purple Line", order: 17, lat: 12.9787400, lng: 77.5916400 },
    "Cubbon Park": { line: "Purple Line", order: 18, lat: 12.9809006, lng: 77.5974655 },
    "MG Road": { line: "Purple Line", order: 19, lat: 12.9755000, lng: 77.6068000 },
    "Trinity": { line: "Purple Line", order: 20, lat: 12.9730000, lng: 77.6170000 },
    "Halasuru": { line: "Purple Line", order: 21, lat: 12.9756600, lng: 77.6262800 },
    "Indiranagar": { line: "Purple Line", order: 22, lat: 12.9783300, lng: 77.6386500 },
    "Swami Vivekananda Road": { line: "Purple Line", order: 23, lat: 12.9859103, lng: 77.6450043 },
    "Baiyappanahalli": { line: "Purple Line", order: 24, lat: 12.9906651, lng: 77.6525903 },
    "Benniganahalli": { line: "Purple Line", order: 25, lat: 12.9964275, lng: 77.6683160 },
    "K. R. Pura": { line: "Purple Line", order: 26, lat: 12.9999900, lng: 77.6779400 },
    "Singayyanapalya": { line: "Purple Line", order: 27, lat: 12.9967800, lng: 77.6921700 },
    "Garudacharpalya": { line: "Purple Line", order: 28, lat: 12.9935600, lng: 77.7037600 },
    "Hoodi": { line: "Purple Line", order: 29, lat: 12.9887300, lng: 77.7112700 },
    "Seetharampalya": { line: "Purple Line", order: 30, lat: 12.9809200, lng: 77.7088700 },
    "Kundalahalli": { line: "Purple Line", order: 31, lat: 12.9774610, lng: 77.7157610 },
    "Nallur Halli": { line: "Purple Line", order: 32, lat: 12.9765280, lng: 77.7247630 },
    "Sri Sathya Sai Hospital": { line: "Purple Line", order: 33, lat: 12.9810200, lng: 77.7276200 },
    "Pattandur Agrahara": { line: "Purple Line", order: 34, lat: 12.9876130, lng: 77.7382110 },
    "Kadugodi Tree Park": { line: "Purple Line", order: 35, lat: 12.9856500, lng: 77.7469000 },
    "Hopefarm Channasandra": { line: "Purple Line", order: 36, lat: 12.9879300, lng: 77.7540900 },
    "Whitefield (Kadugodi)": { line: "Purple Line", order: 37, lat: 12.9950700, lng: 77.7577700 },

    // GREEN LINE
    "Madavara": { line: "Green Line", order: 1, lat: 13.0574214, lng: 77.4728055 },
    "Chikkabidarakallu": { line: "Green Line", order: 2, lat: 13.0519444, lng: 77.4863889 },
    "Manjunathnagar": { line: "Green Line", order: 3, lat: 13.0502778, lng: 77.4944444 },
    "Nagasandra": { line: "Green Line", order: 4, lat: 13.0481315, lng: 77.5001257 },
    "Dasarahalli": { line: "Green Line", order: 5, lat: 13.0435416, lng: 77.5123791 },
    "Jalahalli": { line: "Green Line", order: 6, lat: 13.0395842, lng: 77.5198377 },
    "Peenya Industry": { line: "Green Line", order: 7, lat: 13.0363220, lng: 77.5257170 },
    "Peenya": { line: "Green Line", order: 8, lat: 13.0329868, lng: 77.5334693 },
    "Goraguntepalya": { line: "Green Line", order: 9, lat: 13.0284000, lng: 77.5402000 },
    "Yeshwanthpur": { line: "Green Line", order: 10, lat: 13.0232000, lng: 77.5499000 },
    "Sandal Soap Factory": { line: "Green Line", order: 11, lat: 13.0148000, lng: 77.5539000 },
    "Mahalakshmi": { line: "Green Line", order: 12, lat: 13.0083374, lng: 77.5488344 },
    "Rajajinagar": { line: "Green Line", order: 13, lat: 13.0003455, lng: 77.5497483 },
    "Mahakavi Kuvempu Road": { line: "Green Line", order: 14, lat: 12.9985024, lng: 77.5569474 },
    "Srirampura": { line: "Green Line", order: 15, lat: 12.9965259, lng: 77.5633565 },
    "Mantri Square Sampige Road": { line: "Green Line", order: 16, lat: 12.9905455, lng: 77.5708050 },
    "Chickpet": { line: "Green Line", order: 18, lat: 12.9675484, lng: 77.5747975 },
    "Krishna Rajendra Market": { line: "Green Line", order: 19, lat: 12.9564453, lng: 77.5735999 },
    "National College": { line: "Green Line", order: 20, lat: 12.9506136, lng: 77.5737360 },
    "Lalbagh": { line: "Green Line", order: 21, lat: 12.9462868, lng: 77.5800613 },
    "South End Circle": { line: "Green Line", order: 22, lat: 12.9383210, lng: 77.5800747 },
    "Jayanagar": { line: "Green Line", order: 23, lat: 12.9294558, lng: 77.5802873 },
    "Rashtreeya Vidyalaya Road": { line: "Interchange", order: 24, lat: 12.9215875, lng: 77.5802612 },
    "Banashankari": { line: "Green Line", order: 25, lat: 12.9155387, lng: 77.5736287 },
    "Jaya Prakash Nagar": { line: "Green Line", order: 26, lat: 12.9074229, lng: 77.5731788 },
    "Yelachenahalli": { line: "Green Line", order: 27, lat: 12.8959381, lng: 77.5701687 },
    "Konanakunte Cross": { line: "Green Line", order: 28, lat: 12.8890002, lng: 77.5626407 },
    "Doddakallasandra": { line: "Green Line", order: 29, lat: 12.8846862, lng: 77.5527510 },
    "Vajarahalli": { line: "Green Line", order: 30, lat: 12.8775389, lng: 77.5447450 },
    "Thalaghattapura": { line: "Green Line", order: 31, lat: 12.8714244, lng: 77.5383625 },
    "Silk Institute": { line: "Green Line", order: 32, lat: 12.8617700, lng: 77.5299900 },

    // YELLOW LINE
    "Ragigudda": { line: "Yellow Line", order: 2, lat: 12.9171100, lng: 77.5883700 },
    "Jayadeva Hospital": { line: "Yellow Line", order: 3, lat: 12.9167300, lng: 77.6000900 },
    "BTM Layout": { line: "Yellow Line", order: 4, lat: 12.9165600, lng: 77.6082500 },
    "Central Silk Board": { line: "Yellow Line", order: 5, lat: 12.9165200, lng: 77.6205600 },
    "Bommanahalli": { line: "Yellow Line", order: 6, lat: 12.9106600, lng: 77.6265700 },
    "Hongasandra": { line: "Yellow Line", order: 7, lat: 12.9016500, lng: 77.6320800 },
    "Kudlu Gate": { line: "Yellow Line", order: 8, lat: 12.8899200, lng: 77.6392900 },
    "Singasandra": { line: "Yellow Line", order: 9, lat: 12.8806900, lng: 77.6449800 },
    "Hosa Road": { line: "Yellow Line", order: 10, lat: 12.8707800, lng: 77.6524800 },
    "Beratena Agrahara": { line: "Yellow Line", order: 11, lat: 12.8638500, lng: 77.6579800 },
    "Electronic City": { line: "Yellow Line", order: 12, lat: 12.8564800, lng: 77.6636100 },
    "Infosys Foundation Konappana Agrahara": { line: "Yellow Line", order: 13, lat: 12.8464900, lng: 77.6711200 },
    "Huskur Road": { line: "Yellow Line", order: 14, lat: 12.8390100, lng: 77.6775400 },
    "Biocon Hebbagodi": { line: "Yellow Line", order: 15, lat: 12.8290900, lng: 77.6813300 },
    "Delta electronics Bommasandra": { line: "Yellow Line", order: 16, lat: 12.8193300, lng: 77.6883400 }
  };

  const ADJACENCY = {
    "Challaghatta": ["Kengeri"],
    "Kengeri": ["Challaghatta", "Kengeri Bus Terminal"],
    "Kengeri Bus Terminal": ["Kengeri", "Pattanagere"],
    "Pattanagere": ["Kengeri Bus Terminal", "Jnanabharathi"],
    "Jnanabharathi": ["Pattanagere", "Rajarajeshwari Nagar"],
    "Rajarajeshwari Nagar": ["Jnanabharathi", "Pantharapalya - Nayandahalli"],
    "Pantharapalya - Nayandahalli": ["Rajarajeshwari Nagar", "Mysuru Road"],
    "Mysuru Road": ["Pantharapalya - Nayandahalli", "Deepanjali Nagar"],
    "Deepanjali Nagar": ["Mysuru Road", "Attiguppe"],
    "Attiguppe": ["Deepanjali Nagar", "Vijayanagar"],
    "Vijayanagar": ["Attiguppe", "Balagangadharanatha Swamiji Station, Hosahalli"],
    "Balagangadharanatha Swamiji Station, Hosahalli": ["Vijayanagar", "Magadi Road"],
    "Magadi Road": ["Balagangadharanatha Swamiji Station, Hosahalli", "Krantivira Sangolli Rayanna Railway Station"],
    "Krantivira Sangolli Rayanna Railway Station": ["Magadi Road", "Nadaprabhu Kempegowda (Majestic)"],
    "Nadaprabhu Kempegowda (Majestic)": ["Krantivira Sangolli Rayanna Railway Station", "Sir M. Visvesvaraya Station, Central College", "Mantri Square Sampige Road", "Chickpet"],
    "Sir M. Visvesvaraya Station, Central College": ["Nadaprabhu Kempegowda (Majestic)", "Dr. B. R. Ambedkar Station, Vidhana Soudha"],
    "Dr. B. R. Ambedkar Station, Vidhana Soudha": ["Sir M. Visvesvaraya Station, Central College", "Cubbon Park"],
    "Cubbon Park": ["Dr. B. R. Ambedkar Station, Vidhana Soudha", "MG Road"],
    "MG Road": ["Cubbon Park", "Trinity"],
    "Trinity": ["MG Road", "Halasuru"],
    "Halasuru": ["Trinity", "Indiranagar"],
    "Indiranagar": ["Halasuru", "Swami Vivekananda Road"],
    "Swami Vivekananda Road": ["Indiranagar", "Baiyappanahalli"],
    "Baiyappanahalli": ["Swami Vivekananda Road", "Benniganahalli"],
    "Benniganahalli": ["Baiyappanahalli", "K. R. Pura"],
    "K. R. Pura": ["Benniganahalli", "Singayyanapalya"],
    "Singayyanapalya": ["K. R. Pura", "Garudacharpalya"],
    "Garudacharpalya": ["Singayyanapalya", "Hoodi"],
    "Hoodi": ["Garudacharpalya", "Seetharampalya"],
    "Seetharampalya": ["Hoodi", "Kundalahalli"],
    "Kundalahalli": ["Seetharampalya", "Nallur Halli"],
    "Nallur Halli": ["Kundalahalli", "Sri Sathya Sai Hospital"],
    "Sri Sathya Sai Hospital": ["Nallur Halli", "Pattandur Agrahara"],
    "Pattandur Agrahara": ["Sri Sathya Sai Hospital", "Kadugodi Tree Park"],
    "Kadugodi Tree Park": ["Pattandur Agrahara", "Hopefarm Channasandra"],
    "Hopefarm Channasandra": ["Kadugodi Tree Park", "Whitefield (Kadugodi)"],
    "Whitefield (Kadugodi)": ["Hopefarm Channasandra"],

    "Madavara": ["Chikkabidarakallu"],
    "Chikkabidarakallu": ["Madavara", "Manjunathnagar"],
    "Manjunathnagar": ["Chikkabidarakallu", "Nagasandra"],
    "Nagasandra": ["Manjunathnagar", "Dasarahalli"],
    "Dasarahalli": ["Nagasandra", "Jalahalli"],
    "Jalahalli": ["Dasarahalli", "Peenya Industry"],
    "Peenya Industry": ["Jalahalli", "Peenya"],
    "Peenya": ["Peenya Industry", "Goraguntepalya"],
    "Goraguntepalya": ["Peenya", "Yeshwanthpur"],
    "Yeshwanthpur": ["Goraguntepalya", "Sandal Soap Factory"],
    "Sandal Soap Factory": ["Yeshwanthpur", "Mahalakshmi"],
    "Mahalakshmi": ["Sandal Soap Factory", "Rajajinagar"],
    "Rajajinagar": ["Mahalakshmi", "Mahakavi Kuvempu Road"],
    "Mahakavi Kuvempu Road": ["Rajajinagar", "Srirampura"],
    "Srirampura": ["Mahakavi Kuvempu Road", "Mantri Square Sampige Road"],
    "Mantri Square Sampige Road": ["Srirampura", "Nadaprabhu Kempegowda (Majestic)"],
    "Chickpet": ["Nadaprabhu Kempegowda (Majestic)", "Krishna Rajendra Market"],
    "Krishna Rajendra Market": ["Chickpet", "National College"],
    "National College": ["Krishna Rajendra Market", "Lalbagh"],
    "Lalbagh": ["National College", "South End Circle"],
    "South End Circle": ["Lalbagh", "Jayanagar"],
    "Jayanagar": ["South End Circle", "Rashtreeya Vidyalaya Road"],
    "Rashtreeya Vidyalaya Road": ["Jayanagar", "Banashankari", "Ragigudda"],
    "Banashankari": ["Rashtreeya Vidyalaya Road", "Jaya Prakash Nagar"],
    "Jaya Prakash Nagar": ["Banashankari", "Yelachenahalli"],
    "Yelachenahalli": ["Jaya Prakash Nagar", "Konanakunte Cross"],
    "Konanakunte Cross": ["Yelachenahalli", "Doddakallasandra"],
    "Doddakallasandra": ["Konanakunte Cross", "Vajarahalli"],
    "Vajarahalli": ["Doddakallasandra", "Thalaghattapura"],
    "Thalaghattapura": ["Vajarahalli", "Silk Institute"],
    "Silk Institute": ["Thalaghattapura"],

    "Ragigudda": ["Rashtreeya Vidyalaya Road", "Jayadeva Hospital"],
    "Jayadeva Hospital": ["Ragigudda", "BTM Layout"],
    "BTM Layout": ["Jayadeva Hospital", "Central Silk Board"],
    "Central Silk Board": ["BTM Layout", "Bommanahalli"],
    "Bommanahalli": ["Central Silk Board", "Hongasandra"],
    "Hongasandra": ["Bommanahalli", "Kudlu Gate"],
    "Kudlu Gate": ["Hongasandra", "Singasandra"],
    "Singasandra": ["Kudlu Gate", "Hosa Road"],
    "Hosa Road": ["Singasandra", "Beratena Agrahara"],
    "Beratena Agrahara": ["Hosa Road", "Electronic City"],
    "Electronic City": ["Beratena Agrahara", "Infosys Foundation Konappana Agrahara"],
    "Infosys Foundation Konappana Agrahara": ["Electronic City", "Huskur Road"],
    "Huskur Road": ["Infosys Foundation Konappana Agrahara", "Biocon Hebbagodi"],
    "Biocon Hebbagodi": ["Huskur Road", "Delta electronics Bommasandra"],
    "Delta electronics Bommasandra": ["Biocon Hebbagodi"]
  };

  const STATION_ALIASES = {
    "Rajarajeswari Nagar": "Rajarajeshwari Nagar",
    "Nallurhalli": "Nallur Halli",
    "Nallur Halli": "Nallur Halli",
    "Sadaramangala": "Sri Sathya Sai Hospital",
    "ITPL": "Sri Sathya Sai Hospital",
    "Sri Sathya Sai Hospital": "Sri Sathya Sai Hospital",
    "RV Road": "Rashtreeya Vidyalaya Road",
    "R V Road": "Rashtreeya Vidyalaya Road",
    "Konappana Agrahara": "Infosys Foundation Konappana Agrahara",
    "Hebbagodi": "Biocon Hebbagodi",
    "Bommasandra": "Delta electronics Bommasandra",
    "Delta Electronics Bommasandra": "Delta electronics Bommasandra",
    "Delta electronics Bommasandra": "Delta electronics Bommasandra"
  };

  let stationNames = Object.keys(STATIONS).sort();

  const LINE_COLORS = {
    "Purple Line": "#a855f7",
    "Green Line": "#22c55e",
    "Yellow Line": "#eab308",
    "Interchange": "#f59e0b"
  };

  let BMTC_ROUTES = [
    { number: "335E", name: "Majestic - Whitefield", frequency: "10-15 min", stops: ["Kempegowda Bus Station (Majestic)", "Corporation", "MG Road", "Indiranagar", "Tin Factory", "KR Puram", "Mahadevapura", "Marathahalli", "Kundalahalli Gate", "Whitefield"] },
    { number: "500D", name: "Hebbal - Silk Board - Electronic City", frequency: "12-18 min", stops: ["Hebbal", "Manyata Tech Park", "Nagavara", "HRBR Layout", "Indiranagar", "Domlur", "Koramangala", "Madiwala", "Central Silk Board", "Electronic City"] },
    { number: "356C", name: "Majestic - Electronic City", frequency: "15-20 min", stops: ["Kempegowda Bus Station (Majestic)", "Town Hall", "Lalbagh", "Jayanagar", "BTM Layout", "Central Silk Board", "Bommanahalli", "Hongasandra", "Kudlu Gate", "Singasandra", "Hosa Road", "Beratena Agrahara", "Electronic City"] },
    { number: "V-500CA", name: "ITPL - Silk Board", frequency: "12-18 min", stops: ["Whitefield", "ITPL", "Kundalahalli Gate", "Marathahalli", "HAL Airport Road", "Domlur", "Koramangala", "Madiwala", "Central Silk Board"] },
    { number: "KIA-8", name: "Electronic City - Airport", frequency: "30-45 min", stops: ["Electronic City", "Central Silk Board", "Madiwala", "Koramangala", "Domlur", "Hebbal", "Kempegowda International Airport"] },
    { number: "KIA-9", name: "Majestic - Airport", frequency: "30-45 min", stops: ["Kempegowda Bus Station (Majestic)", "Mekhri Circle", "Hebbal", "Yelahanka", "Kempegowda International Airport"] },
    { number: "201", name: "Banashankari - KR Market - Shivajinagar", frequency: "8-12 min", stops: ["Banashankari", "Jayanagar", "South End Circle", "Lalbagh", "KR Market", "Corporation", "Shivajinagar"] },
    { number: "401K", name: "Yeshwanthpur - KR Puram", frequency: "15-20 min", stops: ["Yeshwanthpur", "Mekhri Circle", "Hebbal", "Nagavara", "Manyata Tech Park", "KR Puram"] },
    { number: "V-500KS", name: "Kengeri - Silk Board", frequency: "15-25 min", stops: ["Kengeri", "Rajarajeshwari Nagar", "Nayandahalli", "Banashankari", "Jayanagar", "BTM Layout", "Central Silk Board"] },
    { number: "271D", name: "Peenya - Majestic - Shivajinagar", frequency: "10-18 min", stops: ["Peenya", "Yeshwanthpur", "Rajajinagar", "Kempegowda Bus Station (Majestic)", "Corporation", "Shivajinagar"] },
    { number: "G-4", name: "Bannerghatta Road - MG Road", frequency: "10-15 min", stops: ["Gottigere", "Arekere", "JP Nagar", "Jayanagar", "Lalbagh", "Corporation", "MG Road"] },
    { number: "342F", name: "Sarjapur Road - Shivajinagar", frequency: "15-25 min", stops: ["Sarjapur Road", "Bellandur", "Marathahalli", "Domlur", "MG Road", "Shivajinagar"] }
  ];

  const BMTC_STOP_ALIASES = {
    "Majestic": "Kempegowda Bus Station (Majestic)",
    "KBS": "Kempegowda Bus Station (Majestic)",
    "Kempegowda Bus Stand": "Kempegowda Bus Station (Majestic)",
    "Silk Board": "Central Silk Board",
    "KR Market": "KR Market",
    "K R Market": "KR Market",
    "Airport": "Kempegowda International Airport",
    "BIAL": "Kempegowda International Airport",
    "KIA": "Kempegowda International Airport",
    "Manyata": "Manyata Tech Park",
    "ITPL": "ITPL",
    "White Field": "Whitefield",
    "E City": "Electronic City",
    "ECity": "Electronic City",
    "RR Nagar": "Rajarajeshwari Nagar",
    "Nayandahalli": "Nayandahalli",
    "MG Road": "MG Road",
    "M G Road": "MG Road",
    "Shivaji Nagar": "Shivajinagar"
  };

  let BMTC_STOPS = [...new Set(BMTC_ROUTES.flatMap(route => route.stops))].sort();

  const BMTC_STOP_COORDS = {
    "Arekere": { lat: 12.8857, lng: 77.5984 },
    "Banashankari": { lat: 12.9154, lng: 77.5736 },
    "Beratena Agrahara": { lat: 12.8584, lng: 77.6582 },
    "Bellandur": { lat: 12.9304, lng: 77.6784 },
    "Bommanahalli": { lat: 12.9080, lng: 77.6235 },
    "BTM Layout": { lat: 12.9166, lng: 77.6101 },
    "Central Silk Board": { lat: 12.9177, lng: 77.6239 },
    "Corporation": { lat: 12.9646, lng: 77.5880 },
    "Domlur": { lat: 12.9608, lng: 77.6387 },
    "Electronic City": { lat: 12.8452, lng: 77.6602 },
    "Gottigere": { lat: 12.8551, lng: 77.5878 },
    "HAL Airport Road": { lat: 12.9595, lng: 77.6555 },
    "Hebbal": { lat: 13.0358, lng: 77.5970 },
    "Hongasandra": { lat: 12.9001, lng: 77.6322 },
    "Hosa Road": { lat: 12.8708, lng: 77.6525 },
    "HRBR Layout": { lat: 13.0211, lng: 77.6479 },
    "Indiranagar": { lat: 12.9783, lng: 77.6387 },
    "ITPL": { lat: 12.9857, lng: 77.7376 },
    "Jayanagar": { lat: 12.9250, lng: 77.5938 },
    "Kempegowda Bus Station (Majestic)": { lat: 12.9767, lng: 77.5713 },
    "Kempegowda International Airport": { lat: 13.1986, lng: 77.7066 },
    "Kengeri": { lat: 12.9079, lng: 77.4765 },
    "Koramangala": { lat: 12.9352, lng: 77.6245 },
    "KR Market": { lat: 12.9613, lng: 77.5761 },
    "KR Puram": { lat: 13.0075, lng: 77.6959 },
    "Kudlu Gate": { lat: 12.8899, lng: 77.6393 },
    "Kundalahalli Gate": { lat: 12.9569, lng: 77.7144 },
    "Lalbagh": { lat: 12.9507, lng: 77.5848 },
    "Madiwala": { lat: 12.9212, lng: 77.6174 },
    "Mahadevapura": { lat: 12.9913, lng: 77.6925 },
    "Manyata Tech Park": { lat: 13.0428, lng: 77.6245 },
    "Marathahalli": { lat: 12.9569, lng: 77.7011 },
    "Mekhri Circle": { lat: 13.0147, lng: 77.5839 },
    "MG Road": { lat: 12.9755, lng: 77.6068 },
    "Nagavara": { lat: 13.0422, lng: 77.6200 },
    "Nayandahalli": { lat: 12.9417, lng: 77.5251 },
    "Peenya": { lat: 13.0329, lng: 77.5339 },
    "Rajajinagar": { lat: 12.9915, lng: 77.5568 },
    "Rajarajeshwari Nagar": { lat: 12.9367, lng: 77.5196 },
    "Sarjapur Road": { lat: 12.9116, lng: 77.6769 },
    "Shivajinagar": { lat: 12.9850, lng: 77.6051 },
    "Singasandra": { lat: 12.8807, lng: 77.6450 },
    "South End Circle": { lat: 12.9361, lng: 77.5767 },
    "Tin Factory": { lat: 12.9969, lng: 77.6698 },
    "Town Hall": { lat: 12.9635, lng: 77.5858 },
    "Whitefield": { lat: 12.9698, lng: 77.7500 },
    "Yelahanka": { lat: 13.1007, lng: 77.5963 },
    "Yeshwanthpur": { lat: 13.0285, lng: 77.5402 }
  };

  function hasApiUrl(url) {
    return typeof url === 'string' && url.trim().length > 0;
  }

  function apiUrlWithParams(url, params = {}) {
    let nextUrl = url;
    Object.entries(params).forEach(([key, value]) => {
      nextUrl = nextUrl.replaceAll(`{${key}}`, encodeURIComponent(value ?? ''));
    });

    if (nextUrl.includes('{')) return nextUrl;

    const parsed = new URL(nextUrl, window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && !url.includes(`{${key}}`)) {
        parsed.searchParams.set(key, value);
      }
    });
    return parsed.toString();
  }

  async function fetchTransitJson(url, params = {}) {
    if (!hasApiUrl(url)) return null;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TRANSIT_API_CONFIG.timeoutMs);

    try {
      const response = await fetch(apiUrlWithParams(url, params), {
        headers: { Accept: 'application/json, application/vnd.google-earth.kml+xml, text/xml, */*' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      if (contentType.includes('json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
        return JSON.parse(text);
      }
      if (text.includes('<kml') || text.includes('<Placemark')) {
        return { records: parseKmlRecords(text) };
      }
      return { raw: text };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function parseKmlRecords(kmlText) {
    if (typeof DOMParser === 'undefined') return [];
    const doc = new DOMParser().parseFromString(kmlText, 'application/xml');
    return [...doc.querySelectorAll('Placemark')].map((placemark) => {
      const record = {
        name: placemark.querySelector('name')?.textContent?.trim(),
        coordinates: placemark.querySelector('Point coordinates, coordinates')?.textContent?.trim()
      };
      placemark.querySelectorAll('ExtendedData Data').forEach((node) => {
        const key = node.getAttribute('name');
        const value = node.querySelector('value')?.textContent?.trim();
        if (key && value) record[key] = value;
      });
      if (record.coordinates) {
        const [lng, lat] = record.coordinates.split(',').map(Number);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          record.latitude = lat;
          record.longitude = lng;
        }
      }
      return record;
    });
  }

  function unwrapRecords(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (payload.type === 'FeatureCollection' && Array.isArray(payload.features)) return payload.features;
    if (Array.isArray(payload.features)) return payload.features;
    if (Array.isArray(payload.records)) return payload.records;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (payload.result) return unwrapRecords(payload.result.records || payload.result.results || payload.result.data || payload.result);
    return [];
  }

  function valueFrom(record, keys) {
    const source = record?.properties || record?.attributes || record || {};
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null && source[key] !== '') return source[key];
    }
    return undefined;
  }

  function numberFrom(record, keys) {
    const value = valueFrom(record, keys);
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
  }

  function coordinatesFrom(record) {
    const geometryCoords = record?.geometry?.coordinates;
    if (Array.isArray(geometryCoords) && geometryCoords.length >= 2) {
      return { lat: Number(geometryCoords[1]), lng: Number(geometryCoords[0]) };
    }
    const lat = numberFrom(record, ['lat', 'Lat', 'LAT', 'latitude', 'Latitude', 'Y', 'station_latitude', 'stop_lat', 'y']);
    const lng = numberFrom(record, ['lng', 'Lng', 'LNG', 'lon', 'long', 'longitude', 'Longitude', 'X', 'station_longitude', 'stop_lon', 'x']);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }

  function normalizeMetroStation(record, index) {
    const name = valueFrom(record, ['name', 'NAME', 'station', 'station_name', 'stationName', 'stop_name', 'Stop Name']);
    const coords = coordinatesFrom(record);
    if (!name || !coords) return null;
    return [
      String(name).trim(),
      {
        line: String(valueFrom(record, ['line', 'line_name', 'corridor', 'route_name', 'Line']) || 'Metro Line').trim(),
        order: Number(valueFrom(record, ['order', 'sequence', 'stop_sequence', 'station_order']) || index + 1),
        lat: coords.lat,
        lng: coords.lng
      }
    ];
  }

  function normalizeBusStopName(stop) {
    if (typeof stop === 'string') return stop.trim();
    return String(valueFrom(stop, ['name', 'NAME', 'stop_name', 'stop', 'station', 'Stop Name']) || '').trim();
  }

  function normalizeBusRoute(record) {
    const source = record?.properties || record?.attributes || record || {};
    const number = valueFrom(source, ['number', 'route_number', 'routeNo', 'route_no', 'route_short_name', 'route_id', 'id']);
    const rawStops = source.stops || source.stop_names || source.stopNames || source.path || source.route_stops;
    let stops = [];

    if (Array.isArray(rawStops)) {
      stops = rawStops.map(normalizeBusStopName).filter(Boolean);
    } else if (typeof rawStops === 'string') {
      stops = rawStops.split(/\s*(?:,|->|→|\|)\s*/).map(stop => stop.trim()).filter(Boolean);
    }

    if (!number || stops.length < 2) return null;
    return {
      number: String(number).trim(),
      name: String(valueFrom(source, ['name', 'route_name', 'route_long_name']) || `${stops[0]} - ${stops[stops.length - 1]}`).trim(),
      frequency: String(valueFrom(source, ['frequency', 'headway', 'interval']) || 'API'),
      stops
    };
  }

  function normalizeBusStopRecord(record) {
    const name = normalizeBusStopName(record);
    const coords = coordinatesFrom(record);
    if (!name) return null;
    return { name, coords };
  }

  function normalizeVehiclePosition(record) {
    const coords = coordinatesFrom(record);
    if (!coords) return null;
    return {
      routeNumber: String(valueFrom(record, ['route_number', 'routeNo', 'route_id', 'route_short_name', 'number']) || '').trim(),
      vehicleId: String(valueFrom(record, ['vehicle_id', 'bus_number', 'label', 'id']) || 'Bus').trim(),
      lat: coords.lat,
      lng: coords.lng
    };
  }

  function rebuildDerivedTransitData() {
    stationNames = Object.keys(STATIONS).sort();
    BMTC_STOPS = [...new Set([...BMTC_ROUTES.flatMap(route => route.stops), ...Object.keys(BMTC_STOP_COORDS)])].sort();
  }

  function updateTransitApiStatus() {
    const status = document.getElementById('transit-api-status');
    if (!status) return;

    const metroLabel = transitApiLoadStatus.metro === 'api' ? 'Metro API connected' : 'Metro fallback data';
    const busLabel = transitApiLoadStatus.bus === 'api' ? 'BMTC API connected' : 'BMTC fallback data';
    status.textContent = `${metroLabel} • ${busLabel}`;
    status.classList.toggle('api-connected', transitApiLoadStatus.metro === 'api' || transitApiLoadStatus.bus === 'api');
  }

  async function loadMetroApiData() {
    let loaded = false;

    const stationPayload = await fetchTransitJson(TRANSIT_API_CONFIG.metro.stationsUrl).catch(() => null);
    const apiStations = unwrapRecords(stationPayload)
      .map(normalizeMetroStation)
      .filter(Boolean);
    if (apiStations.length) {
      apiStations.forEach(([name, station]) => {
        STATIONS[name] = {
          ...(STATIONS[name] || {}),
          ...station,
          line: station.line === 'Metro Line' && STATIONS[name]?.line ? STATIONS[name].line : station.line,
          order: STATIONS[name]?.order || station.order
        };
      });
      loaded = true;
    }

    const schedulePayload = await fetchTransitJson(TRANSIT_API_CONFIG.metro.scheduleUrl).catch(() => null);
    if (schedulePayload && !Array.isArray(schedulePayload) && typeof schedulePayload === 'object') {
      Object.assign(BMRC_TIMETABLES, schedulePayload.timetables || schedulePayload);
      loaded = true;
    }

    transitApiLoadStatus.metro = loaded ? 'api' : 'fallback';
  }

  async function loadBusApiData() {
    let loaded = false;

    const routePayload = await fetchTransitJson(TRANSIT_API_CONFIG.bus.routesUrl).catch(() => null);
    const apiRoutes = unwrapRecords(routePayload)
      .map(normalizeBusRoute)
      .filter(Boolean);
    if (apiRoutes.length) {
      BMTC_ROUTES = apiRoutes;
      loaded = true;
    }

    const stopPayload = await fetchTransitJson(TRANSIT_API_CONFIG.bus.stopsUrl).catch(() => null);
    const apiStops = unwrapRecords(stopPayload)
      .map(normalizeBusStopRecord)
      .filter(Boolean);
    if (apiStops.length) {
      apiStops.forEach(stop => {
        if (stop.coords) BMTC_STOP_COORDS[stop.name] = stop.coords;
      });
      loaded = true;
    }

    transitApiLoadStatus.bus = loaded ? 'api' : 'fallback';
  }

  async function refreshBusVehiclePositions(option) {
    if (!hasApiUrl(TRANSIT_API_CONFIG.bus.vehiclesUrl)) return;
    const route = option?.segments?.[0]?.route?.number || '';
    const payload = await fetchTransitJson(TRANSIT_API_CONFIG.bus.vehiclesUrl, { route }).catch(() => null);
    busVehiclePositions = unwrapRecords(payload).map(normalizeVehiclePosition).filter(Boolean);
  }

  async function loadTransitApiData() {
    updateTransitApiStatus();
    await Promise.all([loadMetroApiData(), loadBusApiData()]);
    rebuildDerivedTransitData();
    updateTransitApiStatus();
    renderMetroMap();
  }

  function getMapPoint(stationName) {
    const station = STATIONS[stationName];
    const minLng = 77.45;
    const maxLng = 77.77;
    const minLat = 12.81;
    const maxLat = 13.07;
    const x = 70 + ((station.lng - minLng) / (maxLng - minLng)) * 960;
    const y = 670 - ((station.lat - minLat) / (maxLat - minLat)) * 570;
    return { x, y };
  }

  function shortMapLabel(name) {
    return name
      .replace("Nadaprabhu Kempegowda (Majestic)", "Majestic")
      .replace("Rashtreeya Vidyalaya Road", "RV Road")
      .replace("Balagangadharanatha Swamiji Station, Hosahalli", "Hosahalli")
      .replace("Krantivira Sangolli Rayanna Railway Station", "KSR Station")
      .replace("Sir M. Visvesvaraya Station, Central College", "Central College")
      .replace("Dr. B. R. Ambedkar Station, Vidhana Soudha", "Vidhana Soudha")
      .replace("Pantharapalya - Nayandahalli", "Nayandahalli")
      .replace("Sri Sathya Sai Hospital", "Sathya Sai")
      .replace("Hopefarm Channasandra", "Hopefarm")
      .replace("Whitefield (Kadugodi)", "Whitefield")
      .replace("Infosys Foundation Konappana Agrahara", "Konappana Agrahara")
      .replace("Biocon Hebbagodi", "Hebbagodi")
      .replace("Delta electronics Bommasandra", "Bommasandra");
  }

  function makeSvgEl(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function uniqueMapEdges() {
    const edges = [];
    const seen = new Set();
    Object.entries(ADJACENCY).forEach(([from, neighbors]) => {
      neighbors.forEach(to => {
        const key = [from, to].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([from, to]);
        }
      });
    });
    return edges;
  }

  function isRouteEdge(from, to) {
    for (let i = 0; i < currentRoutePath.length - 1; i++) {
      const a = currentRoutePath[i];
      const b = currentRoutePath[i + 1];
      if ((a === from && b === to) || (a === to && b === from)) return true;
    }
    return false;
  }

  function getFocusedMapViewBox() {
    if (currentRoutePath.length < 2) {
      currentMapView = { x: 0, y: 0, width: 1100, height: 760 };
      return "0 0 1100 760";
    }

    const points = currentRoutePath.map(getMapPoint);
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padding = 90;
    const x = Math.max(0, minX - padding);
    const y = Math.max(0, minY - padding);
    const width = Math.min(1100 - x, Math.max(360, maxX - minX + padding * 2));
    const height = Math.min(760 - y, Math.max(300, maxY - minY + padding * 2));
    currentMapView = { x, y, width, height };
    return `${x} ${y} ${width} ${height}`;
  }

  function doBoxesOverlap(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  function clampLabelBox(box) {
    const minX = currentMapView.x + 10;
    const minY = currentMapView.y + 10;
    const maxX = currentMapView.x + currentMapView.width - 10 - box.width;
    const maxY = currentMapView.y + currentMapView.height - 10 - box.height;
    return {
      ...box,
      x: Math.max(minX, Math.min(maxX, box.x)),
      y: Math.max(minY, Math.min(maxY, box.y))
    };
  }

  function drawMapLabel(svg, occupiedLabels, request) {
    const { point, text, fontSize, isRoute, routeIndex, priority } = request;
    const width = Math.min(230, Math.max(58, text.length * fontSize * 0.58 + 18));
    const height = fontSize + 12;
    const routeAbove = routeIndex % 2 === 0;
    const candidates = isRoute ? [
      { x: point.x + 18, y: point.y + (routeAbove ? -46 : 22) },
      { x: point.x - width - 18, y: point.y + (routeAbove ? -46 : 22) },
      { x: point.x + 18, y: point.y + (routeAbove ? -74 : 48) },
      { x: point.x - width - 18, y: point.y + (routeAbove ? -74 : 48) },
      { x: point.x - width / 2, y: point.y + (routeAbove ? -62 : 36) }
    ] : [
      { x: point.x + 10, y: point.y - 26 },
      { x: point.x + 10, y: point.y + 12 },
      { x: point.x - width - 10, y: point.y - 26 }
    ];

    let chosen = null;
    for (const candidate of candidates) {
      const box = clampLabelBox({ ...candidate, width, height });
      if (!occupiedLabels.some(existing => doBoxesOverlap(existing, box))) {
        chosen = box;
        break;
      }
    }

    if (!chosen && priority) chosen = clampLabelBox({ ...candidates[0], width, height });
    if (!chosen) return;

    occupiedLabels.push(chosen);

    if (isRoute) {
      svg.appendChild(makeSvgEl('line', {
        x1: point.x,
        y1: point.y,
        x2: chosen.x + width / 2,
        y2: chosen.y + height / 2,
        class: 'map-label-leader'
      }));
    }

    svg.appendChild(makeSvgEl('rect', {
      x: chosen.x,
      y: chosen.y,
      width,
      height,
      rx: 7,
      class: 'map-label-bg'
    }));

    const label = makeSvgEl('text', {
      x: chosen.x + 9,
      y: chosen.y + fontSize + 2,
      class: `map-label${isRoute ? ' route-label' : ''}`,
      'font-size': fontSize
    });
    label.textContent = text;
    svg.appendChild(label);
  }

  function getRouteLineAt(index) {
    const current = currentRoutePath[index];
    const next = currentRoutePath[index + 1] || currentRoutePath[index - 1];
    if (!next) return STATIONS[current]?.line || "Purple Line";
    return getLineForSegment(current, next);
  }

  function drawSelectedRouteMap(svg) {
    const totalStops = currentRoutePath.length - 1;
    const pointsPerRow = 6;
    const rowGap = 170;
    const startX = 92;
    const stepX = 180;
    const topY = 168;
    const rows = Math.ceil(currentRoutePath.length / pointsPerRow);
    const mapHeight = Math.max(520, topY + (rows - 1) * rowGap + 150);

    svg.setAttribute('viewBox', `0 0 1100 ${mapHeight}`);
    svg.style.height = `${Math.min(760, Math.max(470, mapHeight))}px`;
    svg.innerHTML = '';

    svg.appendChild(makeSvgEl('rect', { x: 0, y: 0, width: 1100, height: mapHeight, fill: 'url(#routeBg)', opacity: 0.72 }));
    const defs = makeSvgEl('defs');
    const bgGradient = makeSvgEl('linearGradient', { id: 'routeBg', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    bgGradient.appendChild(makeSvgEl('stop', { offset: '0%', 'stop-color': '#f8fafc' }));
    bgGradient.appendChild(makeSvgEl('stop', { offset: '52%', 'stop-color': '#eef6fb' }));
    bgGradient.appendChild(makeSvgEl('stop', { offset: '100%', 'stop-color': '#ffffff' }));
    defs.appendChild(bgGradient);
    svg.appendChild(defs);
    for (let x = 60; x < 1060; x += 40) {
      svg.appendChild(makeSvgEl('line', { x1: x, y1: 130, x2: x, y2: mapHeight - 32, stroke: '#0f172a', 'stroke-width': 1, opacity: 0.025 }));
    }
    for (let y = 150; y < mapHeight - 32; y += 40) {
      svg.appendChild(makeSvgEl('line', { x1: 48, y1: y, x2: 1052, y2: y, stroke: '#0f172a', 'stroke-width': 1, opacity: 0.025 }));
    }
    svg.appendChild(makeSvgEl('rect', { x: 34, y: 28, width: 1032, height: 92, rx: 18, class: 'route-map-card' }));
    svg.appendChild(makeSvgEl('rect', { x: 44, y: 136, width: 1012, height: mapHeight - 168, rx: 26, class: 'route-map-panel' }));

    const from = currentRoutePath[0];
    const to = currentRoutePath[currentRoutePath.length - 1];
    const title = makeSvgEl('text', { x: 64, y: 66, class: 'route-map-title' });
    title.textContent = `${shortMapLabel(from)} to ${shortMapLabel(to)}`;
    svg.appendChild(title);

    const sub = makeSvgEl('text', { x: 64, y: 94, class: 'route-map-subtitle' });
    sub.textContent = `${totalStops} stops • live station and transfers highlighted`;
    svg.appendChild(sub);

    const positions = currentRoutePath.map((stationName, index) => {
      const row = Math.floor(index / pointsPerRow);
      const colRaw = index % pointsPerRow;
      const col = row % 2 === 1 ? pointsPerRow - 1 - colRaw : colRaw;
      return { stationName, index, x: startX + col * stepX, y: topY + row * rowGap };
    });

    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i];
      const b = positions[i + 1];
      const lineName = getLineForSegment(a.stationName, b.stationName);
      const color = LINE_COLORS[lineName] || '#38bdf8';
      svg.appendChild(makeSvgEl('line', {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: '#0f172a',
        class: 'route-track-shadow'
      }));
      svg.appendChild(makeSvgEl('line', {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: color,
        class: 'route-track-glow'
      }));
      svg.appendChild(makeSvgEl('line', {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: color,
        class: 'route-track-main'
      }));
    }

    positions.forEach(({ stationName, index, x, y }) => {
      const station = STATIONS[stationName];
      const isStart = index === 0;
      const isEnd = index === positions.length - 1;
      const isTransfer = station.line === 'Interchange';
      const isLive = currentNearestStation === stationName;
      const lineName = getRouteLineAt(index);
      const fill = isLive ? '#f43f5e' : (isTransfer ? '#f59e0b' : '#ffffff');
      const stroke = isStart || isEnd ? '#0f172a' : (LINE_COLORS[lineName] || '#64748b');
      const radius = isStart || isEnd || isTransfer || isLive ? 13 : 9;

      svg.appendChild(makeSvgEl('circle', { cx: x, cy: y, r: radius + 7, class: 'route-node-halo' }));
      svg.appendChild(makeSvgEl('circle', {
        cx: x, cy: y, r: radius, fill, stroke, 'stroke-width': 4,
        class: 'route-node-core',
        filter: isLive ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.75))' : ''
      }));

      if (isStart || isEnd || isTransfer || isLive) {
        const badge = makeSvgEl('text', {
          x, y: y + 5, 'text-anchor': 'middle',
          fill: isTransfer ? '#0f172a' : (isLive ? '#ffffff' : '#0f172a'),
          'font-size': 13, 'font-weight': 900
        });
        badge.textContent = isStart ? 'S' : (isEnd ? 'E' : (isLive ? 'L' : 'T'));
        svg.appendChild(badge);
      }

      const labelAbove = index % 2 === 0;
      const labelY = labelAbove ? y - 34 : y + 45;
      const label = makeSvgEl('text', {
        x, y: labelY, 'text-anchor': 'middle', class: 'route-station-label', 'font-size': 13
      });
      label.textContent = shortMapLabel(stationName);
      svg.appendChild(label);

      const meta = makeSvgEl('text', {
        x, y: labelY + 18, 'text-anchor': 'middle', class: 'route-station-meta'
      });
      meta.textContent = isStart ? 'Start' : (isEnd ? 'Destination' : (isTransfer ? 'Transfer' : `${index} stop${index > 1 ? 's' : ''}`));
      svg.appendChild(meta);

      if (isStart || isEnd || isTransfer || isLive) {
        const chipText = isLive ? 'LIVE' : (isTransfer ? 'SWITCH' : (isStart ? 'START' : 'END'));
        const chipWidth = chipText.length * 8 + 20;
        const chipY = labelAbove ? labelY - 31 : labelY + 28;
        svg.appendChild(makeSvgEl('rect', {
          x: x - chipWidth / 2,
          y: chipY,
          width: chipWidth,
          height: 22,
          rx: 11,
          class: 'route-chip'
        }));
        const chipLabel = makeSvgEl('text', {
          x,
          y: chipY + 15,
          'text-anchor': 'middle',
          class: 'route-chip-text'
        });
        chipLabel.textContent = chipText;
        svg.appendChild(chipLabel);
      }
    });
  }

  function updatePanelVisibility() {
    const isBus = activeTransportMode === 'bus';
    document.getElementById('map-card').style.display = isBus ? 'none' : 'block';
    document.getElementById('unselected-card').style.display = !isBus && currentPanel === 'unselected' ? 'block' : 'none';
    document.getElementById('result-card').style.display = !isBus && currentPanel === 'result' ? 'block' : 'none';
  }

  function requestLeafletAutoFit(resetTouch = false) {
    leafletAutoFitRequested = true;
    if (resetTouch) leafletUserTouched = false;
  }

  function setActiveView(view) {
    activeView = view;
    if (view === 'map') requestLeafletAutoFit(false);
    updatePanelVisibility();
    renderMetroMap();
  }

  function updateMapStats() {
    const stopsStat = document.getElementById('map-stops-stat');
    const linesStat = document.getElementById('map-lines-stat');
    if (!stopsStat || !linesStat) return;

    if (currentRoutePath.length < 2) {
      stopsStat.textContent = '-- stops';
      linesStat.textContent = 'Overview';
      return;
    }

    const lineNames = new Set();
    for (let i = 0; i < currentRoutePath.length - 1; i++) {
      lineNames.add(getLineForSegment(currentRoutePath[i], currentRoutePath[i + 1]));
    }

    const stops = currentRoutePath.length - 1;
    stopsStat.textContent = `${stops} stop${stops === 1 ? '' : 's'}`;
    linesStat.textContent = `${lineNames.size} line${lineNames.size === 1 ? '' : 's'}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getLineOverviewPath(lineName) {
    const endpoints = {
      "Purple Line": ["Challaghatta", "Whitefield (Kadugodi)"],
      "Green Line": ["Madavara", "Silk Institute"],
      "Yellow Line": ["Rashtreeya Vidyalaya Road", "Delta electronics Bommasandra"]
    };
    const [start, end] = endpoints[lineName];
    return findShortestPath(start, end) || [];
  }

  function mapPointForCanvas(stationName, viewport) {
    const point = getMapPoint(stationName);
    if (!viewport) return point;
    return {
      x: (point.x - viewport.minX) * viewport.scale + viewport.pad,
      y: (point.y - viewport.minY) * viewport.scale + viewport.pad
    };
  }

  function getRouteMapViewport(isRouteMap) {
    if (!isRouteMap) return null;
    const routePoints = currentRoutePath.map(getMapPoint);
    if (currentNearestStation && STATIONS[currentNearestStation]) routePoints.push(getMapPoint(currentNearestStation));
    const xs = routePoints.map(p => p.x);
    const ys = routePoints.map(p => p.y);
    const minX = Math.max(0, Math.min(...xs) - 100);
    const maxX = Math.min(1100, Math.max(...xs) + 150);
    const minY = Math.max(0, Math.min(...ys) - 115);
    const maxY = Math.min(760, Math.max(...ys) + 125);
    const width = Math.max(360, maxX - minX);
    const height = Math.max(340, maxY - minY);
    const pad = 72;
    const maxCanvasWidth = 980;
    const maxCanvasHeight = 680;
    const scale = Math.min(1.55, Math.max(0.82, Math.min(maxCanvasWidth / width, maxCanvasHeight / height)));
    return {
      minX,
      minY,
      scale,
      pad,
      width: Math.ceil(width * scale + pad * 2),
      height: Math.ceil(height * scale + pad * 2)
    };
  }

  function mapSegmentHtml(from, to, state = '', viewport = null) {
    const a = mapPointForCanvas(from, viewport);
    const b = mapPointForCanvas(to, viewport);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const lineName = getLineForSegment(from, to);
    const color = LINE_COLORS[lineName] || LINE_COLORS.Interchange;
    return `<div class="html-map-edge ${state}" style="--line-color:${color};--x:${a.x}px;--y:${a.y}px;--length:${length}px;--angle:${angle}deg"></div>`;
  }

  function shouldShowMapLabel(stationName, isRouteMap) {
    const station = STATIONS[stationName];
    const routeIndex = currentRoutePath.indexOf(stationName);
    if (stationName === currentNearestStation) return true;
    if (routeIndex === 0 || routeIndex === currentRoutePath.length - 1) return true;
    if (station.line === 'Interchange') return true;
    if (isRouteMap) return routeIndex > -1;
    return station.order % 4 === 0 || stationName.includes('Whitefield') || stationName === 'Challaghatta';
  }

  function renderHtmlSpatialMap(container) {
    const isRouteMap = currentRoutePath.length > 1;
    const viewport = getRouteMapViewport(isRouteMap);
    const routeSet = new Set(currentRoutePath);
    const routeEdges = new Set();
    for (let i = 0; i < currentRoutePath.length - 1; i++) {
      routeEdges.add([currentRoutePath[i], currentRoutePath[i + 1]].sort().join('|'));
    }

    const edgeHtml = uniqueMapEdges().map(([from, to]) => {
      const key = [from, to].sort().join('|');
      const state = isRouteMap ? (routeEdges.has(key) ? 'active' : 'muted') : '';
      return mapSegmentHtml(from, to, state, viewport);
    }).join('');

    const nodeHtml = Object.keys(STATIONS).map(stationName => {
      const p = mapPointForCanvas(stationName, viewport);
      const station = STATIONS[stationName];
      const isSelected = routeSet.has(stationName);
      const isLive = currentNearestStation === stationName;
      const lineName = station.line === 'Interchange' ? getRouteLineAt(Math.max(0, currentRoutePath.indexOf(stationName))) : station.line;
      const color = LINE_COLORS[lineName] || LINE_COLORS.Interchange;
      const hiddenInRoute = isRouteMap && !isSelected && !isLive && station.line !== 'Interchange';
      if (hiddenInRoute) return '';
      return `
        <div class="html-map-node ${isSelected ? 'selected' : ''} ${station.line === 'Interchange' ? 'interchange' : ''} ${isLive ? 'live' : ''}" style="--line-color:${color};--x:${p.x}px;--y:${p.y}px" title="${escapeHtml(stationName)}"></div>
        ${isLive ? `<div class="html-map-train" style="--x:${p.x}px;--y:${p.y}px" aria-label="Live nearest train">🚆</div>` : ''}
      `;
    }).join('');

    const labelHtml = Object.keys(STATIONS).map((stationName) => {
      if (!shouldShowMapLabel(stationName, isRouteMap)) return '';
      const p = mapPointForCanvas(stationName, viewport);
      const routeIndex = currentRoutePath.indexOf(stationName);
      const below = routeIndex > -1 ? routeIndex % 2 === 1 : STATIONS[stationName].order % 2 === 0;
      const isLive = currentNearestStation === stationName;
      return `<div class="html-map-label ${below ? 'below' : ''} ${isLive ? 'live-label' : ''}" style="--x:${p.x}px;--y:${p.y}px">${escapeHtml(shortMapLabel(stationName))}</div>`;
    }).join('');

    const titleHtml = isRouteMap ? (() => {
      const from = currentRoutePath[0];
      const to = currentRoutePath[currentRoutePath.length - 1];
      const stops = currentRoutePath.length - 1;
      const lineNames = new Set();
      for (let i = 0; i < currentRoutePath.length - 1; i++) lineNames.add(getLineForSegment(currentRoutePath[i], currentRoutePath[i + 1]));
      return `
        <div class="html-map-route-title">
          <strong>${escapeHtml(shortMapLabel(from))} to ${escapeHtml(shortMapLabel(to))}</strong>
          <span>${stops} stop${stops === 1 ? '' : 's'} • ${lineNames.size} line${lineNames.size === 1 ? '' : 's'} • selected route highlighted</span>
        </div>
      `;
    })() : `
      <div class="html-map-route-title">
        <strong>Namma Metro network</strong>
        <span>Spatial schematic with live nearest station marker</span>
      </div>
    `;

    container.innerHTML = `
      <div class="html-map-canvas-wrap">
        <div class="html-map-canvas ${isRouteMap ? 'route-zoom' : ''}" style="${viewport ? `--canvas-width:${viewport.width}px;--canvas-height:${viewport.height}px;` : ''}">
          ${edgeHtml}
          ${nodeHtml}
          ${labelHtml}
          ${titleHtml}
        </div>
      </div>
    `;

    const wrap = container.querySelector('.html-map-canvas-wrap');
    if (wrap) {
      requestAnimationFrame(() => {
        if (isRouteMap) {
          wrap.scrollLeft = Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / 2);
          wrap.scrollTop = 0;
        } else {
          wrap.scrollLeft = Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / 2);
        }
      });
    }
  }

  function renderHtmlMetroMap() {
    const container = document.getElementById('html-metro-map');
    if (!container) return;

    updateMapStats();
    const summary = document.getElementById('map-summary');
    const livePill = document.getElementById('map-live-pill');
    const from = normalizeStationName(document.getElementById('from-input')?.value || '');
    const to = normalizeStationName(document.getElementById('to-input')?.value || '');

    if (currentRoutePath.length > 1) {
      renderHtmlSpatialMap(container);
      if (summary) summary.textContent = `${from} to ${to} • ${currentRoutePath.length - 1} stops highlighted`;
    } else {
      renderHtmlSpatialMap(container);
      if (summary) {
        summary.textContent = STATIONS[from]
          ? `Boarding station selected: ${from}`
          : 'Allow GPS or choose stations to highlight your route.';
      }
    }

    if (livePill) livePill.textContent = currentNearestStation ? `Live: ${currentNearestStation}` : 'Live: waiting';
  }

  function canUseLeafletMap() {
    return typeof L !== 'undefined' && Boolean(document.getElementById('leaflet-map'));
  }

  function stationLatLng(stationName) {
    const station = STATIONS[stationName];
    return station ? [station.lat, station.lng] : null;
  }

  function initLeafletMap() {
    if (!canUseLeafletMap()) return false;
    if (leafletMap) return true;

    leafletMap = L.map('leaflet-map', {
      zoomControl: true,
      attributionControl: true
    }).setView([12.9716, 77.5946], 11);

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });

    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });

    satellite.addTo(leafletMap);
    leafletBaseLayers = {
      'Satellite': satellite,
      'Street map': street
    };
    L.control.layers(leafletBaseLayers, null, { position: 'topright' }).addTo(leafletMap);
    leafletLayerGroup = L.layerGroup().addTo(leafletMap);
    leafletMap.on('dragstart zoomstart', () => {
      if (!leafletProgrammaticFit) leafletUserTouched = true;
    });
    setTimeout(() => leafletMap.invalidateSize(), 0);
    return true;
  }

  function renderLeafletMetroMap() {
    if (!initLeafletMap()) return false;

    const leafletEl = document.getElementById('leaflet-map');
    const htmlMap = document.getElementById('html-metro-map');
    if (leafletEl) leafletEl.classList.add('active');
    if (htmlMap) htmlMap.style.display = 'none';

    updateMapStats();
    leafletLayerGroup.clearLayers();

    const summary = document.getElementById('map-summary');
    const livePill = document.getElementById('map-live-pill');
    const from = normalizeStationName(document.getElementById('from-input')?.value || '');
    const to = normalizeStationName(document.getElementById('to-input')?.value || '');
    const isRouteMap = currentRoutePath.length > 1;
    const bounds = [];
    const routeEdgeKeys = new Set();
    const focusKey = isRouteMap
      ? `route:${currentRoutePath.join('|')}`
      : 'overview:network';
    const renderKey = [
      activeView,
      focusKey,
      from,
      to,
      currentNearestStation || '',
      leafletAutoFitRequested ? 'fit' : 'steady'
    ].join('::');

    if (renderKey === lastLeafletRenderKey && !leafletAutoFitRequested) {
      return true;
    }
    lastLeafletRenderKey = renderKey;

    if (isRouteMap) {
      for (let i = 0; i < currentRoutePath.length - 1; i++) {
        routeEdgeKeys.add([currentRoutePath[i], currentRoutePath[i + 1]].sort().join('|'));
      }
    }

    const edges = isRouteMap
      ? currentRoutePath.slice(0, -1).map((stationName, index) => [stationName, currentRoutePath[index + 1]])
      : uniqueMapEdges();

    edges.forEach(([fromStation, toStation]) => {
      const fromLatLng = stationLatLng(fromStation);
      const toLatLng = stationLatLng(toStation);
      if (!fromLatLng || !toLatLng) return;

      const lineName = getLineForSegment(fromStation, toStation);
      const color = LINE_COLORS[lineName] || '#38bdf8';
      const edgeKey = [fromStation, toStation].sort().join('|');
      const highlighted = !isRouteMap || routeEdgeKeys.has(edgeKey);
      L.polyline([fromLatLng, toLatLng], {
        color,
        weight: highlighted ? 6 : 3,
        opacity: highlighted ? 0.95 : 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(leafletLayerGroup);
      bounds.push(fromLatLng, toLatLng);
    });

    const stationList = isRouteMap
      ? Array.from(new Set([...currentRoutePath, currentNearestStation].filter(Boolean)))
      : Object.keys(STATIONS);

    stationList.forEach((stationName) => {
      const latLng = stationLatLng(stationName);
      const station = STATIONS[stationName];
      if (!latLng || !station) return;

      const routeIndex = currentRoutePath.indexOf(stationName);
      const selected = routeIndex > -1;
      const lineName = selected ? getRouteLineAt(routeIndex) : station.line;
      const color = LINE_COLORS[lineName] || LINE_COLORS.Interchange;
      const size = selected ? 20 : 16;
      const markerIcon = L.divIcon({
        className: '',
        html: `<div class="leaflet-station-marker ${selected ? 'selected' : ''}" style="--marker-color:${color}"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      L.marker(latLng, { icon: markerIcon, title: stationName })
        .bindTooltip(shortMapLabel(stationName), {
          direction: 'top',
          offset: [0, -9],
          opacity: 0.95,
          permanent: selected,
          sticky: !selected,
          className: selected ? 'route-station-label' : 'station-label'
        })
        .addTo(leafletLayerGroup);
      bounds.push(latLng);
    });

    if (currentNearestStation && STATIONS[currentNearestStation]) {
      const liveLatLng = stationLatLng(currentNearestStation);
      const trainIcon = L.divIcon({
        className: '',
        html: '<div class="leaflet-train-marker">🚆</div>',
        iconSize: [34, 28],
        iconAnchor: [17, 14]
      });
      L.marker(liveLatLng, { icon: trainIcon, title: `Live nearest: ${currentNearestStation}`, zIndexOffset: 1000 })
        .bindTooltip(`Live nearest: ${shortMapLabel(currentNearestStation)}`, {
          direction: 'bottom',
          offset: [0, 10],
          opacity: 0.98,
          permanent: true,
          className: 'live-location-label'
        })
        .addTo(leafletLayerGroup);
      bounds.push(liveLatLng);
    }

    if (summary) {
      if (isRouteMap) {
        summary.textContent = `${from} to ${to} • ${currentRoutePath.length - 1} stops highlighted on real map`;
      } else {
        summary.textContent = STATIONS[from]
          ? `Boarding station selected: ${from}`
          : 'Allow GPS or choose stations to highlight your route.';
      }
    }
    if (livePill) livePill.textContent = currentNearestStation ? `Live: ${currentNearestStation}` : 'Live: waiting';

    const focusBounds = isRouteMap
      ? currentRoutePath.map(stationLatLng).filter(Boolean)
      : bounds;
    const shouldAutoFitMap = leafletAutoFitRequested && (!leafletUserTouched || isRouteMap);

    setTimeout(() => {
      if (!shouldAutoFitMap) {
        leafletAutoFitRequested = false;
        return;
      }
      leafletMap.invalidateSize({ pan: false });
      leafletProgrammaticFit = true;
      leafletAutoFitRequested = false;
      leafletUserTouched = false;
      lastLeafletFocusKey = focusKey;
      if (focusBounds.length) {
        leafletMap.fitBounds(focusBounds, {
          animate: false,
          padding: isRouteMap ? [18, 18] : [28, 28],
          maxZoom: isRouteMap ? 16 : 12
        });
      } else {
        leafletMap.setView([12.9716, 77.5946], 11, { animate: false });
      }
      setTimeout(() => { leafletProgrammaticFit = false; }, 350);
    }, 0);
    return true;
  }

  function renderMetroMap() {
    if (renderLeafletMetroMap()) return;

    const leafletEl = document.getElementById('leaflet-map');
    const htmlMap = document.getElementById('html-metro-map');
    if (leafletEl) leafletEl.classList.remove('active');
    if (htmlMap) htmlMap.style.display = '';

    renderHtmlMetroMap();
    return;

    const svg = document.getElementById('metro-map');
    if (!svg) return;
    updateMapStats();

    if (currentRoutePath.length > 1) {
      drawSelectedRouteMap(svg);
      const from = normalizeStationName(document.getElementById('from-input')?.value || '');
      const to = normalizeStationName(document.getElementById('to-input')?.value || '');
      const summary = document.getElementById('map-summary');
      const livePill = document.getElementById('map-live-pill');
      if (summary) summary.textContent = `${from} to ${to} • ${currentRoutePath.length - 1} stops highlighted`;
      if (livePill) livePill.textContent = currentNearestStation ? `Live: ${currentNearestStation}` : 'Live: waiting';
      return;
    }

    svg.innerHTML = '';
    svg.style.height = '';
    svg.setAttribute('viewBox', getFocusedMapViewBox());
    svg.classList.toggle('route-focused', currentRoutePath.length > 1);

    const bg = makeSvgEl('rect', { x: 0, y: 0, width: 1100, height: 760, fill: '#f8fafc', opacity: 0.68 });
    svg.appendChild(bg);

    const title = makeSvgEl('text', { x: 68, y: 60, class: 'map-label', 'font-size': 22 });
    title.textContent = 'Namma Metro Live Route Map';
    svg.appendChild(title);

    const north = makeSvgEl('text', { x: 1010, y: 54, class: 'map-label-muted', 'font-size': 13 });
    north.textContent = 'N';
    svg.appendChild(north);
    svg.appendChild(makeSvgEl('path', { d: 'M1016 66 L1030 102 L1016 92 L1002 102 Z', fill: 'none', stroke: '#0369a1', 'stroke-width': 3 }));

    uniqueMapEdges().forEach(([from, to]) => {
      const a = getMapPoint(from);
      const b = getMapPoint(to);
      const lineName = getLineForSegment(from, to);
      const active = isRouteEdge(from, to);
      const path = makeSvgEl('line', {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        class: `map-line${active ? ' route-active' : ''}${currentRoutePath.length > 1 && !active ? ' map-muted' : ''}`,
        stroke: active ? '#0f172a' : (LINE_COLORS[lineName] || '#94a3b8'),
        'stroke-width': active ? 12 : 5
      });
      svg.appendChild(path);

      if (active) {
        const colorLine = makeSvgEl('line', {
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          class: 'map-line route-active',
          stroke: LINE_COLORS[lineName] || '#38bdf8',
          'stroke-width': 7
        });
        svg.appendChild(colorLine);
      }
    });

    const labelRequests = [];

    Object.keys(STATIONS).forEach((stationName) => {
      const p = getMapPoint(stationName);
      const station = STATIONS[stationName];
      const isSelected = currentRoutePath.includes(stationName);
      const isLive = currentNearestStation === stationName;
      const routeIndex = currentRoutePath.indexOf(stationName);
      const circle = makeSvgEl('circle', {
        cx: p.x,
        cy: p.y,
        r: isLive ? 10 : (isSelected ? 8 : 4.5),
        class: `map-station${isSelected ? ' selected' : ''}${isLive ? ' live' : ''}`,
        opacity: currentRoutePath.length > 1 && !isSelected && !isLive ? 0.25 : 1,
        stroke: LINE_COLORS[station.line] || '#64748b'
      });
      circle.appendChild(makeSvgEl('title'));
      circle.querySelector('title').textContent = stationName;
      circle.addEventListener('click', () => {
        const toInput = document.getElementById('to-input');
        if (document.getElementById('from-input').value.trim() && normalizeStationName(document.getElementById('from-input').value) !== stationName) {
          toInput.value = stationName;
        } else {
          document.getElementById('from-input').value = stationName;
          setFromStationSource('manual');
        }
        requestLeafletAutoFit(true);
        updateRouteFromInputs(false);
      });
      svg.appendChild(circle);

      const isRouteKeyStop = routeIndex === 0 ||
        routeIndex === currentRoutePath.length - 1 ||
        station.line === 'Interchange' ||
        isLive;
      const shouldLabel = currentRoutePath.length > 1
        ? (isSelected && (isRouteKeyStop || routeIndex % 2 === 0))
        : (isSelected || isLive || station.line === 'Interchange' || station.order % 3 === 0);

      if (shouldLabel) {
        labelRequests.push({
          point: p,
          text: shortMapLabel(stationName),
          fontSize: currentRoutePath.length > 1 ? 15 : (isLive || station.line === 'Interchange' ? 13 : 11),
          isRoute: currentRoutePath.length > 1 && isSelected,
          routeIndex: Math.max(0, routeIndex),
          priority: currentRoutePath.length > 1 ? isRouteKeyStop : (isLive || station.line === 'Interchange')
        });
      }
    });

    const occupiedLabels = [];
    labelRequests
      .sort((a, b) => Number(b.priority) - Number(a.priority))
      .forEach(request => drawMapLabel(svg, occupiedLabels, request));

    const from = normalizeStationName(document.getElementById('from-input')?.value || '');
    const to = normalizeStationName(document.getElementById('to-input')?.value || '');
    const summary = document.getElementById('map-summary');
    const livePill = document.getElementById('map-live-pill');

    if (summary) {
      if (currentRoutePath.length > 1) {
        summary.textContent = `${from} to ${to} • ${currentRoutePath.length - 1} stops highlighted`;
      } else if (STATIONS[from]) {
        summary.textContent = `Boarding station selected: ${from}`;
      } else {
        summary.textContent = 'Allow GPS or choose stations to highlight your route.';
      }
    }

    if (livePill) {
      livePill.textContent = currentNearestStation ? `Live: ${currentNearestStation}` : 'Live: waiting';
    }
  }

  function normalizeStationName(name) {
    const trimmed = name.trim();
    return STATION_ALIASES[trimmed] || trimmed;
  }

  function formatDistance(distanceKm) {
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
    return `${distanceKm.toFixed(1)}km`;
  }

  function getMetroPlaceStatusElement(inputId) {
    return document.getElementById(inputId === 'from-input' ? 'gps-status' : 'to-place-status');
  }

  function normalizePlaceCandidate(record) {
    if (!record || typeof record !== 'object') return null;
    const coords = coordinatesFrom(record) || {
      lat: parseFloat(record.lat || record.latitude),
      lng: parseFloat(record.lon || record.lng || record.longitude)
    };
    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return null;
    const name = String(record.name || record.display_name || record.label || 'Map result').split(',')[0].trim();
    return {
      lat: coords.lat,
      lng: coords.lng,
      name,
      label: String(record.display_name || record.name || record.label || 'map result')
    };
  }

  async function fetchPlaceCandidates(query) {
    if (!hasApiUrl(TRANSIT_API_CONFIG.geocodingUrl) || query.trim().length < 3) return [];
    const payload = await fetchTransitJson(TRANSIT_API_CONFIG.geocodingUrl, { query }).catch(() => null);
    return unwrapRecords(payload).map(normalizePlaceCandidate).filter(Boolean);
  }

  function nearestStationForPlaceCandidate(candidate) {
    if (!candidate) return null;
    const station = findNearestPoint(candidate.lat, candidate.lng, STATIONS);
    return station ? { ...station, place: candidate } : null;
  }

  function applyNearestStationFromPlace(inputId, query, nearest) {
    const input = document.getElementById(inputId);
    const status = getMetroPlaceStatusElement(inputId);
    const cleanedQuery = query.trim();

    if (!input || !nearest) return false;

    input.value = nearest.name;
    if (inputId === 'from-input') {
      setFromStationSource('manual');
      renderUnselectedDualDirections(nearest.name);
    }

    currentNearestStation = nearest.name;
    requestLeafletAutoFit(true);
    updateRouteFromInputs(false);
    renderMetroMap();

    if (status) {
      status.innerHTML = `Map search matched <strong>${cleanedQuery}</strong> to nearest metro station <strong>${nearest.name}</strong> (${formatDistance(nearest.distanceKm)} away).`;
    }

    return true;
  }

  async function resolvePlaceToNearestStation(inputId, query, options = {}) {
    const input = document.getElementById(inputId);
    const status = getMetroPlaceStatusElement(inputId);
    const cleanedQuery = query.trim();
    const normalizedInput = normalizeStationName(cleanedQuery);

    if (!input || !cleanedQuery || STATIONS[normalizedInput]) return false;
    if (!hasApiUrl(TRANSIT_API_CONFIG.geocodingUrl)) {
      if (!options.silent && status) status.innerText = 'Map search is not configured. Choose a station from the dropdown.';
      return false;
    }

    if (status) status.innerText = `Searching map for "${cleanedQuery}"...`;

    const candidates = await fetchPlaceCandidates(cleanedQuery);
    const nearest = candidates
      .map(nearestStationForPlaceCandidate)
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    if (!nearest) {
      if (status) status.innerText = `No Bengaluru map match found for "${cleanedQuery}". Try a more specific place name.`;
      return false;
    }

    return applyNearestStationFromPlace(inputId, cleanedQuery, nearest);
  }

  function setFromStationSource(source) {
    fromStationSource = source;
    const fromInput = document.getElementById('from-input');
    const fromClear = document.getElementById('from-clear');
    const isLive = source === 'live';

    document.getElementById('from-source-toggle').checked = source === 'live';
    document.getElementById('from-source-label').innerText = isLive ? 'Live GPS from station' : 'Manual from station';
    document.getElementById('from-source-helper').innerText = isLive
      ? 'Turn off to search and choose a boarding station manually.'
      : 'Type a station, area, landmark, or address. Map search picks the nearest station.';
    fromInput.readOnly = isLive;
    fromInput.placeholder = isLive ? 'Detecting nearest station via GPS...' : 'Search station or place, e.g. Forum Mall...';
    fromClear.style.display = (!isLive && fromInput.value.trim()) ? 'flex' : 'none';
  }

  function setBusFromSource(source) {
    busFromSource = source;
    const fromInput = document.getElementById('bus-from-input');
    const fromClear = document.getElementById('bus-from-clear');
    const isLive = source === 'live';

    document.getElementById('bus-from-source-toggle').checked = isLive;
    document.getElementById('bus-from-source-label').innerText = isLive ? 'Live GPS from bus stop' : 'Manual bus stop';
    document.getElementById('bus-from-source-helper').innerText = isLive
      ? 'Turn off to search and choose a BMTC boarding stop manually.'
      : 'Type to filter bus stops. Live GPS will not replace this field.';
    fromInput.readOnly = isLive;
    fromInput.placeholder = isLive ? 'Detecting nearest BMTC stop via GPS...' : 'Search boarding area, e.g. Majestic, Silk Board...';
    fromClear.style.display = (!isLive && fromInput.value.trim()) ? 'flex' : 'none';
  }

  function shouldTrackGPS() {
    return fromStationSource === 'live' || busFromSource === 'live';
  }

  function getBengaluruTimeParts() {
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      hourCycle: 'h12'
    }).formatToParts(new Date());

    return parts.reduce((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value;
      return acc;
    }, {});
  }

  function getBengaluruSkyClass(hour24) {
    if (hour24 >= 5 && hour24 < 8) return 'sky-sunrise';
    if (hour24 >= 8 && hour24 < 17) return 'sky-day';
    if (hour24 >= 17 && hour24 < 19) return 'sky-sunset';
    return 'sky-night';
  }

  function updateLiveClock() {
    const bengaluruTime = getBengaluruTimeParts();
    const hour12 = bengaluruTime.hour || '00';
    const minute = bengaluruTime.minute || '00';
    const second = bengaluruTime.second || '00';
    const dayPeriod = bengaluruTime.dayPeriod || '';
    const hourNumber = Number(hour12);
    const hour24 = dayPeriod.toLowerCase() === 'pm'
      ? (hourNumber === 12 ? 12 : hourNumber + 12)
      : (hourNumber === 12 ? 0 : hourNumber);

    document.getElementById('live-clock').innerText = `${hour12}:${minute}:${second} ${dayPeriod}`.trim();
    document.body.classList.remove('sky-sunrise', 'sky-day', 'sky-sunset', 'sky-night');
    document.body.classList.add(getBengaluruSkyClass(hour24));
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  document.getElementById('year').innerText = new Date().getFullYear();

  function setupAutocomplete(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    const clearBtn = document.getElementById(inputId === 'from-input' ? 'from-clear' : 'to-clear');
    let placeSearchTimer = null;
    let placeSearchRequest = 0;

    function closeMobileKeyboard() {
      input.blur();
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    }

    function updateClearButton() {
      const shouldHideFromLive = inputId === 'from-input' && fromStationSource === 'live';
      clearBtn.style.display = input.value.trim() && !shouldHideFromLive ? 'flex' : 'none';
    }

    function renderResults(filterText = '') {
      results.innerHTML = '';
      const query = filterText.toLowerCase().trim();
      const matches = stationNames.filter(name => name.toLowerCase().includes(query));

      if (matches.length === 0 && query.length < 3) {
        results.style.display = 'none';
        return;
      }

      matches.forEach(st => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        const lineType = STATIONS[st].line.split(' ')[0];
        item.innerHTML = `
          <span>${st}</span>
          <span class="line-badge-sm ${lineType}">${lineType}</span>
        `;

        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = st;
          results.style.display = 'none';
          updateClearButton();
          
          if (inputId === 'from-input') {
            setFromStationSource('manual');
            renderUnselectedDualDirections(st);
          }
          requestLeafletAutoFit(true);
          updateRouteFromInputs(false);
          closeMobileKeyboard();
        });

        results.appendChild(item);
      });

      if (query.length >= 3 && hasApiUrl(TRANSIT_API_CONFIG.geocodingUrl)) {
        const loadingItem = document.createElement('div');
        loadingItem.className = 'autocomplete-item place-search-item';
        loadingItem.innerHTML = `
          <span>Searching map for "${filterText.trim()}"...</span>
          <span class="line-badge-sm Interchange">Map</span>
        `;
        results.appendChild(loadingItem);
        schedulePlaceSearch(filterText);
      } else if (query.length >= 3 && !STATIONS[normalizeStationName(filterText)]) {
        const searchItem = document.createElement('div');
        searchItem.className = 'autocomplete-item';
        searchItem.innerHTML = `
          <span>Search map for "${filterText.trim()}"</span>
          <span class="line-badge-sm Interchange">Nearest</span>
        `;
        searchItem.addEventListener('mousedown', async (e) => {
          e.preventDefault();
          results.style.display = 'none';
          updateClearButton();
          await resolvePlaceToNearestStation(inputId, input.value);
          closeMobileKeyboard();
        });
        results.appendChild(searchItem);
      }

      results.style.display = 'block';
    }

    function clearPlaceSearchItems() {
      results.querySelectorAll('.place-search-item').forEach(item => item.remove());
    }

    function schedulePlaceSearch(filterText) {
      window.clearTimeout(placeSearchTimer);
      const requestId = ++placeSearchRequest;
      placeSearchTimer = window.setTimeout(async () => {
        const query = filterText.trim();
        if (query.length < 3 || input.value.trim() !== query) return;

        const candidates = await fetchPlaceCandidates(query);
        if (requestId !== placeSearchRequest || input.value.trim() !== query) return;

        clearPlaceSearchItems();
        const nearestMatches = candidates
          .map(nearestStationForPlaceCandidate)
          .filter(Boolean)
          .slice(0, 4);

        if (!nearestMatches.length) {
          const emptyItem = document.createElement('div');
          emptyItem.className = 'autocomplete-item place-search-item';
          emptyItem.innerHTML = `
            <span>No map result found for "${query}"</span>
            <span class="line-badge-sm Interchange">Map</span>
          `;
          results.appendChild(emptyItem);
          results.style.display = 'block';
          return;
        }

        nearestMatches.forEach(nearest => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item place-search-item';
          item.innerHTML = `
            <span>${escapeHtml(nearest.place.name)}</span>
            <span class="line-badge-sm Interchange">${escapeHtml(nearest.name)}</span>
          `;
          item.title = `Auto select ${nearest.name} (${formatDistance(nearest.distanceKm)} away)`;
          item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            results.style.display = 'none';
            updateClearButton();
            applyNearestStationFromPlace(inputId, nearest.place.name, nearest);
            closeMobileKeyboard();
          });
          results.appendChild(item);
        });
        results.style.display = 'block';
      }, 350);
    }

    input.addEventListener('focus', () => {
      if (!input.disabled && !input.readOnly) renderResults(input.value);
    });
    clearBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.value = '';
      results.style.display = 'none';
      updateClearButton();

      input.focus();
      requestLeafletAutoFit(true);
      updateRouteFromInputs(false);
    });
    input.addEventListener('input', () => { 
      if (!input.disabled && !input.readOnly) {
        updateClearButton();
        renderResults(input.value);
        const normalizedInput = normalizeStationName(input.value);
        if (inputId === 'from-input') {
          if (input.value.trim()) setFromStationSource('manual');
          if (STATIONS[normalizedInput]) {
            renderUnselectedDualDirections(normalizedInput);
          }
        }
        if (STATIONS[normalizedInput]) requestLeafletAutoFit(true);
        updateRouteFromInputs(false);
      }
    });
    input.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' || input.disabled || input.readOnly) return;
      const normalizedInput = normalizeStationName(input.value);
      if (STATIONS[normalizedInput]) return;
      e.preventDefault();
      results.style.display = 'none';
      await resolvePlaceToNearestStation(inputId, input.value);
      closeMobileKeyboard();
    });
    input.addEventListener('change', () => {
      const normalizedInput = normalizeStationName(input.value);
      if (!STATIONS[normalizedInput]) resolvePlaceToNearestStation(inputId, input.value, { silent: true });
    });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 150); });
    updateClearButton();
  }

  setupAutocomplete('from-input', 'from-results');
  setupAutocomplete('to-input', 'to-results');
  setFromStationSource('live');
  updatePanelVisibility();
  renderMetroMap();

  document.getElementById('from-source-toggle').addEventListener('change', (e) => {
    setFromStationSource(e.target.checked ? 'live' : 'manual');

    if (fromStationSource === 'live') {
      startGPSLiveTracking();
    } else {
      if (!shouldTrackGPS()) stopGPSLiveTracking();
      document.getElementById('gps-status').innerText = "Manual mode. Search and select your boarding station.";
    }
  });

  function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function findNearestPoint(userLat, userLng, points) {
    let nearestName = null;
    let minDistance = Infinity;

    for (const [name, coords] of Object.entries(points)) {
      if (!coords.lat || !coords.lng) continue;
      const dist = getDistanceInKm(userLat, userLng, coords.lat, coords.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestName = name;
      }
    }

    return nearestName ? { name: nearestName, distanceKm: minDistance } : null;
  }

  function startGPSLiveTracking() {
    const statusDiv = document.getElementById('gps-status');
    const busStatusDiv = document.getElementById('bus-gps-status');

    if (!("geolocation" in navigator)) {
      setFromStationSource('manual');
      setBusFromSource('manual');
      statusDiv.innerText = "GPS is not supported here. Search and select your boarding station manually.";
      busStatusDiv.innerText = "GPS is not supported here. Search and select your BMTC boarding stop manually.";
      return;
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    isTracking = true;
    statusDiv.innerText = "Connecting to live GPS positioning...";
    busStatusDiv.innerText = "Connecting to live GPS positioning...";

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const nearestMetro = findNearestPoint(userLat, userLng, STATIONS);
        const nearestBus = findNearestPoint(userLat, userLng, BMTC_STOP_COORDS);

        if (nearestMetro) {
          const nearestChanged = nearestMetro.name !== currentNearestStation;
          currentNearestStation = nearestMetro.name;
          const distInMeters = (nearestMetro.distanceKm * 1000).toFixed(0);

          if (fromStationSource === 'live') {
            const fromInput = document.getElementById('from-input');
            const stationChangedInInput = fromInput.value !== nearestMetro.name;
            fromInput.value = nearestMetro.name;
            document.getElementById('from-clear').style.display = 'none';
            if (nearestChanged || stationChangedInInput) {
              const destination = normalizeStationName(document.getElementById('to-input')?.value || '');
              if (!STATIONS[destination]) renderUnselectedDualDirections(nearestMetro.name);
              updateRouteFromInputs(true);
            }
            statusDiv.innerHTML = `Live GPS set boarding station to <strong>${nearestMetro.name}</strong> (${distInMeters}m away)`;
          } else {
            statusDiv.innerHTML = `Live GPS nearby: <strong>${nearestMetro.name}</strong> (${distInMeters}m away). Using your typed boarding station.`;
          }
          if (nearestChanged) renderMetroMap();
        }

        if (nearestBus) {
          const busChanged = nearestBus.name !== currentNearestBusStop;
          currentNearestBusStop = nearestBus.name;
          const busDistInMeters = (nearestBus.distanceKm * 1000).toFixed(0);

          if (busFromSource === 'live') {
            const busFromInput = document.getElementById('bus-from-input');
            const stopChangedInInput = busFromInput.value !== nearestBus.name;
            busFromInput.value = nearestBus.name;
            document.getElementById('bus-from-clear').style.display = 'none';
            if (busChanged || stopChangedInInput) {
              const destination = normalizeBusStop(document.getElementById('bus-to-input')?.value || '');
              if (BMTC_STOPS.includes(destination)) renderBusRouteResults();
            }
            busStatusDiv.innerHTML = `Live GPS set boarding bus stop to <strong>${nearestBus.name}</strong> (${busDistInMeters}m away)`;
          } else {
            busStatusDiv.innerHTML = `Live GPS nearby: <strong>${nearestBus.name}</strong> (${busDistInMeters}m away). Using your typed bus stop.`;
          }
          if (busChanged && selectedBusRouteIndex > -1) renderSelectedBusRoute(selectedBusRouteIndex, false);
        }
      },
      (err) => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        isTracking = false;
        setFromStationSource('manual');
        setBusFromSource('manual');
        statusDiv.innerText = "GPS permission unavailable. Search and select your boarding station manually.";
        busStatusDiv.innerText = "GPS permission unavailable. Search and select your BMTC boarding stop manually.";
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
    );
  }

  function stopGPSLiveTracking() {
    if (watchId !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    isTracking = false;
  }

  function findShortestPath(start, goal) {
    let queue = [[start]];
    let visited = new Set([start]);

    while (queue.length > 0) {
      let path = queue.shift();
      let node = path[path.length - 1];

      if (node === goal) return path;

      for (let neighbor of (ADJACENCY[node] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }

  function getLineForSegment(current, next) {
    if (STATIONS[current].line !== "Interchange") return STATIONS[current].line;
    if (STATIONS[next].line !== "Interchange") return STATIONS[next].line;
    return STATIONS[next].line || "Purple Line";
  }

  function getPlatformDetails(current, next) {
    const line = getLineForSegment(current, next);

    if (current === "Nadaprabhu Kempegowda (Majestic)") {
      if (line === "Purple Line") {
        const eastBound = ["Sir M. Visvesvaraya Station, Central College", "Cubbon Park", "MG Road", "Indiranagar", "K. R. Pura", "Sri Sathya Sai Hospital", "Whitefield (Kadugodi)"];
        return eastBound.includes(next)
          ? { platform: "Platform 1 (Level 1)", direction: "Towards Whitefield (Kadugodi)", line }
          : { platform: "Platform 2 (Level 1)", direction: "Towards Challaghatta", line };
      } else {
        const southBound = ["Chickpet", "Krishna Rajendra Market", "National College", "Jayanagar", "Rashtreeya Vidyalaya Road", "Silk Institute"];
        return southBound.includes(next)
          ? { platform: "Platform 4 (Level 2)", direction: "Towards Silk Institute", line }
          : { platform: "Platform 3 (Level 2)", direction: "Towards Madavara", line };
      }
    }

    if (current === "Rashtreeya Vidyalaya Road") {
      if (line === "Yellow Line") {
        return { platform: "Platform 3 (Yellow Line Concourse)", direction: "Towards Delta electronics Bommasandra", line };
      } else {
        const southBound = ["Banashankari", "Yelachenahalli", "Silk Institute"];
        return southBound.includes(next)
          ? { platform: "Platform 2 (Green Line)", direction: "Towards Silk Institute", line }
          : { platform: "Platform 1 (Green Line)", direction: "Towards Madavara / Majestic", line };
      }
    }

    if (line === "Purple Line") {
      const eastBound = ["Sir M. Visvesvaraya Station, Central College", "MG Road", "Indiranagar", "K. R. Pura", "Sri Sathya Sai Hospital", "Whitefield (Kadugodi)"];
      return eastBound.includes(next) || (STATIONS[next]?.order > STATIONS[current]?.order)
        ? { platform: "Platform 1", direction: "Towards Whitefield (Kadugodi)", line }
        : { platform: "Platform 2", direction: "Towards Challaghatta", line };
    } else if (line === "Yellow Line") {
      return STATIONS[next]?.order > STATIONS[current]?.order
        ? { platform: "Platform 2", direction: "Towards Delta electronics Bommasandra", line }
        : { platform: "Platform 1", direction: "Towards Rashtreeya Vidyalaya Road", line };
    } else {
      const southBound = ["Chickpet", "National College", "Jayanagar", "Rashtreeya Vidyalaya Road", "Silk Institute"];
      return southBound.includes(next) || (STATIONS[next]?.order > STATIONS[current]?.order)
        ? { platform: "Platform 2", direction: "Towards Silk Institute", line }
        : { platform: "Platform 1", direction: "Towards Madavara", line };
    }
  }

  const BMRC_TIMETABLES = {
    "Purple Line": {
      updated: "2025-12-24",
      monday: {
        toWhitefield: [[255, 275, 20], [275, 315, 15], [315, 414, 11], [414, 765, 10], [765, 1005, 8], [1005, 1385, 10]],
        toChallaghatta: [[255, 275, 20], [275, 300, 13], [300, 657, 10], [657, 921, 8], [921, 1321, 10], [1321, 1365, 15]]
      },
      weekday: {
        toWhitefield: [[300, 320, 20], [320, 360, 15], [360, 414, 11], [414, 740, 10], [740, 962, 8], [962, 1385, 10]],
        toChallaghatta: [[300, 320, 20], [320, 657, 10], [657, 921, 8], [921, 1321, 10], [1321, 1365, 15]]
      },
      saturday: {
        toWhitefield: [[300, 320, 20], [320, 360, 15], [360, 414, 11], [414, 740, 10], [740, 1005, 8], [1005, 1385, 10]],
        toChallaghatta: [[300, 320, 20], [320, 657, 10], [657, 921, 8], [921, 1321, 10], [1321, 1365, 15]]
      },
      sunday: {
        toWhitefield: [[420, 470, 15], [470, 720, 10], [720, 1288, 8], [1288, 1385, 10]],
        toChallaghatta: [[420, 633, 10], [633, 1201, 8], [1201, 1351, 10], [1351, 1365, 14]]
      }
    },
    "Green Line": {
      updated: "2025-12-24",
      monday: {
        toSilkInstitute: [[255, 280, 25], [300, 375, 15], [375, 625, 10], [625, 639, 7], [639, 951, 8], [951, 1184, 10], [1184, 1224, 8], [1224, 1360, 10], [1360, 1377, 15]],
        toMadavara: [[255, 300, 20], [300, 420, 15], [420, 669, 10], [669, 1008, 8], [1008, 1229, 10], [1229, 1290, 8], [1290, 1360, 10], [1360, 1385, 12.5]]
      },
      weekday: {
        toSilkInstitute: [[300, 375, 15], [375, 625, 11], [625, 639, 7], [639, 951, 8], [951, 1184, 10], [1184, 1224, 8], [1224, 1324, 10], [1324, 1360, 10], [1360, 1377, 15]],
        toMadavara: [[300, 420, 15], [420, 669, 10], [669, 1008, 8], [1008, 1229, 10], [1229, 1290, 8], [1290, 1360, 10], [1360, 1385, 12.5]]
      },
      saturday: {
        toSilkInstitute: [[300, 375, 15], [375, 639, 11], [639, 961, 8], [961, 983, 5.5], [983, 1192, 11], [1192, 1224, 8], [1224, 1324, 10], [1324, 1380, 15]],
        toMadavara: [[300, 420, 15], [420, 713, 11], [713, 1008, 8], [1008, 1257, 11], [1257, 1290, 8], [1290, 1360, 10], [1360, 1385, 12.5]]
      },
      sunday: {
        toSilkInstitute: [[420, 647, 10], [647, 1215, 8], [1215, 1325, 10], [1325, 1349, 12], [1349, 1380, 15]],
        toMadavara: [[420, 478, 15], [478, 728, 10], [728, 1304, 8], [1304, 1364, 10], [1364, 1385, 12]]
      }
    },
    "Yellow Line": {
      updated: "2026-06-03",
      monday: {
        toBommasandra: [[305, 335, 30], [335, 360, 25], [360, 400, 20], [400, 416, 16], [416, 427, 11], [427, 507, 10], [507, 563, 8], [563, 633, 7], [633, 665, 8], [665, 1005, 10], [1005, 1138, 7], [1138, 1234, 8], [1234, 1294, 10], [1294, 1305, 11], [1305, 1340, 12], [1340, 1360, 20], [1360, 1435, 25]],
        toRvRoad: [[305, 335, 30], [335, 360, 20], [360, 380, 20], [380, 470, 10], [470, 526, 8], [526, 589, 7], [589, 629, 8], [629, 969, 10], [969, 1109, 7], [1109, 1197, 8], [1197, 1257, 10], [1257, 1353, 12], [1353, 1362, 9]]
      },
      weekday: {
        toBommasandra: [[360, 400, 20], [400, 416, 16], [416, 427, 11], [427, 507, 10], [507, 563, 8], [563, 633, 7], [633, 665, 8], [665, 1005, 10], [1005, 1138, 7], [1138, 1234, 8], [1234, 1294, 10], [1294, 1305, 11], [1305, 1340, 12], [1340, 1360, 20], [1360, 1435, 25]],
        toRvRoad: [[360, 380, 20], [380, 470, 10], [470, 526, 8], [526, 589, 7], [589, 629, 8], [629, 969, 10], [969, 1109, 7], [1109, 1197, 8], [1197, 1257, 10], [1257, 1353, 12], [1353, 1362, 9]]
      },
      saturday: {
        toBommasandra: [[360, 385, 20], [385, 425, 20], [425, 440, 15], [440, 451, 11], [451, 1231, 10], [1231, 1327, 12], [1327, 1345, 18], [1345, 1385, 20], [1385, 1435, 25]],
        toRvRoad: [[360, 400, 20], [400, 415, 15], [415, 1195, 10], [1195, 1351, 12], [1351, 1362, 11]]
      },
      sunday: {
        toBommasandra: [[420, 528, 18], [528, 598, 14], [598, 646, 12], [646, 1256, 10], [1256, 1340, 12], [1340, 1370, 15], [1370, 1410, 20], [1410, 1435, 25]],
        toRvRoad: [[420, 492, 18], [492, 548, 14], [548, 620, 12], [620, 1220, 10], [1220, 1352, 12], [1352, 1362, 10]]
      }
    }
  };

  function getScheduleKey(date = new Date()) {
    const day = date.getDay();
    if (day === 0) return "sunday";
    if (day === 1) return "monday";
    if (day === 6) return "saturday";
    return "weekday";
  }

  function minutesToTime(totalMinutes) {
    const minutes = Math.round(totalMinutes);
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function getDirectionKey(line, directionText) {
    if (line === "Purple Line") return directionText.includes("Whitefield") ? "toWhitefield" : "toChallaghatta";
    if (line === "Green Line") return directionText.includes("Silk Institute") ? "toSilkInstitute" : "toMadavara";
    if (line === "Yellow Line") return directionText.includes("Bommasandra") ? "toBommasandra" : "toRvRoad";
    return null;
  }

  function getNextTrainArrival(routeInfo, offsetMinutes = 0) {
    const directionText = typeof routeInfo === "string" ? routeInfo : routeInfo.direction;
    const line = typeof routeInfo === "string" ? null : routeInfo.line;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMins = hours * 60 + minutes;
    const timetable = BMRC_TIMETABLES[line];
    const directionKey = timetable ? getDirectionKey(line, directionText) : null;
    const bands = directionKey ? timetable[getScheduleKey(now)]?.[directionKey] : null;

    if (!bands) {
      return { mins: "See BMRCL", detail: `Check BMRCL official timetable (${directionText})`, dateObj: null, isAvailable: false };
    }

    let activeBand = bands.find(([start, end]) => totalMins >= start && totalMins <= end);
    let nextMins;

    if (activeBand) {
      const [start, end, headway] = activeBand;
      const elapsed = Math.max(0, totalMins - start + offsetMinutes);
      nextMins = headway - (elapsed % headway);
      if (nextMins <= 0) nextMins += headway;
      const serviceEnd = minutesToTime(end);
      const depTime = new Date(now.getTime() + nextMins * 60000);
      const depTimeString = depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        mins: `${Math.ceil(nextMins)} min${Math.ceil(nextMins) > 1 ? 's' : ''}`,
        detail: `Expected at ${depTimeString} (${directionText}) • BMRCL ${headway} min frequency until ${serviceEnd}`,
        dateObj: depTime,
        isAvailable: true
      };
    }

    const upcomingBand = bands.find(([start]) => totalMins < start);
    if (!upcomingBand) {
      const firstStart = minutesToTime(bands[0][0]);
      const lastEnd = minutesToTime(bands[bands.length - 1][1]);
      return { mins: "No Service", detail: `${line} ${directionText}: BMRCL timetable window is ${firstStart} - ${lastEnd}`, dateObj: null, isAvailable: false };
    }

    nextMins = upcomingBand[0] - totalMins;

    const depTime = new Date(now.getTime() + nextMins * 60000);
    const depTimeString = depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      mins: `${Math.ceil(nextMins)} min${Math.ceil(nextMins) > 1 ? 's' : ''}`,
      detail: `First scheduled service at ${depTimeString} (${directionText}) • BMRCL timetable`,
      dateObj: depTime,
      isAvailable: true
    };
  }

  // Renders Both Directions when Destination is NOT selected yet
  function renderUnselectedDualDirections(boardingStation) {
    const container = document.getElementById('unselected-dual-container');
    container.innerHTML = '';
    currentPanel = 'unselected';
    currentRoutePath = [];
    updatePanelVisibility();
    renderMetroMap();

    if (!STATIONS[boardingStation]) return;

    const line = STATIONS[boardingStation]?.line === "Interchange" ? "Purple Line" : STATIONS[boardingStation]?.line;
    let directions = [];

    if (line === "Purple Line") {
      directions = [
        { label: "Platform 1", dir: "Towards Whitefield (Kadugodi)", line, offset: 0 },
        { label: "Platform 2", dir: "Towards Challaghatta", line, offset: 3 }
      ];
    } else if (line === "Green Line") {
      directions = [
        { label: "Platform 2", dir: "Towards Silk Institute", line, offset: 0 },
        { label: "Platform 1", dir: "Towards Madavara", line, offset: 4 }
      ];
    } else {
      directions = [
        { label: "Platform 2", dir: "Towards Delta electronics Bommasandra", line, offset: 0 },
        { label: "Platform 1", dir: "Towards Rashtreeya Vidyalaya Road", line, offset: 3 }
      ];
    }

    directions.forEach(d => {
      const schedule = getNextTrainArrival({ direction: d.dir, line: d.line }, d.offset);
      const box = document.createElement('div');
      box.className = 'next-train-box';
      box.innerHTML = `
        <div>
          <div class="time-title">${d.label} • ${d.dir}</div>
          <div class="time-sub">${schedule.detail}</div>
        </div>
        <div class="time-val ${!schedule.isAvailable ? 'no-service' : ''}">${schedule.mins}</div>
      `;
      container.appendChild(box);
    });
  }

  // Renders ONLY the Selected Single Route Next Train
  function renderSingleSelectedRouteTrain(platInfo) {
    const container = document.getElementById('single-route-train-container');
    container.innerHTML = '';

    const schedule = getNextTrainArrival(platInfo, 0);
    const box = document.createElement('div');
    box.className = 'next-train-box active-route-dir';
    box.innerHTML = `
      <div>
        <div class="time-title">${platInfo.platform} • ${platInfo.direction} <span class="live-tag">YOUR ROUTE</span></div>
        <div class="time-sub">${schedule.detail}</div>
      </div>
      <div class="time-val ${!schedule.isAvailable ? 'no-service' : ''}">${schedule.mins}</div>
    `;
    container.appendChild(box);
    return schedule;
  }

  function showBoardingDirections() {
    currentPanel = 'unselected';
    currentRoutePath = [];
    updatePanelVisibility();

    const currentFrom = normalizeStationName(document.getElementById('from-input').value);
    if (currentFrom) renderUnselectedDualDirections(currentFrom);
    renderMetroMap();
  }

  function updateRouteFromInputs(isDynamicUpdate = false) {
    const start = normalizeStationName(document.getElementById('from-input').value);
    const end = normalizeStationName(document.getElementById('to-input').value);

    if (STATIONS[start] && STATIONS[end] && start !== end) {
      calculateRoute(isDynamicUpdate);
      return;
    }

    if (STATIONS[start]) {
      showBoardingDirections();
      return;
    }

    currentPanel = 'unselected';
    currentRoutePath = [];
    updatePanelVisibility();
    renderMetroMap();
  }

  function calculateRoute(isGpsUpdate = false) {
    const start = normalizeStationName(document.getElementById('from-input').value);
    const end = normalizeStationName(document.getElementById('to-input').value);

    if (!STATIONS[start]) {
      if (!isGpsUpdate) alert("Please select a valid boarding station from the search dropdown!");
      return;
    }

    if (!end || !STATIONS[end]) {
      if (!isGpsUpdate) alert("Please select a valid destination station to calculate your journey!");
      return;
    }

    if (start === end) {
      if (!isGpsUpdate) alert("Source and Destination cannot be the same!");
      return;
    }

    const path = findShortestPath(start, end);
    if (!path) return;
    currentRoutePath = path;
    if (!isGpsUpdate) requestLeafletAutoFit(true);

    // Switch view from Unselected (Dual) to Selected (Single Path)
    currentPanel = 'result';
    updatePanelVisibility();
    renderMetroMap();

    const totalStops = path.length - 1;
    const isInterchange = path.includes("Nadaprabhu Kempegowda (Majestic)") || path.includes("Rashtreeya Vidyalaya Road");
    const estTimeMinutes = totalStops * 2.5 + (isInterchange ? 5 : 0);
    const calculatedFare = Math.min(90, Math.max(10, Math.ceil(totalStops * 5.2)));

    document.getElementById('metric-fare').innerText = `₹${calculatedFare}`;
    document.getElementById('metric-time').innerText = `~${Math.round(estTimeMinutes)} mins`;
    document.getElementById('metric-stops').innerText = totalStops;

    const firstPlatInfo = getPlatformDetails(path[0], path[1]);
    const trainArrival = renderSingleSelectedRouteTrain(firstPlatInfo);

    const noServiceBanner = document.getElementById('no-service-banner');
    if (!trainArrival.isAvailable) {
      noServiceBanner.style.display = 'block';
    } else {
      noServiceBanner.style.display = 'none';
    }

    let runningTime = trainArrival.dateObj ? new Date(trainArrival.dateObj.getTime()) : new Date();

    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    let currentLine = null;

    for (let i = 0; i < path.length; i++) {
      const station = path[i];
      const isStart = i === 0;
      const isEnd = i === path.length - 1;
      const nextStation = path[i + 1];
      const isLivePos = (currentNearestStation === station);

      if (i > 0) {
        const prevStation = path[i - 1];
        const isPrevInterchange = STATIONS[prevStation]?.line === "Interchange";
        const extraMins = isPrevInterchange ? 5 : 2.5;
        runningTime = new Date(runningTime.getTime() + extraMins * 60000);
      }

      // Display estimated timestamp ONLY if service is currently available
      const timeTagHTML = trainArrival.isAvailable 
        ? `<span class="arrival-time-tag">${isStart ? 'Dep:' : 'Arr:'} ${runningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`
        : `<span class="arrival-time-tag no-service-tag">No Service</span>`;

      let stepDiv = document.createElement('div');
      stepDiv.className = 'step' + (isLivePos ? ' live-location-active' : '');

      if (isStart) {
        const platInfo = getPlatformDetails(station, nextStation);
        currentLine = platInfo.line;
        const colorClass = currentLine === "Purple Line" ? "purple" : (currentLine === "Yellow Line" ? "yellow" : "green");

        stepDiv.innerHTML = `
          <div class="badge ${colorClass}">1</div>
          <div class="step-content">
            <div class="step-header-row">
              <div class="step-title">
                Boarding at ${station}
                ${isLivePos ? '<span class="live-tag">YOU ARE HERE</span>' : ''}
              </div>
              ${timeTagHTML}
            </div>
            <div class="step-desc">Board the <strong>${currentLine}</strong> train.</div>
            <div class="platform-tag">${platInfo.platform} • ${platInfo.direction}</div>
          </div>
        `;
      } else if (isEnd) {
        const colorClass = currentLine === "Purple Line" ? "purple" : (currentLine === "Yellow Line" ? "yellow" : "green");
        stepDiv.innerHTML = `
          <div class="badge ${colorClass}">✓</div>
          <div class="step-content">
            <div class="step-header-row">
              <div class="step-title">
                Arrive at ${station}
                ${isLivePos ? '<span class="live-tag">YOU ARE HERE</span>' : ''}
              </div>
              ${timeTagHTML}
            </div>
            <div class="step-desc">Exit through fare gates. Journey complete.</div>
          </div>
        `;
      } else if (STATIONS[station].line === "Interchange") {
        const nextPlat = getPlatformDetails(station, nextStation);
        const lineChanged = currentLine !== nextPlat.line;
        currentLine = nextPlat.line;

        stepDiv.innerHTML = `
          <div class="badge interchange">⇄</div>
          <div class="step-content">
            <div class="step-header-row">
              <div class="step-title">
                Interchange at ${station}
                ${isLivePos ? '<span class="live-tag">YOU ARE HERE</span>' : ''}
              </div>
              ${timeTagHTML}
            </div>
            ${lineChanged ? `<div class="alert"><strong>Line Switch:</strong> Transfer to <strong>${nextPlat.line}</strong> using concourse walkway/stairs.</div>` : ''}
            <div class="platform-tag">${nextPlat.platform} • ${nextPlat.direction}</div>
          </div>
        `;
      } else {
        const colorClass = currentLine === "Purple Line" ? "purple" : (currentLine === "Yellow Line" ? "yellow" : "green");
        stepDiv.innerHTML = `
          <div class="badge ${colorClass}">•</div>
          <div class="step-content">
            <div class="step-header-row">
              <div class="step-title">
                ${station}
                ${isLivePos ? '<span class="live-tag">YOU ARE HERE</span>' : ''}
              </div>
              ${timeTagHTML}
            </div>
            <div class="step-desc">En-route station</div>
          </div>
        `;
      }

      timeline.appendChild(stepDiv);
    }
  }

  function setTransportMode(mode) {
    const isBus = mode === 'bus';
    activeTransportMode = mode;
    document.getElementById('metro-mode-btn').classList.toggle('active', !isBus);
    document.getElementById('bus-mode-btn').classList.toggle('active', isBus);
    document.querySelector('.search-card').style.display = isBus ? 'none' : 'block';
    document.getElementById('map-card').style.display = isBus ? 'none' : 'block';
    document.getElementById('unselected-card').style.display = isBus ? 'none' : (currentPanel === 'unselected' ? 'block' : 'none');
    document.getElementById('result-card').style.display = isBus ? 'none' : (currentPanel === 'result' ? 'block' : 'none');
    document.getElementById('bus-panel').classList.toggle('active', isBus);
  }

  function normalizeBusStop(value) {
    const raw = (value || '').trim();
    if (!raw) return '';
    const aliasMatch = Object.entries(BMTC_STOP_ALIASES).find(([alias]) => alias.toLowerCase() === raw.toLowerCase());
    if (aliasMatch) return aliasMatch[1];
    return BMTC_STOPS.find(stop => stop.toLowerCase() === raw.toLowerCase()) || raw;
  }

  function estimateBusFare(stopCount) {
    return Math.min(75, Math.max(10, Math.ceil(10 + stopCount * 4.5)));
  }

  function routeSegment(route, from, to) {
    const fromIndex = route.stops.indexOf(from);
    const toIndex = route.stops.indexOf(to);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return null;
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const stops = route.stops.slice(start, end + 1);
    if (fromIndex > toIndex) stops.reverse();
    return {
      route,
      from,
      to,
      stops,
      stopCount: Math.abs(toIndex - fromIndex)
    };
  }

  function findBusSuggestions(from, to) {
    const direct = BMTC_ROUTES
      .map(route => routeSegment(route, from, to))
      .filter(Boolean)
      .map(segment => ({ type: 'direct', segments: [segment] }));

    const transfers = [];
    BMTC_ROUTES.forEach(firstRoute => {
      if (!firstRoute.stops.includes(from)) return;
      BMTC_ROUTES.forEach(secondRoute => {
        if (firstRoute.number === secondRoute.number || !secondRoute.stops.includes(to)) return;
        const transferStops = firstRoute.stops.filter(stop => secondRoute.stops.includes(stop) && stop !== from && stop !== to);
        transferStops.forEach(transfer => {
          const first = routeSegment(firstRoute, from, transfer);
          const second = routeSegment(secondRoute, transfer, to);
          if (first && second) transfers.push({ type: 'transfer', transfer, segments: [first, second] });
        });
      });
    });

    const options = [...direct, ...transfers]
      .map(option => {
        const stopCount = option.segments.reduce((sum, segment) => sum + segment.stopCount, 0);
        return {
          ...option,
          stopCount,
          fare: estimateBusFare(stopCount),
          minutes: Math.round(stopCount * 4.5 + (option.type === 'transfer' ? 10 : 0)),
          routeNumbers: option.segments.map(segment => segment.route.number).join(' + ')
        };
      });
    const bestDirectStops = Math.min(...options.filter(option => option.type === 'direct').map(option => option.stopCount));

    return options
      .filter(option => option.type === 'direct' || !Number.isFinite(bestDirectStops) || option.stopCount < bestDirectStops)
      .sort((a, b) => a.segments.length - b.segments.length || a.stopCount - b.stopCount)
      .slice(0, 4);
  }

  function getBusOptionStops(option) {
    return option.segments.reduce((stops, segment, index) => {
      const segmentStops = index === 0 ? segment.stops : segment.stops.slice(1);
      return stops.concat(segmentStops);
    }, []);
  }

  function hideBusLivePanel() {
    selectedBusRouteIndex = -1;
    document.getElementById('bus-live-panel').classList.remove('active');
  }

  function initBusLeafletMap() {
    if (typeof L === 'undefined') return false;
    if (busLeafletMap) return true;

    busLeafletMap = L.map('bus-live-map', {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(busLeafletMap);

    busLeafletLayerGroup = L.layerGroup().addTo(busLeafletMap);
    return true;
  }

  function renderBusMap(option, stops) {
    if (!initBusLeafletMap()) return;
    busLeafletLayerGroup.clearLayers();

    const points = stops
      .map(stop => ({ stop, coords: BMTC_STOP_COORDS[stop] }))
      .filter(item => item.coords);

    if (!points.length) return;

    const latLngs = points.map(item => [item.coords.lat, item.coords.lng]);
    L.polyline(latLngs, {
      color: '#f59e0b',
      weight: 5,
      opacity: 0.88,
      lineJoin: 'round'
    }).addTo(busLeafletLayerGroup);

    points.forEach((item, index) => {
      const isLive = item.stop === currentNearestBusStop;
      const isStart = index === 0;
      const isEnd = index === points.length - 1;
      const icon = L.divIcon({
        className: '',
        html: `<div class="bus-stop-marker ${isLive ? 'live' : ''}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      const label = isStart ? `Board: ${item.stop}` : (isEnd ? `Arrive: ${item.stop}` : item.stop);
      L.marker([item.coords.lat, item.coords.lng], { icon, title: label })
        .bindTooltip(`${escapeHtml(label)}${isLive ? ' • Live nearest' : ''}`, {
          permanent: isStart || isEnd || isLive,
          direction: 'top',
          className: isLive ? 'live-location-label' : 'route-station-label',
          opacity: 0.95
        })
        .addTo(busLeafletLayerGroup);
    });

    const routeNumbers = new Set((option?.segments || []).map(segment => segment.route.number));
    busVehiclePositions
      .filter(vehicle => !vehicle.routeNumber || routeNumbers.has(vehicle.routeNumber))
      .forEach(vehicle => {
        const icon = L.divIcon({
          className: '',
          html: '<div class="bus-stop-marker live"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([vehicle.lat, vehicle.lng], { icon, title: vehicle.vehicleId, zIndexOffset: 900 })
          .bindTooltip(`${escapeHtml(vehicle.routeNumber || 'BMTC')} ${escapeHtml(vehicle.vehicleId)}`, {
            permanent: false,
            direction: 'top',
            className: 'live-location-label',
            opacity: 0.95
          })
          .addTo(busLeafletLayerGroup);
      });

    setTimeout(() => {
      busLeafletMap.invalidateSize({ pan: false });
      busLeafletMap.fitBounds(latLngs, {
        padding: [24, 24],
        maxZoom: 14,
        animate: false
      });
    }, 0);
  }

  function renderSelectedBusRoute(index, shouldScroll = true) {
    const option = busRouteOptions[index];
    if (!option) return;

    selectedBusRouteIndex = index;
    const stops = getBusOptionStops(option);
    const from = stops[0];
    const to = stops[stops.length - 1];
    const title = option.type === 'direct'
      ? `${from} to ${to}`
      : `${from} to ${to} via ${option.transfer}`;
    const frequency = option.segments.map(segment => `${segment.route.number}: ${segment.route.frequency}`).join(' • ');
    const panel = document.getElementById('bus-live-panel');
    const timeline = document.getElementById('bus-live-timeline');

    document.querySelectorAll('.bus-route-card[data-bus-option]').forEach(card => {
      const selected = Number(card.dataset.busOption) === index;
      card.classList.toggle('selected', selected);
      const btn = card.querySelector('.bus-select-btn');
      if (btn) btn.textContent = selected ? 'Showing live stops' : 'Show live stops and map';
    });

    document.getElementById('bus-live-title').textContent = title;
    document.getElementById('bus-live-sub').textContent = `${option.type === 'direct' ? 'Direct BMTC corridor' : 'One-transfer BMTC corridor'} • ${frequency}`;
    document.getElementById('bus-live-route-number').textContent = option.routeNumbers;
    document.getElementById('bus-live-fare').textContent = `~₹${option.fare}`;
    document.getElementById('bus-live-time').textContent = `~${option.minutes} min`;
    document.getElementById('bus-live-stops').textContent = `${option.stopCount} stops`;

    const transferStops = new Set(option.segments.slice(1).map(segment => segment.from));
    timeline.innerHTML = stops.map((stop, stopIndex) => {
      const isStart = stopIndex === 0;
      const isEnd = stopIndex === stops.length - 1;
      const isLive = stop === currentNearestBusStop;
      const transferTag = transferStops.has(stop)
        ? '<div class="bus-transfer-tag">Change bus here</div>'
        : '';
      const badgeText = isStart ? '1' : (isEnd ? '✓' : '•');
      const desc = isStart
        ? `Board BMTC route ${escapeHtml(option.segments[0].route.number)}.`
        : (isEnd ? 'Get down here. Journey complete.' : 'Upcoming bus stop on this route.');
      return `
        <div class="step ${isLive ? 'live-location-active' : ''}">
          <div class="badge interchange">${badgeText}</div>
          <div class="step-content">
            <div class="step-header-row">
              <div class="step-title">
                ${isStart ? 'Board at ' : (isEnd ? 'Arrive at ' : '')}${escapeHtml(stop)}
                ${isLive ? '<span class="live-tag">NEAREST STOP</span>' : ''}
              </div>
              <span class="arrival-time-tag">${stopIndex === 0 ? 'Now' : `+${Math.round(stopIndex * 4.5)} min`}</span>
            </div>
            <div class="step-desc">${desc}</div>
            ${transferTag}
          </div>
        </div>
      `;
    }).join('');

    panel.classList.add('active');
    renderBusMap(option, stops);
    refreshBusVehiclePositions(option).then(() => {
      if (selectedBusRouteIndex === index) renderBusMap(option, stops);
    });
    if (shouldScroll) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderBusRouteResults() {
    const from = normalizeBusStop(document.getElementById('bus-from-input').value);
    const to = normalizeBusStop(document.getElementById('bus-to-input').value);
    const container = document.getElementById('bus-route-results');

    if (!BMTC_STOPS.includes(from) || !BMTC_STOPS.includes(to)) {
      busRouteOptions = [];
      hideBusLivePanel();
      container.innerHTML = `
        <div class="bus-route-card">
          <div class="bus-route-title">Choose valid BMTC stops</div>
          <div class="bus-route-sub">Select from the dropdown suggestions for both boarding and destination areas.</div>
        </div>
      `;
      return;
    }

    if (from === to) {
      busRouteOptions = [];
      hideBusLivePanel();
      container.innerHTML = `
        <div class="bus-route-card">
          <div class="bus-route-title">Same boarding and destination</div>
          <div class="bus-route-sub">Pick a different destination to see BMTC route options.</div>
        </div>
      `;
      return;
    }

    const suggestions = findBusSuggestions(from, to);
    busRouteOptions = suggestions;
    hideBusLivePanel();
    if (!suggestions.length) {
      container.innerHTML = `
        <div class="bus-route-card">
          <div class="bus-route-title">No route in the starter BMTC dataset</div>
          <div class="bus-route-sub">Try nearby transfer hubs such as Majestic, Shivajinagar, KR Market, Silk Board, Hebbal, Marathahalli, or Banashankari.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = suggestions.map((option, index) => {
      const title = option.type === 'direct'
        ? `${from} to ${to}`
        : `${from} to ${to} via ${option.transfer}`;
      const chain = option.segments.map(segment =>
        `<strong>${segment.route.number}</strong>: ${segment.stops.map(escapeHtml).join(' → ')}`
      ).join('<br>');
      const frequency = option.segments.map(segment => `${segment.route.number}: ${segment.route.frequency}`).join(' • ');
      return `
        <div class="bus-route-card" data-bus-option="${index}">
          <div class="bus-route-head">
            <div>
              <div class="bus-route-title">${index === 0 ? 'Best option: ' : ''}${escapeHtml(title)}</div>
              <div class="bus-route-sub">${option.type === 'direct' ? 'Direct BMTC corridor' : 'One-transfer BMTC corridor'} • ${escapeHtml(frequency)}</div>
            </div>
            <span class="bus-number-pill">${escapeHtml(option.routeNumbers)}</span>
          </div>
          <div class="bus-route-meta">
            <span>~₹${option.fare}</span>
            <span>~${option.minutes} min</span>
            <span>${option.stopCount} stops</span>
          </div>
          <div class="bus-stop-chain">${chain}</div>
          <button type="button" class="bus-select-btn" data-bus-option="${index}">Show live stops and map</button>
        </div>
      `;
    }).join('');

    renderSelectedBusRoute(0);
  }

  function setupBusAutocomplete(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    const clearBtn = document.getElementById(inputId === 'bus-from-input' ? 'bus-from-clear' : 'bus-to-clear');

    function render(filterText = '') {
      const text = filterText.toLowerCase();
      const matches = BMTC_STOPS
        .filter(stop => stop.toLowerCase().includes(text))
        .slice(0, 9);
      results.innerHTML = '';
      if (!matches.length || !text) {
        results.style.display = 'none';
        return;
      }
      matches.forEach(stop => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `<span>${escapeHtml(stop)}</span><span class="line-badge-sm Interchange">BMTC</span>`;
        item.onclick = () => {
          input.value = stop;
          results.style.display = 'none';
          clearBtn.style.display = 'flex';
        };
        results.appendChild(item);
      });
      results.style.display = 'block';
    }

    input.addEventListener('input', () => {
      if (input.readOnly) return;
      clearBtn.style.display = input.value ? 'flex' : 'none';
      render(input.value);
    });

    input.addEventListener('focus', () => {
      if (!input.readOnly) render(input.value);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => { results.style.display = 'none'; }, 160);
    });

    clearBtn.addEventListener('click', () => {
      if (input.readOnly) return;
      input.value = '';
      clearBtn.style.display = 'none';
      results.style.display = 'none';
      input.focus();
    });
  }

  async function applyInitialMetroSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || params.get('place') || '').trim();
    if (!query) return;

    const toInput = document.getElementById('to-input');
    toInput.value = query;
    document.getElementById('to-clear').style.display = 'flex';
    const station = normalizeStationName(query);
    if (STATIONS[station]) {
      toInput.value = station;
      requestLeafletAutoFit(true);
      updateRouteFromInputs(false);
      return;
    }
    await resolvePlaceToNearestStation('to-input', query, { silent: true });
  }

  window.onload = function() {
    const transitDataPromise = loadTransitApiData().catch(() => updateTransitApiStatus());
    if (TRANSIT_API_CONFIG.refreshMs > 0) {
      window.setInterval(() => {
        loadTransitApiData().catch(() => updateTransitApiStatus());
      }, TRANSIT_API_CONFIG.refreshMs);
    }
    setupBusAutocomplete('bus-from-input', 'bus-from-results');
    setupBusAutocomplete('bus-to-input', 'bus-to-results');
    setBusFromSource('live');
    startGPSLiveTracking();
    transitDataPromise.then(applyInitialMetroSearchQuery);
    document.getElementById('metro-mode-btn').addEventListener('click', () => setTransportMode('metro'));
    document.getElementById('bus-mode-btn').addEventListener('click', () => setTransportMode('bus'));
    document.getElementById('bus-route-results').addEventListener('click', (event) => {
      const button = event.target.closest('.bus-select-btn');
      if (!button) return;
      renderSelectedBusRoute(Number(button.dataset.busOption));
    });
    document.getElementById('bus-from-source-toggle').addEventListener('change', (e) => {
      setBusFromSource(e.target.checked ? 'live' : 'manual');

      if (busFromSource === 'live') {
        startGPSLiveTracking();
      } else {
        if (!shouldTrackGPS()) stopGPSLiveTracking();
        document.getElementById('bus-gps-status').innerText = "Manual mode. Search and select your BMTC boarding stop.";
      }
    });
    document.getElementById('bus-search-btn').addEventListener('click', renderBusRouteResults);
    document.getElementById('bus-swap-btn').addEventListener('click', () => {
      const fromInput = document.getElementById('bus-from-input');
      const toInput = document.getElementById('bus-to-input');
      const nextFrom = toInput.value;
      toInput.value = fromInput.value;
      fromInput.value = nextFrom;
      document.getElementById('bus-from-clear').style.display = fromInput.value ? 'flex' : 'none';
      document.getElementById('bus-to-clear').style.display = toInput.value ? 'flex' : 'none';
      renderBusRouteResults();
    });
  };
