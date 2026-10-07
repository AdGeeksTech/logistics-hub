// Car listing model shared by the public pages, the admin form and storage.
// Option keys are stable identifiers stored in the database; the English
// labels double as translation keys in lib/i18n/{ru,ka}.json.
import type { Locale } from "./i18n";

export const statuses = {
  draft: "Draft",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
} as const;
export const bodyTypes = {
  sedan: "Sedan",
  hatchback: "Hatchback",
  suv: "SUV",
  crossover: "Crossover",
  wagon: "Wagon",
  coupe: "Coupe",
  convertible: "Convertible",
  minivan: "Minivan",
  pickup: "Pickup",
  van: "Van",
} as const;
export const conditions = { new: "New", used: "Used" } as const;
export const fuelTypes = {
  electric: "Electric",
  plugin: "Plug-in hybrid",
  erev: "Range extender (EREV)",
  hybrid: "Hybrid",
  petrol: "Petrol",
  diesel: "Diesel",
  lpg: "LPG",
  cng: "CNG",
  hydrogen: "Hydrogen",
} as const;
export const gearboxes = {
  automatic: "Automatic",
  "single-speed": "Single-speed (EV)",
  dct: "Robotised (DCT)",
  cvt: "CVT",
  tiptronic: "Tiptronic",
  manual: "Manual",
} as const;
export const drives = {
  fwd: "Front-wheel drive",
  rwd: "Rear-wheel drive",
  awd: "All-wheel drive (4×4)",
} as const;
export const doorOptions = { "2-3": "2/3", "4-5": "4/5", "6+": ">5" } as const;
export const steeringSides = { left: "Left", right: "Right" } as const;
export const colors = {
  black: "Black",
  white: "White",
  silver: "Silver",
  grey: "Grey",
  blue: "Blue",
  "light-blue": "Light blue",
  green: "Green",
  red: "Red",
  maroon: "Maroon",
  orange: "Orange",
  yellow: "Yellow",
  gold: "Gold",
  beige: "Beige",
  brown: "Brown",
  purple: "Purple",
  pink: "Pink",
  other: "Other",
} as const;
export const interiorMaterials = {
  leather: "Leather",
  "artificial-leather": "Artificial leather",
  combined: "Combined",
  fabric: "Fabric",
  alcantara: "Alcantara",
} as const;
export const locations = {
  china: "In China",
  transit: "In transit",
  tbilisi: "In Tbilisi",
} as const;
export const priceTermsOptions = {
  china: "Price in China",
  tbilisi: "Price in Tbilisi, customs not cleared",
  cleared: "Price in Tbilisi, customs cleared",
} as const;
export const rangeStandards = {
  CLTC: "CLTC",
  WLTP: "WLTP",
  NEDC: "NEDC",
  EPA: "EPA",
} as const;
export const featureGroups = {
  Comfort: {
    "climate-control": "Climate control",
    "air-conditioning": "Air conditioning",
    "heated-seats": "Heated seats",
    "ventilated-seats": "Ventilated seats",
    "massage-seats": "Massage seats",
    "power-seats": "Electric seats",
    "memory-seats": "Seat memory",
    "heated-wheel": "Heated steering wheel",
    "multifunction-wheel": "Multifunction steering wheel",
    keyless: "Keyless entry and start",
    "cruise-control": "Cruise control",
    "adaptive-cruise": "Adaptive cruise control",
    "electric-windows": "Electric windows",
    "power-tailgate": "Electric tailgate",
    sunroof: "Sunroof",
    "panoramic-roof": "Panoramic roof",
    "air-suspension": "Air suspension",
  },
  Multimedia: {
    navigation: "Navigation",
    bluetooth: "Bluetooth",
    carplay: "Apple CarPlay / Android Auto",
    "digital-cluster": "Digital instrument cluster",
    "head-up": "Head-up display",
    "wireless-charging": "Wireless phone charging",
    "premium-audio": "Premium audio",
    "rear-screens": "Rear-seat screens",
  },
  "Safety and assistance": {
    abs: "ABS",
    esp: "Stability control (ESP)",
    "central-locking": "Central locking",
    alarm: "Alarm",
    "parking-sensors": "Parking sensors",
    "rear-camera": "Rear-view camera",
    "camera-360": "360° camera",
    "blind-spot": "Blind-spot monitoring",
    "lane-assist": "Lane-keeping assist",
    "emergency-braking": "Automatic emergency braking",
    "driver-assist": "Advanced driver assistance (L2)",
    "auto-parking": "Automatic parking",
    tpms: "Tyre pressure monitoring",
    "led-headlights": "LED headlights",
  },
  "Other features": {
    "alloy-wheels": "Alloy wheels",
    "spare-wheel": "Spare wheel",
    "tow-bar": "Tow bar",
    "heat-pump": "Heat pump",
    v2l: "Vehicle-to-load (V2L)",
    "fast-charging": "DC fast charging",
  },
} as const;

