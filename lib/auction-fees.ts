// Official US auction buyer fees for standard vehicles, paid with secured
// funds (wire transfer). Each tier is [lowest final bid, fee in USD]; a tier
// applies until the next one starts. Re-check the sources when the auctions
// announce new schedules and update `checked`.
export const feeSources = {
  checked: "2026-10-06",
  copart: "https://www.copart.com/content/us/en/member-fees-us-licensed-less",
  iaai: "https://www.iaai.com/marketing/standard-iaa-licensed-buyer-fees",
};

type Tiers = [from: number, fee: number][];
type Schedule = { tiers: Tiers; percentFrom: number; percent: number };

// Copart Standard Pricing and IAA Standard Volume share the non-clean figures.
// prettier-ignore
const nonCleanBuyerFee: Schedule = {
  tiers: [
    [0, 25], [50, 45], [100, 80], [200, 130], [300, 137.5], [350, 145],
    [400, 175], [450, 185], [500, 205], [550, 210], [600, 240], [700, 270],
    [800, 295], [900, 320], [1000, 375], [1200, 395], [1300, 410],
    [1400, 430], [1500, 445], [1600, 465], [1700, 485], [1800, 510],
    [2000, 535], [2400, 570], [2500, 610], [3000, 655], [3500, 705],
    [4000, 725], [4500, 750], [5000, 775], [5500, 800], [6000, 825],
    [6500, 845], [7000, 880], [7500, 900], [8000, 925], [8500, 945],
    [10000, 1000],
  ],
  percentFrom: 15000,
  percent: 7.5,
};
// prettier-ignore
const copartCleanBuyerFee: Schedule = {
  tiers: [
    [0, 25], [50, 45], [100, 80], [200, 120], [400, 160], [500, 185],
    [600, 210], [700, 230], [800, 250], [900, 275], [1000, 325], [1200, 350],
    [1300, 365], [1400, 380], [1500, 390], [1600, 410], [1700, 420],
    [1800, 440], [2000, 470], [2400, 480], [2500, 500], [3000, 600],
    [3500, 675], [4000, 710], [4500, 750], [6000, 800], [7500, 815],
    [8000, 840], [10000, 850],
  ],
  percentFrom: 15000,
  percent: 7.25,
};
// Copart "Virtual Bid Fee" and IAA "Internet / Proxy Bid Fee".
const bidFeeSteps = [0, 100, 500, 1000, 1500, 2000, 4000, 6000, 8000];
const withSteps = (fees: number[]): Tiers =>
  bidFeeSteps.map((from, i) => [from, fees[i]]);
const nonCleanBidFee = {
  live: withSteps([0, 50, 65, 85, 95, 110, 125, 145, 160]),
  preBid: withSteps([0, 40, 55, 75, 85, 100, 110, 125, 140]),
};
const copartCleanBidFee = {
  live: withSteps([0, 49, 59, 79, 89, 99, 109, 139, 149]),
  preBid: withSteps([0, 39, 49, 69, 79, 89, 99, 119, 129]),
};

export type Auction = "Copart" | "IAAI";
export type Title = "nonClean" | "clean";
export type BidType = "live" | "preBid";
export type FeeLine = { label: string; amount: number };

function tierFee(tiers: Tiers, bid: number) {
  let fee = 0;
  for (const [from, amount] of tiers) if (bid >= from) fee = amount;
  return fee;
}
function buyerFee({ tiers, percentFrom, percent }: Schedule, bid: number) {
  return bid >= percentFrom
    ? Math.round(bid * percent) / 100
    : tierFee(tiers, bid);
}

export function auctionFees(
  auction: Auction,
  bid: number,
  title: Title,
  bidType: BidType,
): FeeLine[] {
  if (!(bid > 0)) return [];
  if (auction === "IAAI")
    return [
      { label: "Buyer fee", amount: buyerFee(nonCleanBuyerFee, bid) },
      {
        label: bidType === "live" ? "Live online bid fee" : "Proxy bid fee",
        amount: tierFee(nonCleanBidFee[bidType], bid),
      },
      { label: "Service fee", amount: 105 },
      { label: "Title handling fee", amount: 20 },
    ];
  const clean = title === "clean";
  return [
    {
      label: "Buyer fee",
      amount: buyerFee(clean ? copartCleanBuyerFee : nonCleanBuyerFee, bid),
    },
    {
      label: "Virtual bid fee",
      amount: tierFee(
        (clean ? copartCleanBidFee : nonCleanBidFee)[bidType],
        bid,
      ),
    },
    { label: "Gate fee", amount: clean ? 79 : 95 },
    { label: "Environmental fee", amount: 15 },
  ];
}
