// India-first fictional marketplace catalogue. Default city: Hyderabad.
// No real trademarks — fictional brands only. See docs/INDIA_CATALOGUE_GUIDE.md.
export const DEFAULT_CITY = "Hyderabad";
export const CITIES = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune", "Kolkata"];

// Catalogue imagery is now generated locally (offline, never broken). The old
// LoremFlickr dependency is gone. Signature kept so call sites are unchanged.
import { artImage } from "@/lib/localImage";
export function kwImg(keyword: string, seed: string, _w = 600, _h = 420): string {
  return artImage(keyword, seed);
}

export type Diet = "veg" | "nonveg" | "egg";
export type FoodApp = { id: string; name: string; tagline: string; accent: string; badge: string; glyph: string };

export const FOOD_APPS: FoodApp[] = [
  { id: "zaikago", name: "ZaikaGo", tagline: "Ghar jaisa, tez delivery", accent: "#E23744", badge: "#1 in Hyderabad", glyph: "🛵" },
  { id: "khananow", name: "KhanaNow", tagline: "Top-rated kitchens near you", accent: "#C2185B", badge: "Top rated", glyph: "🍴" },
  { id: "mealkart", name: "MealKart", tagline: "30-min meals, no surge", accent: "#F2711C", badge: "Fastest", glyph: "⚡" },
];

export const FOOD_CUISINES = ["Biryani", "Hyderabadi", "South Indian", "North Indian", "Street Food", "Thali", "Desserts", "Beverages", "Chinese"];

export type Dish = {
  id: string; name: string; section: string; desc: string; price: number; mrp?: number;
  rating: number; diet: Diet; img: string; bestseller?: boolean; addons?: { name: string; price: number }[];
};
export type Restaurant = {
  id: string; name: string; area: string; city: string; cuisines: string[]; rating: number; etaMins: number;
  deliveryFee: number; distanceKm: number; costForTwo: number; vegOnly: boolean; offer?: string; img: string;
  apps: string[]; dishes: Dish[];
};

