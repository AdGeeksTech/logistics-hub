import { bodyTypes, fuelTypes, locations, type Listing } from "./cars";

export const sorts = {
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  year: "Year: newest",
  mileage: "Mileage: lowest",
} as const;
export type Sort = keyof typeof sorts;
export type SearchParams = Record<string, string | string[] | undefined>;
export type CarFilters = {
  make?: string;
  body?: string;
  fuel?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  sort: Sort;
  sold: boolean;
  page: number;
};
export const pageSize = 24;

export function parseFilters(params: SearchParams): CarFilters {
  const get = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const positive = (key: string) => {
    const value = Number(get(key));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  const oneOf = (key: string, options: object) => {
    const value = get(key);
    return value && value in options ? value : undefined;
  };
  const sort = get("sort");
  return {
    make: get("make")?.slice(0, 60),
    body: oneOf("body", bodyTypes),
    fuel: oneOf("fuel", fuelTypes),
    location: oneOf("location", locations),
    priceMin: positive("priceMin"),
    priceMax: positive("priceMax"),
    yearMin: positive("yearMin"),
    yearMax: positive("yearMax"),
    sort: sort && sort in sorts ? (sort as Sort) : "newest",
    sold: get("sold") === "1",
    page: Math.max(1, Math.floor(positive("page") ?? 1)),
  };
}

// Listings arrive newest first. Sold cars stay at the end in every order.
export function applyFilters(listings: Listing[], f: CarFilters) {
  const matches = listings.filter(
    (l) =>
      (f.sold || l.status !== "sold") &&
      (!f.make || l.make.toLowerCase() === f.make.toLowerCase()) &&
      (!f.body || l.body === f.body) &&
      (!f.fuel || l.fuel === f.fuel) &&
      (!f.location || l.location === f.location) &&
      (!f.priceMin || (l.price ?? 0) >= f.priceMin) &&
      (!f.priceMax || (l.price !== null && l.price <= f.priceMax)) &&
      (!f.yearMin || l.year >= f.yearMin) &&
      (!f.yearMax || l.year <= f.yearMax),
  );
  const order: Record<Sort, (a: Listing, b: Listing) => number> = {
    newest: () => 0,
    "price-asc": (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    "price-desc": (a, b) => (b.price ?? -1) - (a.price ?? -1),
    year: (a, b) => b.year - a.year,
    mileage: (a, b) => a.mileage - b.mileage,
  };
  return matches.sort(
    (a, b) =>
      Number(a.status === "sold") - Number(b.status === "sold") ||
      order[f.sort](a, b),
  );
}

// Builds a catalogue URL query, dropping empty values and the defaults.
export function filterQuery(f: Partial<CarFilters>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(f))
    if (
      value !== undefined &&
      value !== false &&
      !(key === "sort" && value === "newest") &&
      !(key === "page" && value === 1)
    )
      query.set(key, value === true ? "1" : String(value));
  const text = query.toString();
  return text ? `?${text}` : "";
}
