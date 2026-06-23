export interface Ward {
  name: string;
  lat: number;
  lng: number;
}

export interface Constituency {
  name: string;
  wards: Ward[];
}

// Nairobi constituency and ward data with representative coordinates.
// Coordinates are approximate for each ward area and can be refined later.
export const AREAS: Constituency[] = [
  {
    name: "Westlands",
    wards: [
      { name: "Parklands/Highridge", lat: -1.2777, lng: 36.8145 },
      { name: "Kitisuru", lat: -1.2550, lng: 36.7750 },
      { name: "Kangemi", lat: -1.2702, lng: 36.7606 },
      { name: "Mountain View", lat: -1.2725, lng: 36.8120 },
      { name: "Westlands", lat: -1.2700, lng: 36.8050 },
    ],
  },
  {
    name: "Dagoretti North",
    wards: [
      { name: "Gichagi", lat: -1.2830, lng: 36.7600 },
      { name: "Karura", lat: -1.2750, lng: 36.7900 },
      { name: "Kilimani", lat: -1.2921, lng: 36.8047 },
      { name: "Kileleshwa", lat: -1.2860, lng: 36.7940 },
      { name: "Kyuna", lat: -1.2867, lng: 36.7981 },
    ],
  },
  {
    name: "Dagoretti South",
    wards: [
      { name: "Riruta", lat: -1.2875, lng: 36.7283 },
      { name: "Ngando", lat: -1.2990, lng: 36.7285 },
      { name: "Uthiru/Ruthimitu", lat: -1.2835, lng: 36.7339 },
      { name: "Waithaka", lat: -1.2938, lng: 36.7253 },
      { name: "Mugumo-ini", lat: -1.2710, lng: 36.7285 },
    ],
  },
  {
    name: "Kibra",
    wards: [
      { name: "Laini Saba", lat: -1.3200, lng: 36.7800 },
      { name: "Lindi", lat: -1.3150, lng: 36.7815 },
      { name: "Makina", lat: -1.3290, lng: 36.7755 },
      { name: "Sarang'ombe", lat: -1.3195, lng: 36.7790 },
      { name: "Silanga", lat: -1.3280, lng: 36.7830 },
    ],
  },
  {
    name: "Lang'ata",
    wards: [
      { name: "Karen", lat: -1.3197, lng: 36.7219 },
      { name: "Lang'ata", lat: -1.3240, lng: 36.7800 },
      { name: "South C", lat: -1.3120, lng: 36.8270 },
      { name: "Nyayo Highrise", lat: -1.3230, lng: 36.7900 },
      { name: "Muguga", lat: -1.2878, lng: 36.7084 },
    ],
  },
  {
    name: "Embakasi South",
    wards: [
      { name: "Imara Daima", lat: -1.3438, lng: 36.8551 },
      { name: "Kwa Njenga", lat: -1.3100, lng: 36.8660 },
      { name: "Kwa Reuben", lat: -1.3115, lng: 36.8766 },
      { name: "Pipeline", lat: -1.3183, lng: 36.8712 },
      { name: "Ulanda", lat: -1.3230, lng: 36.8733 },
    ],
  },
  {
    name: "Embakasi North",
    wards: [
      { name: "Dandora I", lat: -1.2652, lng: 36.8892 },
      { name: "Dandora II", lat: -1.2665, lng: 36.8945 },
      { name: "Dandora III", lat: -1.2639, lng: 36.9022 },
      { name: "Dandora IV", lat: -1.2610, lng: 36.9153 },
      { name: "Korogocho", lat: -1.2646, lng: 36.8907 },
    ],
  },
  {
    name: "Embakasi East",
    wards: [
      { name: "Embakasi", lat: -1.3137, lng: 36.9103 },
      { name: "Utawala", lat: -1.2843, lng: 36.9335 },
      { name: "Mihango", lat: -1.3050, lng: 36.8960 },
      { name: "Upper Savannah", lat: -1.3250, lng: 36.9413 },
      { name: "Lower Savannah", lat: -1.3440, lng: 36.9200 },
    ],
  },
  {
    name: "Embakasi Central",
    wards: [
      { name: "Kayole North", lat: -1.2832, lng: 36.8889 },
      { name: "Kayole South", lat: -1.2943, lng: 36.8978 },
      { name: "Komarock", lat: -1.2828, lng: 36.9002 },
      { name: "Matopeni/Spring Valley", lat: -1.2920, lng: 36.8865 },
      { name: "Saika", lat: -1.2742, lng: 36.8941 },
    ],
  },
  {
    name: "Embakasi West",
    wards: [
      { name: "Umoja I", lat: -1.2696, lng: 36.8924 },
      { name: "Umoja II", lat: -1.2648, lng: 36.9001 },
      { name: "Mowlem", lat: -1.2663, lng: 36.8827 },
      { name: "Kariobangi South", lat: -1.2634, lng: 36.8821 },
      { name: "Dandora Area I", lat: -1.2624, lng: 36.8936 },
    ],
  },
  {
    name: "Roysambu",
    wards: [
      { name: "Roysambu", lat: -1.2105, lng: 36.8368 },
      { name: "Zimmerman", lat: -1.2190, lng: 36.8427 },
      { name: "Githurai", lat: -1.2350, lng: 36.8932 },
      { name: "Kahawa West", lat: -1.2000, lng: 36.8380 },
      { name: "Kasarani", lat: -1.1902, lng: 36.8889 },
    ],
  },
  {
    name: "Kasarani",
    wards: [
      { name: "Kasarani", lat: -1.1945, lng: 36.9030 },
      { name: "Thome", lat: -1.2194, lng: 36.8773 },
      { name: "Mirema", lat: -1.1970, lng: 36.9065 },
      { name: "Njiru", lat: -1.2483, lng: 36.9163 },
      { name: "Kariobangi North", lat: -1.2541, lng: 36.8912 },
    ],
  },
  {
    name: "Mathare",
    wards: [
      { name: "Mathare", lat: -1.2631, lng: 36.8488 },
      { name: "Kayaba", lat: -1.2570, lng: 36.8560 },
      { name: "Kiamaiko", lat: -1.2784, lng: 36.8558 },
      { name: "Huruma", lat: -1.2575, lng: 36.8505 },
      { name: "Mabatini", lat: -1.2705, lng: 36.8470 },
    ],
  },
  {
    name: "Starehe",
    wards: [
      { name: "Pangani", lat: -1.2967, lng: 36.8313 },
      { name: "Ziwani/Kariokor", lat: -1.2894, lng: 36.8431 },
      { name: "Ngara", lat: -1.2833, lng: 36.8228 },
      { name: "Kaloleni", lat: -1.2839, lng: 36.8297 },
      { name: "Starehe", lat: -1.2920, lng: 36.8219 },
    ],
  },
  {
    name: "Kamukunji",
    wards: [
      { name: "Eastleigh North", lat: -1.2765, lng: 36.8847 },
      { name: "Eastleigh South", lat: -1.2910, lng: 36.8601 },
      { name: "Airbase", lat: -1.2898, lng: 36.8649 },
      { name: "California", lat: -1.2903, lng: 36.8726 },
      { name: "Majengo", lat: -1.2922, lng: 36.8442 },
    ],
  },
  {
    name: "Makadara",
    wards: [
      { name: "Harambee", lat: -1.3008, lng: 36.8289 },
      { name: "Makadara", lat: -1.3048, lng: 36.8458 },
      { name: "Voi", lat: -1.2966, lng: 36.8539 },
      { name: "Mowlem", lat: -1.2901, lng: 36.8668 },
      { name: "Ziwani", lat: -1.2969, lng: 36.8438 },
    ],
  },
  {
    name: "Nairobi West",
    wards: [
      { name: "Kawangware", lat: -1.2809, lng: 36.7308 },
      { name: "Kibagare", lat: -1.2838, lng: 36.7430 },
      { name: "Mountain View", lat: -1.2725, lng: 36.8120 },
      { name: "Mugumo-ini", lat: -1.2710, lng: 36.7285 },
      { name: "Uthiru/Ruthimitu", lat: -1.2835, lng: 36.7339 },
    ],
  },
];
