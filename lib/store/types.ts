import type { Listing, ListingFields } from "../cars";
import type { Locale } from "../i18n";
import type { SitePhoto, SitePhotoSlot } from "../site-photo-slots";

// One edited site text in one language. `published` is live; `draft` is
// the pending value while `hasDraft` is true. A null value means "use the
// text built into the site".
export type TextRow = {
  key: string;
  locale: Locale;
  published: string | null;
  draft: string | null;
  hasDraft: boolean;
  updatedAt: string;
};
export type TextChange = { key: string; locale: Locale; value: string | null };

// A replaced site photo, drafted and published like the texts. Null means
// "use the photo built into the site".
export type SitePhotoRow = {
  slot: SitePhotoSlot;
  published: SitePhoto | null;
  draft: SitePhoto | null;
  hasDraft: boolean;
  updatedAt: string;
};
export type SitePhotoChange = { slot: SitePhotoSlot; photo: SitePhoto | null };

export interface Store {
  listListings(): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | null>;
  createListing(fields: ListingFields): Promise<Listing>;
  updateListing(id: number, fields: ListingFields): Promise<Listing | null>;
  deleteListing(id: number): Promise<boolean>;
  getTexts(): Promise<TextRow[]>;
  saveTextDrafts(changes: TextChange[]): Promise<void>;
  publishTexts(): Promise<number>;
  discardTextDrafts(): Promise<number>;
  getSitePhotos(): Promise<SitePhotoRow[]>;
  saveSitePhotoDrafts(changes: SitePhotoChange[]): Promise<void>;
  publishSitePhotos(): Promise<number>;
  discardSitePhotoDrafts(): Promise<number>;
  // Rate limiting: one row per attempt, kept for a day. `countHits` returns
  // the attempts in each window (in seconds, up to a day).
  addHit(bucket: string): Promise<void>;
  countHits(bucket: string, windows: number[]): Promise<number[]>;
}
