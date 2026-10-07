import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getStore } from "./store";
import { publicStatuses, type Listing } from "./cars";

export const listingsTag = "listings";

// Everything visitors may see, cached until an admin saves a listing.
const loadPublic = unstable_cache(
  async () =>
    (await getStore()?.listListings())?.filter((l) =>
      publicStatuses.includes(l.status),
    ) ?? [],
  ["public-listings"],
  { tags: [listingsTag] },
);

// In preview (draft mode) admins also see drafts, straight from the store.
export const getVisibleListings = cache(async (): Promise<Listing[]> => {
  try {
    if ((await draftMode()).isEnabled)
      return (await getStore()?.listListings()) ?? [];
    return await loadPublic();
  } catch (error) {
    console.error("Could not load listings", error);
    return [];
  }
});

export const getVisibleListing = cache(async (id: number) => {
  return (await getVisibleListings()).find((l) => l.id === id) ?? null;
});
