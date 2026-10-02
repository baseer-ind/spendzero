// India-first fictional marketplace for the remaining verticals (Grocery,
// Shopping, Travel, Entertainment, Beauty, Home). One shared data shape drives a
// single generic storefront, so every vertical is genuinely usable (browse →
// detail → cart → checkout → Decision Moment), not a stub. Fictional brands only,
// ₹ pricing, local imagery. See docs/INDIA_CATALOGUE_GUIDE.md.
import { productArt } from "@/lib/productArt";

export type MarketProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  img: string;
  desc: string;
  unit?: string; // "1 kg", "per night", "2 tickets"
  badge?: string;
  bankOffer?: string;
  stockLeft?: number;
  specs?: { label: string; value: string }[];
  bestseller?: boolean;
  trending?: boolean;
};

export type Vertical = {
  id: string;
  name: string; // store/app brand (e.g. FreshKart)
  label: string; // vertical category for tracking & decisions (e.g. Grocery)
  emoji: string;
  tagline: string;
  accent: string;
  ctaWord: string; // "Add to cart" vs "Book" etc.
  categories: string[];
  products: MarketProduct[];
};

let seedN = 0;
function mk(
  kw: string,
  partial: Omit<MarketProduct, "img" | "rating" | "ratingCount" | "mrp"> & { rating?: number; ratingCount?: number; mrp?: number },
): MarketProduct {
  seedN += 1;
  return {
    rating: partial.rating ?? 4.2,
    ratingCount: partial.ratingCount ?? 1000 + ((seedN * 137) % 40000),
    mrp: partial.mrp ?? Math.round(partial.price * 1.4),
    img: productArt(kw, partial.id),
    ...partial,
  };
}

