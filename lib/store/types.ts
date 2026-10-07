import type { Listing, ListingFields } from "../cars";
import type { Locale } from "../i18n";

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
}