// Labels of the specification table on the car page, in display order.
export const specLabels = [
  "Year",
  "Condition",
  "Mileage",
  "Body type",
  "Fuel type",
  "Engine volume",
  "Cylinders",
  "Power",
  "Battery capacity",
  "Range",
  "Gearbox",
  "Drive",
  "Doors",
  "Seats",
  "Steering wheel",
  "Color",
  "Interior color",
  "Interior material",
  "Airbags",
  "VIN",
  "Location",
] as const;

type Keys<T> = keyof T & string;
export type Status = Keys<typeof statuses>;
export type Photo = { url: string; width: number; height: number };
export type ListingFields = {
  status: Status;
  make: string;
  model: string;
  trim: string;
  year: number;
  body: Keys<typeof bodyTypes>;
  condition: Keys<typeof conditions>;
  mileage: number;
  fuel: Keys<typeof fuelTypes>;
  engineVolume: number | null;
  cylinders: number | null;
  powerHp: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  rangeStandard: Keys<typeof rangeStandards> | null;
  gearbox: Keys<typeof gearboxes>;
  drive: Keys<typeof drives>;
  doors: Keys<typeof doorOptions> | null;
  seats: number | null;
  steering: Keys<typeof steeringSides>;
  color: Keys<typeof colors> | null;
  interiorColor: Keys<typeof colors> | null;
  interiorMaterial: Keys<typeof interiorMaterials> | null;
  airbags: number | null;
  vin: string;
  features: string[];
  location: Keys<typeof locations>;
  price: number | null;
  priceTerms: Keys<typeof priceTermsOptions> | null;
  negotiable: boolean;
  description: Partial<Record<Locale, string>>;
  photos: Photo[];
};
export type Listing = ListingFields & {
  id: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
export const publicStatuses: Status[] = ["available", "reserved", "sold"];
export const maxPhotos = 30;
export const allFeatures: Record<string, string> = Object.assign(
  {},
  ...Object.values(featureGroups),
);

// Chinese makes first, then brands also built and sold in China. The admin
// form offers these as suggestions; any other make can be typed in.
// prettier-ignore
export const makeSuggestions = [
  "BYD", "Denza", "Fangchengbao", "Yangwang", "Geely", "Galaxy", "Zeekr",
  "Lynk & Co", "Chery", "Exeed", "Jetour", "Omoda", "Jaecoo", "iCar",
  "Changan", "Deepal", "Avatr", "Haval", "Tank", "Wey", "Ora",
  "Great Wall", "Li Auto", "NIO", "Onvo", "Xpeng", "Xiaomi", "Leapmotor",
  "Aito", "Voyah", "Dongfeng", "GAC Aion", "GAC Trumpchi", "Hongqi",
  "IM Motors", "MG", "Roewe", "Wuling", "Baojun", "BAIC", "Arcfox",
  "JAC", "Neta", "Zhiji", "Toyota", "Volkswagen", "Honda", "Nissan",
  "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Tesla", "Buick",
];

export function listingTitle(listing: Pick<Listing, "make" | "model">) {
  return `${listing.make} ${listing.model}`.trim();
}
export function listingSlug(
  listing: Pick<Listing, "id" | "make" | "model" | "year">,
) {
  const words = `${listing.make} ${listing.model} ${listing.year}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return words ? `${listing.id}-${words}` : String(listing.id);
}
export function listingIdFromSlug(slug: string) {
  const match = /^(\d{1,9})(?:-|$)/.exec(slug);
  return match ? Number(match[1]) : null;
}
// The visitor's language, then English, then whichever was written.
export function listingDescription(listing: Listing, locale: Locale) {
  const text = listing.description;
  return text[locale] || text.en || text.ka || text.ru || "";
}

export function emptyListing(): ListingFields {
  return {
    status: "draft",
    make: "",
    model: "",
    trim: "",
    year: new Date().getFullYear(),
    body: "suv",
    condition: "new",
    mileage: 0,
    fuel: "electric",
    engineVolume: null,
    cylinders: null,
    powerHp: null,
    batteryKwh: null,
    rangeKm: null,
    rangeStandard: "CLTC",
    gearbox: "single-speed",
    drive: "rwd",
    doors: "4-5",
    seats: 5,
    steering: "left",
    color: null,
    interiorColor: null,
    interiorMaterial: null,
    airbags: null,
    vin: "",
    features: [],
    location: "china",
    price: null,
    priceTerms: null,
    negotiable: false,
    description: {},
    photos: [],
  };
}

export type FieldErrors = Partial<Record<keyof ListingFields, string>>;

// Validates untrusted input from the admin form. Error values are English
// source strings, translated by the form.
export function parseListing(
  raw: unknown,
): { ok: true; value: ListingFields } | { ok: false; errors: FieldErrors } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const errors: FieldErrors = {};
  const text = (key: keyof ListingFields, max: number, required = false) => {
    const value =
      typeof input[key] === "string" ? (input[key] as string).trim() : "";
    if (required && !value) errors[key] = "Required";
    else if (value.length > max) errors[key] = "Too long";
    return value.slice(0, max);
  };
  const choice = <T extends Record<string, string>>(
    key: keyof ListingFields,
    options: T,
    optional = false,
  ) => {
    const value = input[key];
    if (typeof value === "string" && value in options) return value as Keys<T>;
    if (optional && (value === null || value === "" || value === undefined))
      return null;
    errors[key] = "Choose an option";
    return Object.keys(options)[0] as Keys<T>;
  };
  const number = (
    key: keyof ListingFields,
    min: number,
    max: number,
    { optional = false, integer = true } = {},
  ) => {
    const value = input[key];
    if (optional && (value === null || value === "" || value === undefined))
      return null;
    const parsed = typeof value === "number" ? value : Number(value);
    if (
      value === null ||
      value === "" ||
      !Number.isFinite(parsed) ||
      (integer && !Number.isInteger(parsed)) ||
      parsed < min ||
      parsed > max
    ) {
      errors[key] = `Enter a number from {min} to {max}|${min}|${max}`;
      return min;
    }
    return parsed;
  };
  const maxYear = new Date().getFullYear() + 1;
  const value: ListingFields = {
    status: choice("status", statuses)!,
    make: text("make", 60, true),
    model: text("model", 80, true),
    trim: text("trim", 120),
    year: number("year", 1980, maxYear)!,
    body: choice("body", bodyTypes)!,
    condition: choice("condition", conditions)!,
    mileage: number("mileage", 0, 2000000)!,
    fuel: choice("fuel", fuelTypes)!,
    engineVolume: number("engineVolume", 0.5, 10, {
      optional: true,
      integer: false,
    }),
    cylinders: number("cylinders", 1, 16, { optional: true }),
    powerHp: number("powerHp", 1, 2500, { optional: true }),
    batteryKwh: number("batteryKwh", 1, 300, {
      optional: true,
      integer: false,
    }),
    rangeKm: number("rangeKm", 1, 2500, { optional: true }),
    rangeStandard: choice("rangeStandard", rangeStandards, true),
    gearbox: choice("gearbox", gearboxes)!,
    drive: choice("drive", drives)!,
    doors: choice("doors", doorOptions, true),
    seats: number("seats", 1, 60, { optional: true }),
    steering: choice("steering", steeringSides)!,
    color: choice("color", colors, true),
    interiorColor: choice("interiorColor", colors, true),
    interiorMaterial: choice("interiorMaterial", interiorMaterials, true),
    airbags: number("airbags", 0, 30, { optional: true }),
    vin: text("vin", 17).toUpperCase(),
    features: Array.isArray(input.features)
      ? [
          ...new Set(
            input.features.filter(
              (f): f is string => typeof f === "string" && f in allFeatures,
            ),
          ),
        ]
      : [],
    location: choice("location", locations)!,
    price: number("price", 1, 10000000, { optional: true }),
    priceTerms: choice("priceTerms", priceTermsOptions, true),
    negotiable: input.negotiable === true,
    description: {},
    photos: [],
  };
  if (value.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(value.vin))
    errors.vin = "A VIN has 17 letters and digits";
  const description = input.description as Record<string, unknown> | undefined;
  for (const locale of ["en", "ru", "ka"] as const) {
    const entry = description?.[locale];
    if (typeof entry === "string" && entry.trim()) {
      if (entry.length > 5000) errors.description = "Too long";
      value.description[locale] = entry.trim().slice(0, 5000);
    }
  }
  if (Array.isArray(input.photos))
    for (const photo of input.photos.slice(0, maxPhotos)) {
      const p = photo as Partial<Photo>;
      if (
        typeof p?.url === "string" &&
        /^(https:\/\/|\/api\/uploads\/)/.test(p.url) &&
        Number.isInteger(p.width) &&
        Number.isInteger(p.height)
      )
        value.photos.push({ url: p.url, width: p.width!, height: p.height! });
    }
  if (value.status !== "draft") {
    if (!value.photos.length)
      errors.photos = "Add at least one photo to publish";
    if (value.price === null && !errors.price)
      errors.price = "Add a price to publish";
    // Where the price applies is never guessed for the client.
    if (value.priceTerms === null && !errors.priceTerms)
      errors.priceTerms = "Choose where the price applies to publish";
  }
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}
