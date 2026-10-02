// India-first fictional electronics marketplace ("TechBazaar"). No real brands —
// fictional names only. Realistic Indian pricing, MRP/discount, bank offers and
// scarcity cues so users can observe their own response. This is a behavioural
// simulation: nothing here is a real commercial offer. See docs/INDIA_CATALOGUE_GUIDE.md.
import { photo } from "@/lib/images";

export const ELECTRONICS_APP = { id: "techbazaar", name: "TechBazaar", tagline: "India's gadgets, delivered", accent: "#2563EB" };

export type Review = { user: string; stars: number; text: string };
export type Spec = { label: string; value: string };
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  bankOffer?: string;
  stockLeft?: number; // scarcity cue
  badge?: string;
  desc: string;
  img: string;
  gallery: string[];
  variants?: { label: string; options: string[] };
  specs: Spec[];
  reviews: Review[];
  bestseller?: boolean;
  trending?: boolean;
};

export const EL_CATEGORIES = [
  "Earbuds", "Smartphones", "Smartwatches", "Headphones", "Power Banks",
  "Speakers", "Laptops", "Monitors", "Keyboards", "Gaming", "Cameras",
];

function disc(mrp: number, price: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}
export function discountPct(p: Product) {
  return disc(p.mrp, p.price);
}

function img(kw: string, seed: string) {
  return photo(kw, seed, 800, 600);
}

