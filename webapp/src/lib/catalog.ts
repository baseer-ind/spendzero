// Fictional marketplace catalogue — structured so UI is reusable and data can grow.
// See docs/MARKETPLACE_ECOSYSTEM.md. No real trademarks; fictional brands only.
import sakura from "@/assets/rest-sakura.jpg";
import omakase from "@/assets/dish-omakase.jpg";
import nigiri from "@/assets/dish-nigiri.jpg";
import sushi from "@/assets/food-sushi.jpg";
import burger from "@/assets/food-burger.jpg";
import grocery from "@/assets/food-grocery.jpg";

// Keyword photo (React <img> loads any host; no CORS issue). Stable per seed.
function lock(seed: string): number {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  return (h % 900) + 1;
}
export function kwImg(keyword: string, seed: string, w = 600, h = 420): string {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keyword)}?lock=${lock(seed)}`;
}

export type FoodApp = { id: string; name: string; tagline: string; accent: string; badge: string };

export const FOOD_APPS: FoodApp[] = [
  { id: "zwigato", name: "Zwigato", tagline: "Food at the speed of hunger", accent: "#E2443A", badge: "#1 in your city" },
  { id: "tomato", name: "Tomato", tagline: "Discover restaurants you'll love", accent: "#D1286B", badge: "Top rated" },
  { id: "yumrush", name: "YumRush", tagline: "Hot food, 20-min promise", accent: "#7A3FF2", badge: "Fastest" },
];

export const FOOD_CUISINES = ["Biryani", "Pizza", "Burgers", "Chinese", "South Indian", "Sushi", "Desserts", "Healthy", "Beverages"];

export type Dish = {
  id: string; name: string; section: string; desc: string; price: number; mrp?: number;
  rating: number; veg: boolean; img: string; bestseller?: boolean; addons?: { name: string; price: number }[];
};
export type Restaurant = {
  id: string; name: string; cuisines: string[]; rating: number; etaMins: number; deliveryFee: number;
  distanceKm: number; priceForTwo: number; veg: boolean; offer?: string; img: string; apps: string[]; dishes: Dish[];
};

const addonsVeg = [{ name: "Extra cheese", price: 60 }, { name: "Garlic bread", price: 90 }];
const addonsDrink = [{ name: "Coke (300ml)", price: 60 }, { name: "Fresh lime", price: 70 }];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "sakura", name: "Sakura Omakase", cuisines: ["Sushi", "Japanese"], rating: 4.8, etaMins: 34,
    deliveryFee: 49, distanceKm: 2.1, priceForTwo: 1200, veg: false, offer: "20% off up to ₹120",
    img: sakura, apps: ["zwigato", "tomato"],
    dishes: [
      { id: "sk-omakase", name: "Chef's Omakase (12 course)", section: "Popular", desc: "A guided tasting of the counter's best.", price: 1840, rating: 4.9, veg: false, img: omakase, bestseller: true },
      { id: "sk-anago", name: "Anago Nigiri", section: "Nigiri", desc: "Sea eel with a sweet tare glaze.", price: 420, rating: 4.7, veg: false, img: nigiri },
      { id: "sk-aburi", name: "Salmon Aburi Set", section: "Popular", desc: "Torched salmon, yuzu kosho.", price: 680, mrp: 760, rating: 4.8, veg: false, img: sushi, bestseller: true },
      { id: "sk-maki", name: "Avocado Cucumber Maki", section: "Rolls", desc: "Crisp, clean, vegetarian.", price: 320, rating: 4.5, veg: true, img: kwImg("sushi roll", "sk-maki") },
      { id: "sk-miso", name: "Miso Soup", section: "Sides", desc: "Dashi, tofu, wakame.", price: 140, rating: 4.4, veg: true, img: kwImg("miso soup", "sk-miso") },
      { id: "sk-matcha", name: "Matcha Cheesecake", section: "Desserts", desc: "Stone-ground matcha, light bake.", price: 260, rating: 4.6, veg: true, img: kwImg("matcha cake", "sk-matcha") },
    ],
  },
  {
    id: "biryani-house", name: "Nizam's Dum Biryani House", cuisines: ["Biryani", "South Indian"], rating: 4.5, etaMins: 38,
    deliveryFee: 29, distanceKm: 3.4, priceForTwo: 500, veg: false, offer: "Free delivery over ₹199",
    img: kwImg("biryani", "biryani-house", 800, 500), apps: ["zwigato", "yumrush", "tomato"],
    dishes: [
      { id: "bh-chk", name: "Hyderabadi Chicken Dum Biryani", section: "Popular", desc: "Long-grain basmati, sealed on the dum.", price: 289, mrp: 329, rating: 4.6, veg: false, img: kwImg("chicken biryani", "bh-chk"), bestseller: true, addons: addonsDrink },
      { id: "bh-mutton", name: "Mutton Biryani (Half)", section: "Biryani", desc: "Slow-cooked mutton on the bone.", price: 329, rating: 4.5, veg: false, img: kwImg("mutton biryani", "bh-mutton") },
      { id: "bh-veg", name: "Veg Dum Biryani", section: "Biryani", desc: "Seasonal veg, saffron rice.", price: 229, rating: 4.3, veg: true, img: kwImg("veg biryani", "bh-veg") },
      { id: "bh-65", name: "Chicken 65", section: "Starters", desc: "Fiery, curry-leaf tossed.", price: 189, rating: 4.4, veg: false, img: kwImg("chicken 65", "bh-65"), bestseller: true },
      { id: "bh-raita", name: "Boondi Raita", section: "Sides", desc: "Cooling, spiced yoghurt.", price: 60, rating: 4.2, veg: true, img: kwImg("raita", "bh-raita") },
      { id: "bh-phirni", name: "Phirni", section: "Desserts", desc: "Rose-cardamom rice pudding.", price: 110, rating: 4.5, veg: true, img: kwImg("phirni dessert", "bh-phirni") },
    ],
  },
  {
    id: "slice", name: "Slice & Co. Pizzeria", cuisines: ["Pizza", "Burgers"], rating: 4.4, etaMins: 28,
    deliveryFee: 39, distanceKm: 1.8, priceForTwo: 600, veg: false, offer: "Buy 1 Get 1 on medium pizzas",
    img: kwImg("pizza", "slice", 800, 500), apps: ["zwigato", "yumrush"],
    dishes: [
      { id: "sl-margh", name: "Margherita", section: "Popular", desc: "San Marzano, fior di latte, basil.", price: 299, rating: 4.6, veg: true, img: kwImg("margherita pizza", "sl-margh"), bestseller: true, addons: addonsVeg },
      { id: "sl-pepp", name: "Pepperoni Classic", section: "Pizza", desc: "Cured pepperoni, mozzarella.", price: 449, mrp: 499, rating: 4.7, veg: false, img: kwImg("pepperoni pizza", "sl-pepp"), addons: addonsVeg },
      { id: "sl-burg", name: "Smash Cheeseburger", section: "Burgers", desc: "Double smash, house sauce.", price: 329, rating: 4.5, veg: false, img: burger, bestseller: true },
      { id: "sl-fries", name: "Truffle Fries", section: "Sides", desc: "Parmesan, truffle oil.", price: 199, rating: 4.4, veg: true, img: kwImg("truffle fries", "sl-fries") },
      { id: "sl-coke", name: "Cold Drink", section: "Beverages", desc: "Chilled, 500ml.", price: 60, rating: 4.1, veg: true, img: kwImg("soft drink", "sl-coke") },
      { id: "sl-tira", name: "Tiramisu", section: "Desserts", desc: "Mascarpone, espresso.", price: 240, rating: 4.6, veg: true, img: kwImg("tiramisu", "sl-tira") },
    ],
  },
  {
    id: "green-bowl", name: "Green Bowl Kitchen", cuisines: ["Healthy", "Beverages"], rating: 4.6, etaMins: 24,
    deliveryFee: 25, distanceKm: 1.2, priceForTwo: 450, veg: true, offer: "Healthy week: 15% off",
    img: kwImg("salad bowl", "green-bowl", 800, 500), apps: ["tomato", "yumrush"],
    dishes: [
      { id: "gb-buddha", name: "Buddha Bowl", section: "Popular", desc: "Quinoa, chickpea, tahini.", price: 299, rating: 4.7, veg: true, img: kwImg("buddha bowl", "gb-buddha"), bestseller: true },
      { id: "gb-caesar", name: "Grilled Caesar", section: "Salads", desc: "Cos lettuce, parmesan.", price: 269, rating: 4.4, veg: true, img: kwImg("caesar salad", "gb-caesar") },
      { id: "gb-smooth", name: "Berry Protein Smoothie", section: "Beverages", desc: "Whey, berries, banana.", price: 220, rating: 4.5, veg: true, img: kwImg("smoothie", "gb-smooth") },
      { id: "gb-wrap", name: "Falafel Wrap", section: "Popular", desc: "Baked falafel, hummus.", price: 239, rating: 4.3, veg: true, img: kwImg("falafel wrap", "gb-wrap") },
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

export const GROCERY_HERO = grocery;
