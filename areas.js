/* ------------------------------------------------------------------
   AREAS OF DUBAI
   Each area has a name and the approximate map position of its centre
   (lat = latitude, lng = longitude). The site uses these to work out
   roughly how far a listing is from where the visitor lives.
   Nothing is sent anywhere: the sum is done in the visitor's browser.

   To add an area: copy a line, change the name and the two numbers.
   You can find the numbers by right-clicking a place in Google Maps.
   ------------------------------------------------------------------ */
window.AREAS = [
  { name: "Academic City",            lat: 25.1180, lng: 55.4100 },
  { name: "Al Barsha",                lat: 25.1107, lng: 55.1960 },
  { name: "Al Furjan",                lat: 25.0260, lng: 55.1500 },
  { name: "Al Garhoud",               lat: 25.2420, lng: 55.3460 },
  { name: "Al Jaddaf",                lat: 25.2210, lng: 55.3320 },
  { name: "Al Khawaneej",             lat: 25.2400, lng: 55.4700 },
  { name: "Al Nahda",                 lat: 25.2900, lng: 55.3660 },
  { name: "Al Quoz",                  lat: 25.1390, lng: 55.2270 },
  { name: "Al Qusais",                lat: 25.2750, lng: 55.3820 },
  { name: "Al Satwa",                 lat: 25.2200, lng: 55.2740 },
  { name: "Al Shindagha",             lat: 25.2670, lng: 55.2900 },
  { name: "Al Warqa",                 lat: 25.1950, lng: 55.4100 },
  { name: "Arabian Ranches",          lat: 25.0550, lng: 55.2670 },
  { name: "Barsha Heights / The Greens", lat: 25.0960, lng: 55.1740 },
  { name: "Bur Dubai",                lat: 25.2520, lng: 55.2930 },
  { name: "Business Bay",             lat: 25.1860, lng: 55.2650 },
  { name: "Damac Hills",              lat: 25.0260, lng: 55.2500 },
  { name: "Deira",                    lat: 25.2710, lng: 55.3170 },
  { name: "DIFC",                     lat: 25.2110, lng: 55.2800 },
  { name: "Discovery Gardens",        lat: 25.0390, lng: 55.1440 },
  { name: "Downtown",                 lat: 25.1972, lng: 55.2744 },
  { name: "Dubai Creek Harbour",      lat: 25.2000, lng: 55.3450 },
  { name: "Dubai Design District",    lat: 25.1880, lng: 55.2960 },
  { name: "Dubai Hills",              lat: 25.1030, lng: 55.2450 },
  { name: "Dubai Investments Park (DIP)", lat: 25.0000, lng: 55.1700 },
  { name: "Dubai Marina",             lat: 25.0805, lng: 55.1403 },
  { name: "Dubai Production City",    lat: 25.0340, lng: 55.1900 },
  { name: "Dubai South",              lat: 24.9000, lng: 55.1500 },
  { name: "Emirates Hills / Springs / Meadows", lat: 25.0640, lng: 55.1700 },
  { name: "Expo City",                lat: 24.9640, lng: 55.1500 },
  { name: "Festival City",            lat: 25.2220, lng: 55.3530 },
  { name: "Healthcare City",          lat: 25.2310, lng: 55.3220 },
  { name: "International City",       lat: 25.1640, lng: 55.4080 },
  { name: "JBR",                      lat: 25.0780, lng: 55.1330 },
  { name: "Jebel Ali",                lat: 25.0100, lng: 55.1100 },
  { name: "JLT",                      lat: 25.0693, lng: 55.1417 },
  { name: "Jumeirah",                 lat: 25.2048, lng: 55.2420 },
  { name: "JVC",                      lat: 25.0590, lng: 55.2090 },
  { name: "Karama",                   lat: 25.2440, lng: 55.3040 },
  { name: "Mirdif",                   lat: 25.2200, lng: 55.4200 },
  { name: "Motor City",               lat: 25.0460, lng: 55.2390 },
  { name: "Muhaisnah",                lat: 25.2600, lng: 55.4100 },
  { name: "Nad Al Sheba",             lat: 25.1560, lng: 55.3300 },
  { name: "Oud Metha",                lat: 25.2360, lng: 55.3120 },
  { name: "Palm Jumeirah",            lat: 25.1124, lng: 55.1390 },
  { name: "Rashidiya",                lat: 25.2300, lng: 55.3900 },
  { name: "Silicon Oasis",            lat: 25.1210, lng: 55.3800 },
  { name: "Sports City",              lat: 25.0390, lng: 55.2190 },
  { name: "The Sustainable City",     lat: 25.0290, lng: 55.2760 },
  { name: "Town Square",              lat: 25.0080, lng: 55.2900 },
  { name: "Umm Suqeim",               lat: 25.1500, lng: 55.2080 }
];