const drinks = [{ name: "Masala Chai", price: 30 }, { name: "Sweet Lassi", price: 60 }];
const naan = [{ name: "Butter Naan", price: 45 }, { name: "Garlic Naan", price: 55 }];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "deccan-zaika", name: "Deccan Zaika", area: "Banjara Hills", city: "Hyderabad",
    cuisines: ["Biryani", "Hyderabadi"], rating: 4.5, etaMins: 38, deliveryFee: 29, distanceKm: 3.4,
    costForTwo: 500, vegOnly: false, offer: "₹100 OFF above ₹499 · UPI", img: kwImg("hyderabadi biryani", "deccan-zaika", 800, 500),
    apps: ["zaikago", "khananow", "mealkart"],
    dishes: [
      { id: "dz-chk-bir", name: "Hyderabadi Chicken Dum Biryani", section: "Popular", desc: "Long-grain basmati, sealed on the dum.", price: 289, mrp: 329, rating: 4.6, diet: "nonveg", img: kwImg("chicken biryani", "dz-chk-bir"), bestseller: true, addons: drinks },
      { id: "dz-mut-bir", name: "Mutton Dum Biryani", section: "Biryani", desc: "Tender mutton on the bone, slow-cooked.", price: 359, rating: 4.5, diet: "nonveg", img: kwImg("mutton biryani", "dz-mut-bir") },
      { id: "dz-haleem", name: "Hyderabadi Haleem", section: "Popular", desc: "Wheat, lentils & mutton, hand-pounded.", price: 220, rating: 4.7, diet: "nonveg", img: kwImg("haleem", "dz-haleem"), bestseller: true },
      { id: "dz-mirchi", name: "Mirchi Ka Salan", section: "Sides", desc: "Peanut-sesame gravy, green chillies.", price: 120, rating: 4.3, diet: "veg", img: kwImg("mirchi salan curry", "dz-mirchi") },
      { id: "dz-veg-bir", name: "Veg Dum Biryani", section: "Biryani", desc: "Seasonal veg, saffron rice.", price: 229, rating: 4.2, diet: "veg", img: kwImg("veg biryani", "dz-veg-bir") },
      { id: "dz-dkm", name: "Double Ka Meetha", section: "Desserts", desc: "Fried bread in saffron milk.", price: 110, rating: 4.6, diet: "veg", img: kwImg("double ka meetha dessert", "dz-dkm") },
      { id: "dz-irani", name: "Irani Chai + Osmania", section: "Beverages", desc: "Irani chai with Osmania biscuits.", price: 70, rating: 4.5, diet: "veg", img: kwImg("irani chai", "dz-irani") },
    ],
  },
  {
    id: "charminar-kitchen", name: "Charminar Kitchen", area: "Old City", city: "Hyderabad",
    cuisines: ["Hyderabadi", "North Indian"], rating: 4.4, etaMins: 42, deliveryFee: 35, distanceKm: 5.1,
    costForTwo: 450, vegOnly: false, offer: "Free delivery over ₹199", img: kwImg("indian restaurant curry", "charminar-kitchen", 800, 500),
    apps: ["zaikago", "khananow"],
    dishes: [
      { id: "ck-butter-chk", name: "Butter Chicken", section: "Popular", desc: "Creamy tomato gravy, charcoal notes.", price: 299, rating: 4.6, diet: "nonveg", img: kwImg("butter chicken", "ck-butter-chk"), bestseller: true, addons: naan },
      { id: "ck-paneer", name: "Paneer Tikka Masala", section: "Popular", desc: "Tandoori paneer in rich masala.", price: 269, rating: 4.5, diet: "veg", img: kwImg("paneer tikka masala", "ck-paneer"), bestseller: true, addons: naan },
      { id: "ck-dal", name: "Dal Makhani", section: "Main Course", desc: "Black lentils, slow-simmered overnight.", price: 199, rating: 4.4, diet: "veg", img: kwImg("dal makhani", "ck-dal") },
      { id: "ck-65", name: "Chicken 65", section: "Starters", desc: "Fiery, curry-leaf tossed.", price: 189, rating: 4.5, diet: "nonveg", img: kwImg("chicken 65", "ck-65") },
      { id: "ck-roti", name: "Tandoori Roti (2)", section: "Breads", desc: "Fresh from the tandoor.", price: 40, rating: 4.3, diet: "veg", img: kwImg("tandoori roti", "ck-roti") },
      { id: "ck-gulab", name: "Gulab Jamun (2)", section: "Desserts", desc: "Warm, syrup-soaked.", price: 80, rating: 4.6, diet: "veg", img: kwImg("gulab jamun", "ck-gulab") },
    ],
  },
  {
    id: "udupi-grand", name: "Udupi Grand Tiffins", area: "Ameerpet", city: "Hyderabad",
    cuisines: ["South Indian", "Thali"], rating: 4.6, etaMins: 26, deliveryFee: 19, distanceKm: 1.6,
    costForTwo: 300, vegOnly: true, offer: "10% OFF on Thali", img: kwImg("masala dosa", "udupi-grand", 800, 500),
    apps: ["zaikago", "mealkart", "khananow"],
    dishes: [
      { id: "ug-dosa", name: "Masala Dosa", section: "Popular", desc: "Crisp dosa, potato masala, 2 chutneys.", price: 99, rating: 4.7, diet: "veg", img: kwImg("masala dosa", "ug-dosa"), bestseller: true },
      { id: "ug-idli", name: "Idli Vada Combo", section: "Tiffins", desc: "Soft idli + crisp vada, sambar.", price: 89, rating: 4.5, diet: "veg", img: kwImg("idli vada", "ug-idli") },
      { id: "ug-thali", name: "South Indian Meals (Unlimited)", section: "Thali", desc: "Rice, sambar, rasam, curries, curd.", price: 169, rating: 4.6, diet: "veg", img: kwImg("south indian thali meals", "ug-thali"), bestseller: true },
      { id: "ug-pongal", name: "Ven Pongal", section: "Tiffins", desc: "Rice-dal, pepper, ghee, cashews.", price: 99, rating: 4.4, diet: "veg", img: kwImg("pongal", "ug-pongal") },
      { id: "ug-filter", name: "Filter Coffee", section: "Beverages", desc: "Degree coffee, steel tumbler.", price: 45, rating: 4.7, diet: "veg", img: kwImg("filter coffee", "ug-filter") },
    ],
  },
  {
    id: "mumbai-tadka", name: "Mumbai Tadka Street", area: "Kukatpally", city: "Hyderabad",
    cuisines: ["Street Food", "Chinese"], rating: 4.3, etaMins: 30, deliveryFee: 25, distanceKm: 2.3,
    costForTwo: 250, vegOnly: false, offer: "Combo: Vada Pav x2 + Chai", img: kwImg("vada pav street food", "mumbai-tadka", 800, 500),
    apps: ["zaikago", "mealkart"],
    dishes: [
      { id: "mt-vadapav", name: "Vada Pav (2)", section: "Popular", desc: "Mumbai classic, dry garlic chutney.", price: 60, rating: 4.5, diet: "veg", img: kwImg("vada pav", "mt-vadapav"), bestseller: true },
      { id: "mt-pavbhaji", name: "Pav Bhaji", section: "Popular", desc: "Buttery bhaji, toasted pav.", price: 129, rating: 4.4, diet: "veg", img: kwImg("pav bhaji", "mt-pavbhaji"), bestseller: true },
      { id: "mt-misal", name: "Misal Pav", section: "Street Food", desc: "Spicy sprouts, farsan, pav.", price: 119, rating: 4.3, diet: "veg", img: kwImg("misal pav", "mt-misal") },
      { id: "mt-noodles", name: "Hakka Noodles", section: "Chinese", desc: "Wok-tossed, desi-Chinese.", price: 149, rating: 4.2, diet: "veg", img: kwImg("hakka noodles", "mt-noodles") },
      { id: "mt-manchurian", name: "Gobi Manchurian", section: "Chinese", desc: "Crisp cauliflower, tangy sauce.", price: 159, rating: 4.3, diet: "veg", img: kwImg("gobi manchurian", "mt-manchurian") },
    ],
  },
  {
    id: "andhra-ruchulu", name: "Andhra Ruchulu", area: "Madhapur", city: "Hyderabad",
    cuisines: ["Andhra", "Biryani"], rating: 4.5, etaMins: 36, deliveryFee: 29, distanceKm: 3.0,
    costForTwo: 400, vegOnly: false, offer: "Bank offer: 10% on UPI", img: kwImg("andhra meals spicy", "andhra-ruchulu", 800, 500),
    apps: ["khananow", "mealkart"],
    dishes: [
      { id: "ar-gongura", name: "Gongura Chicken", section: "Popular", desc: "Tangy gongura, Andhra spice.", price: 279, rating: 4.6, diet: "nonveg", img: kwImg("gongura chicken curry", "ar-gongura"), bestseller: true },
      { id: "ar-meals", name: "Andhra Meals (Non-Veg)", section: "Thali", desc: "Rice, fry, curry, rasam, pappu.", price: 199, rating: 4.5, diet: "nonveg", img: kwImg("andhra meals", "ar-meals") },
      { id: "ar-pulihora", name: "Pulihora", section: "Rice", desc: "Tamarind rice, peanuts.", price: 99, rating: 4.3, diet: "veg", img: kwImg("pulihora tamarind rice", "ar-pulihora") },
      { id: "ar-pesarattu", name: "Pesarattu + Upma", section: "Tiffins", desc: "Green-gram dosa, ginger chutney.", price: 119, rating: 4.4, diet: "veg", img: kwImg("pesarattu", "ar-pesarattu") },
      { id: "ar-egg", name: "Egg Pulusu", section: "Main Course", desc: "Andhra-style tangy egg curry.", price: 149, rating: 4.3, diet: "egg", img: kwImg("egg curry", "ar-egg") },
    ],
  },
  {
    id: "sweet-house", name: "Hyderabad Sweet House", area: "Secunderabad", city: "Hyderabad",
    cuisines: ["Desserts", "Beverages"], rating: 4.6, etaMins: 22, deliveryFee: 19, distanceKm: 1.1,
    costForTwo: 200, vegOnly: true, offer: "Weekend offer: Buy 1kg get 250g free", img: kwImg("indian sweets mithai", "sweet-house", 800, 500),
    apps: ["zaikago", "khananow", "mealkart"],
    dishes: [
      { id: "sh-qubani", name: "Qubani Ka Meetha", section: "Popular", desc: "Apricot dessert, cream.", price: 120, rating: 4.7, diet: "veg", img: kwImg("qubani ka meetha", "sh-qubani"), bestseller: true },
      { id: "sh-jalebi", name: "Hot Jalebi (250g)", section: "Sweets", desc: "Crisp, syrupy, fresh.", price: 110, rating: 4.5, diet: "veg", img: kwImg("jalebi", "sh-jalebi") },
      { id: "sh-kaju", name: "Kaju Katli (250g)", section: "Sweets", desc: "Cashew fudge, silver leaf.", price: 260, rating: 4.6, diet: "veg", img: kwImg("kaju katli sweet", "sh-kaju") },
      { id: "sh-falooda", name: "Royal Falooda", section: "Beverages", desc: "Rose, vermicelli, ice cream.", price: 140, rating: 4.5, diet: "veg", img: kwImg("falooda", "sh-falooda") },
    ],
  },
];

export function foodApp(id: string) {
  return FOOD_APPS.find((a) => a.id === id);
}
export function restaurantsForApp(appId: string): Restaurant[] {
  return RESTAURANTS.filter((r) => r.apps.includes(appId));
}
export function restaurant(id: string) {
  return RESTAURANTS.find((r) => r.id === id);
}