export const PRODUCTS: Product[] = [
  {
    id: "soniq-airbuds-pro", name: "Soniq AirBuds Pro (ANC)", brand: "Soniq", category: "Earbuds",
    price: 2999, mrp: 4999, rating: 4.4, ratingCount: 18423, bankOffer: "10% off with UPI · up to ₹300",
    stockLeft: 3, badge: "Deal of the day", bestseller: true, trending: true,
    desc: "Active noise cancellation, 42-hour battery with case, low-latency game mode.",
    img: img("wireless earbuds", "soniq-airbuds-pro"),
    gallery: [img("earbuds case", "soniq-g1"), img("earbuds black", "soniq-g2"), img("earbuds charging", "soniq-g3")],
    variants: { label: "Colour", options: ["Midnight", "Pearl", "Blue"] },
    specs: [
      { label: "Battery", value: "8h buds + 34h case" }, { label: "ANC", value: "Hybrid, 32dB" },
      { label: "Bluetooth", value: "5.3" }, { label: "Water resistance", value: "IPX5" },
    ],
    reviews: [
      { user: "Rahul K.", stars: 5, text: "Bass is punchy, ANC genuinely cuts traffic noise on my commute." },
      { user: "Sneha R.", stars: 4, text: "Great value at this price. Case is a bit glossy." },
    ],
  },
  {
    id: "voltedge-x7", name: "Voltedge X7 5G (8GB/128GB)", brand: "Voltedge", category: "Smartphones",
    price: 18999, mrp: 23999, rating: 4.3, ratingCount: 9241, bankOffer: "₹1,500 instant discount on select cards",
    stockLeft: 7, badge: "New launch", trending: true,
    desc: "6.6\" 120Hz AMOLED, 50MP OIS camera, 5000mAh with 67W fast charge.",
    img: img("smartphone", "voltedge-x7"),
    gallery: [img("smartphone back", "vx7-g1"), img("smartphone screen", "vx7-g2"), img("phone camera", "vx7-g3")],
    variants: { label: "Storage", options: ["8GB/128GB", "8GB/256GB", "12GB/256GB"] },
    specs: [
      { label: "Display", value: "6.6\" AMOLED 120Hz" }, { label: "Chipset", value: "OctaCore 5G" },
      { label: "Camera", value: "50MP OIS + 8MP UW" }, { label: "Battery", value: "5000mAh, 67W" },
    ],
    reviews: [
      { user: "Imran S.", stars: 4, text: "Display is gorgeous, charging is crazy fast." },
      { user: "Divya M.", stars: 5, text: "Camera surprised me for the price." },
    ],
  },
  {
    id: "pulse-fit-2", name: "Pulse Fit 2 Smartwatch", brand: "Pulse", category: "Smartwatches",
    price: 1799, mrp: 3499, rating: 4.1, ratingCount: 26110, bankOffer: "No-cost EMI from ₹300/mo",
    stockLeft: 12, bestseller: true,
    desc: "1.85\" display, SpO2 & heart-rate, 100+ sports modes, 7-day battery.",
    img: img("smartwatch", "pulse-fit-2"),
    gallery: [img("smartwatch face", "pf2-g1"), img("fitness watch", "pf2-g2")],
    variants: { label: "Strap", options: ["Black", "Blue", "Rose"] },
    specs: [
      { label: "Display", value: "1.85\" TFT" }, { label: "Battery", value: "Up to 7 days" },
      { label: "Sensors", value: "HR, SpO2" }, { label: "Rating", value: "IP68" },
    ],
    reviews: [{ user: "Karthik V.", stars: 4, text: "Does everything I need for daily steps and sleep." }],
  },
  {
    id: "aero-overear", name: "Aero Studio Over-Ear", brand: "Aero", category: "Headphones",
    price: 4499, mrp: 7999, rating: 4.5, ratingCount: 5312, bankOffer: "10% off with UPI",
    stockLeft: 4, trending: true,
    desc: "40mm drivers, adaptive ANC, 60-hour battery, plush memory-foam cups.",
    img: img("over ear headphones", "aero-overear"),
    gallery: [img("headphones studio", "ao-g1"), img("headphones folded", "ao-g2")],
    variants: { label: "Colour", options: ["Graphite", "Sand"] },
    specs: [
      { label: "Drivers", value: "40mm dynamic" }, { label: "Battery", value: "60h (ANC off)" },
      { label: "ANC", value: "Adaptive" }, { label: "Weight", value: "255g" },
    ],
    reviews: [{ user: "Meera J.", stars: 5, text: "Comfortable for long work sessions, sound is clean." }],
  },
  {
    id: "quanta-powercell", name: "Quanta PowerCell 20000 (22.5W)", brand: "Quanta", category: "Power Banks",
    price: 1299, mrp: 2199, rating: 4.4, ratingCount: 41022, stockLeft: 20, bestseller: true,
    desc: "20000mAh, 22.5W fast charge, triple output, charges a phone ~4 times.",
    img: img("power bank", "quanta-powercell"),
    gallery: [img("power bank ports", "qp-g1")],
    specs: [
      { label: "Capacity", value: "20000mAh" }, { label: "Output", value: "22.5W max" },
      { label: "Ports", value: "2x USB-A, 1x USB-C" },
    ],
    reviews: [{ user: "Aditya P.", stars: 4, text: "Reliable for travel, a little heavy." }],
  },
  {
    id: "orbit-boom", name: "Orbit Boom Party Speaker", brand: "Orbit", category: "Speakers",
    price: 3499, mrp: 5999, rating: 4.2, ratingCount: 7733, bankOffer: "₹250 off with UPI", stockLeft: 6,
    desc: "40W output, RGB lights, 24-hour playtime, IPX6 splash-proof.",
    img: img("bluetooth speaker", "orbit-boom"),
    gallery: [img("party speaker rgb", "ob-g1"), img("portable speaker", "ob-g2")],
    variants: { label: "Colour", options: ["Black", "Teal"] },
    specs: [
      { label: "Output", value: "40W RMS" }, { label: "Playtime", value: "24h" },
      { label: "Rating", value: "IPX6" },
    ],
    reviews: [{ user: "Nisha T.", stars: 4, text: "Loud enough for a terrace party." }],
  },
  {
    id: "nimbus-ultrabook", name: "Nimbus UltraBook 14 (i5/16GB)", brand: "Nimbus", category: "Laptops",
    price: 54990, mrp: 69990, rating: 4.3, ratingCount: 1288, bankOffer: "₹3,000 off + no-cost EMI",
    stockLeft: 5, badge: "Top rated",
    desc: "14\" 2.2K display, 16GB RAM, 512GB SSD, 1.29kg, 12-hour battery.",
    img: img("laptop", "nimbus-ultrabook"),
    gallery: [img("laptop open", "nu-g1"), img("laptop keyboard", "nu-g2")],
    variants: { label: "Config", options: ["i5/16GB/512GB", "i7/16GB/1TB"] },
    specs: [
      { label: "CPU", value: "Latest-gen i5" }, { label: "RAM", value: "16GB LPDDR5" },
      { label: "Storage", value: "512GB SSD" }, { label: "Weight", value: "1.29kg" },
    ],
    reviews: [{ user: "Vivek A.", stars: 5, text: "Light, fast, great screen for the money." }],
  },
  {
    id: "quanta-mon27", name: "Quanta View 27\" QHD 165Hz", brand: "Quanta", category: "Monitors",
    price: 16999, mrp: 24999, rating: 4.5, ratingCount: 2041, stockLeft: 8, trending: true,
    desc: "27\" QHD IPS, 165Hz, 1ms, 95% DCI-P3, height-adjustable stand.",
    img: img("computer monitor", "quanta-mon27"),
    gallery: [img("gaming monitor", "qm-g1")],
    specs: [
      { label: "Panel", value: "27\" IPS QHD" }, { label: "Refresh", value: "165Hz" },
      { label: "Response", value: "1ms MPRT" },
    ],
    reviews: [{ user: "Rohan D.", stars: 5, text: "Colours are superb for editing and gaming." }],
  },
  {
    id: "pulse-mechkey", name: "Pulse MechKey TKL (Hot-swap)", brand: "Pulse", category: "Keyboards",
    price: 2799, mrp: 4499, rating: 4.4, ratingCount: 3550, bankOffer: "10% off with UPI", stockLeft: 9,
    desc: "Hot-swappable switches, RGB, PBT keycaps, USB-C, TKL layout.",
    img: img("mechanical keyboard", "pulse-mechkey"),
    gallery: [img("keyboard rgb", "pm-g1")],
    variants: { label: "Switch", options: ["Red (linear)", "Brown (tactile)"] },
    specs: [{ label: "Layout", value: "TKL (87 keys)" }, { label: "Keycaps", value: "PBT double-shot" }],
    reviews: [{ user: "Farhan Q.", stars: 4, text: "Typing feels premium. Software could be better." }],
  },
  {
    id: "voltedge-gpad", name: "Voltedge GamePad Elite", brand: "Voltedge", category: "Gaming",
    price: 2199, mrp: 3999, rating: 4.2, ratingCount: 6120, stockLeft: 15,
    desc: "Low-latency wireless, hall-effect sticks, 20-hour battery, PC & mobile.",
    img: img("game controller", "voltedge-gpad"),
    gallery: [img("gamepad", "vg-g1")],
    specs: [{ label: "Connection", value: "2.4G + BT" }, { label: "Battery", value: "20h" }],
    reviews: [{ user: "Tanvi S.", stars: 4, text: "Sticks feel accurate, no drift so far." }],
  },
  {
    id: "aero-vlogcam", name: "Aero VlogCam 4K Pocket", brand: "Aero", category: "Cameras",
    price: 21999, mrp: 28999, rating: 4.3, ratingCount: 842, bankOffer: "No-cost EMI from ₹1,833/mo",
    stockLeft: 4, badge: "New launch",
    desc: "4K60 pocket camera, gimbal stabilisation, face-track, flip screen.",
    img: img("vlog camera", "aero-vlogcam"),
    gallery: [img("pocket camera", "av-g1")],
    specs: [{ label: "Video", value: "4K60" }, { label: "Stabilisation", value: "3-axis gimbal" }],
    reviews: [{ user: "Priya N.", stars: 5, text: "Perfect for travel vlogs, super stable." }],
  },
  {
    id: "soniq-mini", name: "Soniq Mini Bluetooth Speaker", brand: "Soniq", category: "Speakers",
    price: 899, mrp: 1799, rating: 4.0, ratingCount: 15320, stockLeft: 25,
    desc: "Pocket speaker, 12-hour playtime, punchy bass, clip-on design.",
    img: img("mini speaker", "soniq-mini"),
    gallery: [img("small bluetooth speaker", "sm-g1")],
    variants: { label: "Colour", options: ["Black", "Red", "Green"] },
    specs: [{ label: "Output", value: "5W" }, { label: "Playtime", value: "12h" }],
    reviews: [{ user: "Gaurav L.", stars: 4, text: "Tiny but surprisingly loud." }],
  },
];

export function product(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
export function productsByCategory(cat: string | null): Product[] {
  return cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS;
}
export function deals(): Product[] {
  return [...PRODUCTS].sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 6);
}
export function trending(): Product[] {
  return PRODUCTS.filter((p) => p.trending);
}