export const VERTICALS: Record<string, Vertical> = {
  grocery: {
    id: "grocery", name: "FreshKart", label: "Grocery", emoji: "🛒", tagline: "Daily needs in minutes", accent: "#10B981", ctaWord: "Add to cart",
    categories: ["Fruits & Veg", "Dairy", "Staples", "Snacks", "Beverages", "Household"],
    products: [
      mk("banana fruit", { id: "gr-banana", name: "Fresh Bananas (1 dozen)", brand: "FreshKart", category: "Fruits & Veg", price: 59, unit: "12 pcs", bestseller: true, trending: true }),
      mk("tomato vegetable", { id: "gr-tomato", name: "Tomatoes (1 kg)", brand: "FreshKart", category: "Fruits & Veg", price: 39, unit: "1 kg" }),
      mk("onion vegetable", { id: "gr-onion", name: "Onions (1 kg)", brand: "FreshKart", category: "Fruits & Veg", price: 45, unit: "1 kg" }),
      mk("milk dairy", { id: "gr-milk", name: "DairyPure Toned Milk (1 L)", brand: "DairyPure", category: "Dairy", price: 68, unit: "1 L", bestseller: true }),
      mk("paneer dairy", { id: "gr-paneer", name: "Fresh Paneer (200 g)", brand: "DairyPure", category: "Dairy", price: 89, unit: "200 g" }),
      mk("atta flour staple", { id: "gr-atta", name: "Chakki Atta (5 kg)", brand: "Annapurna", category: "Staples", price: 245, unit: "5 kg", trending: true }),
      mk("basmati rice", { id: "gr-rice", name: "Basmati Rice (5 kg)", brand: "Annapurna", category: "Staples", price: 560, unit: "5 kg" }),
      mk("instant noodles snack", { id: "gr-noodles", name: "InstaNoodles Masala (Pack of 6)", brand: "InstaBite", category: "Snacks", price: 72, unit: "6 x 70g", bestseller: true }),
      mk("biscuits snack", { id: "gr-biscuit", name: "Choco Cream Biscuits (Pack of 4)", brand: "InstaBite", category: "Snacks", price: 60, unit: "4 packs" }),
      mk("tea beverage", { id: "gr-tea", name: "Premium Assam Tea (500 g)", brand: "ChaiGhar", category: "Beverages", price: 220, unit: "500 g" }),
      mk("dishwash household", { id: "gr-dish", name: "Dishwash Gel (2 x 750 ml)", brand: "SparkClean", category: "Household", price: 198, unit: "2 x 750ml" }),
      mk("detergent household", { id: "gr-detergent", name: "Matic Detergent (2 kg)", brand: "SparkClean", category: "Household", price: 310, unit: "2 kg" }),
    ],
  },
  shopping: {
    id: "shopping", name: "StyleBazaar", label: "Shopping", emoji: "👕", tagline: "Fashion for every day", accent: "#D946EF", ctaWord: "Add to cart",
    categories: ["Men", "Women", "Footwear", "Watches", "Bags", "Accessories"],
    products: [
      mk("tshirt men fashion", { id: "sh-tshirt", name: "Cotton Crew T-Shirt", brand: "Urbane", category: "Men", price: 499, unit: "M/L/XL", bestseller: true, trending: true }),
      mk("kurta ethnic", { id: "sh-kurta", name: "Cotton Kurta", brand: "Rang", category: "Men", price: 899, unit: "M/L/XL" }),
      mk("jeans denim", { id: "sh-jeans", name: "Slim-Fit Jeans", brand: "Urbane", category: "Men", price: 1299 }),
      mk("saree women ethnic", { id: "sh-saree", name: "Printed Georgette Saree", brand: "Rang", category: "Women", price: 1499, bestseller: true }),
      mk("kurti women", { id: "sh-kurti", name: "A-Line Kurti", brand: "Rang", category: "Women", price: 749, trending: true }),
      mk("running shoes footwear", { id: "sh-shoes", name: "Running Shoes", brand: "Stride", category: "Footwear", price: 1899, bestseller: true }),
      mk("sandals footwear", { id: "sh-sandal", name: "Casual Sandals", brand: "Stride", category: "Footwear", price: 799 }),
      mk("watch wrist", { id: "sh-watch", name: "Minimalist Analog Watch", brand: "Tempo", category: "Watches", price: 1599 }),
      mk("handbag women", { id: "sh-bag", name: "Tote Handbag", brand: "Carry", category: "Bags", price: 1199 }),
      mk("backpack bag", { id: "sh-backpack", name: "Everyday Backpack 25L", brand: "Carry", category: "Bags", price: 1399, trending: true }),
      mk("sunglasses accessory", { id: "sh-shades", name: "UV Sunglasses", brand: "Tempo", category: "Accessories", price: 699 }),
      mk("wallet accessory", { id: "sh-wallet", name: "Leather Wallet", brand: "Carry", category: "Accessories", price: 599 }),
    ],
  },
  travel: {
    id: "travel", name: "TripNest", label: "Travel", emoji: "✈️", tagline: "Plan your next escape", accent: "#06B6D4", ctaWord: "Book now",
    categories: ["Flights", "Hotels", "Holiday Packages", "Trains"],
    products: [
      mk("flight airplane travel", { id: "tr-goa", name: "Hyderabad → Goa (one-way)", brand: "TripNest Air", category: "Flights", price: 3499, unit: "1 traveller", bestseller: true, trending: true, specs: [{ label: "Duration", value: "1h 25m" }, { label: "Baggage", value: "15 kg" }] }),
      mk("flight airplane", { id: "tr-del", name: "Hyderabad → Delhi (one-way)", brand: "TripNest Air", category: "Flights", price: 4299, unit: "1 traveller", specs: [{ label: "Duration", value: "2h 10m" }] }),
      mk("beach resort hotel", { id: "tr-resort", name: "Goa Beach Resort (per night)", brand: "StaySuite", category: "Hotels", price: 4999, unit: "per night", bestseller: true, specs: [{ label: "Rating", value: "4-star" }, { label: "Includes", value: "Breakfast" }] }),
      mk("hotel room city", { id: "tr-hotel", name: "City Business Hotel (per night)", brand: "StaySuite", category: "Hotels", price: 2799, unit: "per night" }),
      mk("himalaya mountain package", { id: "tr-himachal", name: "Himachal 4N / 5D Package", brand: "TripNest", category: "Holiday Packages", price: 18999, unit: "per person", trending: true, specs: [{ label: "Nights", value: "4" }, { label: "Includes", value: "Stay + cabs" }] }),
      mk("kerala backwaters", { id: "tr-kerala", name: "Kerala Backwaters 3N Package", brand: "TripNest", category: "Holiday Packages", price: 15499, unit: "per person" }),
      mk("train railway travel", { id: "tr-train", name: "Hyderabad → Bengaluru (AC 3-tier)", brand: "RailGo", category: "Trains", price: 1250, unit: "1 berth" }),
    ],
  },
  entertainment: {
    id: "entertainment", name: "ShowTime", label: "Entertainment", emoji: "🎬", tagline: "Movies, events & more", accent: "#8B5CF6", ctaWord: "Book now",
    categories: ["Movies", "Events", "Streaming", "Gaming"],
    products: [
      mk("movie cinema ticket", { id: "en-movie", name: "Movie Tickets (2) — Weekend Show", brand: "ShowTime Cinemas", category: "Movies", price: 560, unit: "2 tickets", bestseller: true, trending: true }),
      mk("movie premium recliner", { id: "en-recliner", name: "Recliner Movie Tickets (2)", brand: "ShowTime Cinemas", category: "Movies", price: 980, unit: "2 tickets" }),
      mk("concert music event", { id: "en-concert", name: "Live Music Concert — Entry", brand: "StageLive", category: "Events", price: 1499, unit: "1 pass", trending: true }),
      mk("comedy show event", { id: "en-comedy", name: "Stand-up Comedy Night", brand: "StageLive", category: "Events", price: 799, unit: "1 pass" }),
      mk("streaming subscription", { id: "en-stream", name: "StreamMax Annual Plan", brand: "StreamMax", category: "Streaming", price: 999, unit: "12 months", bestseller: true }),
      mk("music streaming", { id: "en-music", name: "TuneIn Music Premium (Yearly)", brand: "TuneIn", category: "Streaming", price: 1189, unit: "12 months" }),
      mk("video game console", { id: "en-game", name: "Adventure Quest (Game)", brand: "PixelPlay", category: "Gaming", price: 2499 }),
    ],
  },
  beauty: {
    id: "beauty", name: "GlowBox", label: "Beauty", emoji: "💄", tagline: "Skincare, makeup & grooming", accent: "#EC4899", ctaWord: "Add to cart",
    categories: ["Skincare", "Makeup", "Haircare", "Fragrance", "Men's Grooming"],
    products: [
      mk("face wash skincare", { id: "be-facewash", name: "Gentle Face Wash (150 ml)", brand: "Luméa", category: "Skincare", price: 299, unit: "150 ml", bestseller: true, trending: true }),
      mk("moisturizer cream skincare", { id: "be-moist", name: "Daily Moisturiser SPF 30", brand: "Luméa", category: "Skincare", price: 449, unit: "100 ml" }),
      mk("lipstick makeup", { id: "be-lipstick", name: "Matte Lipstick", brand: "Blush", category: "Makeup", price: 399, bestseller: true }),
      mk("kajal makeup", { id: "be-kajal", name: "Intense Kajal", brand: "Blush", category: "Makeup", price: 199, trending: true }),
      mk("shampoo haircare", { id: "be-shampoo", name: "Anti-Hairfall Shampoo (340 ml)", brand: "Mane", category: "Haircare", price: 379, unit: "340 ml" }),
      mk("hair oil haircare", { id: "be-hairoil", name: "Nourishing Hair Oil (200 ml)", brand: "Mane", category: "Haircare", price: 249, unit: "200 ml" }),
      mk("perfume fragrance", { id: "be-perfume", name: "Eau de Parfum (50 ml)", brand: "Aura", category: "Fragrance", price: 1299, unit: "50 ml" }),
      mk("beard oil grooming", { id: "be-beard", name: "Beard Growth Oil (50 ml)", brand: "Rugged", category: "Men's Grooming", price: 349, unit: "50 ml" }),
    ],
  },
  home: {
    id: "home", name: "NestMart", label: "Home", emoji: "🏠", tagline: "Everything for your home", accent: "#F59E0B", ctaWord: "Add to cart",
    categories: ["Kitchen", "Decor", "Appliances", "Furniture", "Bedding", "Cleaning"],
    products: [
      mk("cookware kitchen pan", { id: "ho-cookware", name: "Non-Stick Cookware Set (3 pc)", brand: "ChefLine", category: "Kitchen", price: 1799, bestseller: true, trending: true }),
      mk("pressure cooker kitchen", { id: "ho-cooker", name: "Pressure Cooker 5 L", brand: "ChefLine", category: "Kitchen", price: 1299 }),
      mk("mixer grinder appliance", { id: "ho-mixer", name: "Mixer Grinder 750W", brand: "Volta", category: "Appliances", price: 2999, bestseller: true }),
      mk("vacuum cleaner appliance", { id: "ho-vacuum", name: "Handheld Vacuum Cleaner", brand: "Volta", category: "Appliances", price: 3499, trending: true }),
      mk("wall art decor", { id: "ho-art", name: "Framed Wall Art (Set of 3)", brand: "Casa", category: "Decor", price: 899 }),
      mk("table lamp decor", { id: "ho-lamp", name: "Minimal Table Lamp", brand: "Casa", category: "Decor", price: 749 }),
      mk("study chair furniture", { id: "ho-chair", name: "Ergonomic Study Chair", brand: "DeskPro", category: "Furniture", price: 5499 }),
      mk("bedsheet bedding", { id: "ho-sheet", name: "Cotton Double Bedsheet Set", brand: "DreamSoft", category: "Bedding", price: 999, bestseller: true }),
      mk("floor cleaner cleaning", { id: "ho-cleaner", name: "Floor Cleaner (2 x 1 L)", brand: "SparkClean", category: "Cleaning", price: 220, unit: "2 x 1L" }),
    ],
  },
};

export function vertical(id: string): Vertical | undefined {
  return VERTICALS[id];
}
export function marketProduct(vid: string, pid: string): MarketProduct | undefined {
  return VERTICALS[vid]?.products.find((p) => p.id === pid);
}
export function discountPct(p: MarketProduct): number {
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}
export function dealsFor(v: Vertical): MarketProduct[] {
  return [...v.products].sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 6);
}
