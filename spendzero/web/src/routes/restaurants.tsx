import { Link } from "react-router-dom";
import { BottomNav, NavBar, Screen, StatusBar } from "../components/Shell";
import sakura from "../assets/rest-sakura.jpg";
import omakase from "../assets/dish-omakase.jpg";
import sushi from "../assets/food-sushi.jpg";


type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  img: string;
  rating: string;
  time: string;
  price: string;
  trade: string;
};

const LIST: Restaurant[] = [
  {
    id: "sakura",
    name: "Sakura Omakase",
    cuisine: "Japanese · Omakase counter",
    img: sakura,
    rating: "4.8",
    time: "32 min",
    price: "₹1,240",
    trade: "≈ 3 days of Kyoto",
  },
  {
    id: "nobu",
    name: "Kintsugi Sushi Bar",
    cuisine: "Sushi · Nigiri & rolls",
    img: omakase,
    rating: "4.7",
    time: "28 min",
    price: "₹820",
    trade: "≈ 2 days of Kyoto",
  },
  {
    id: "ramen",
    name: "Tonkotsu House",
    cuisine: "Ramen · Late night",
    img: sushi,
    rating: "4.6",
    time: "24 min",
    price: "₹540",
    trade: "≈ 1 day of Kyoto",
  },
];

function RestaurantsScreen() {
  return (
    <Screen>
      <StatusBar />
      <NavBar title="Sushi · Nearby" back="/order" />

      <div className="px-6 pt-2 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Still here</p>
        <h1 className="font-display text-[34px] leading-[1.05] text-balance mt-2">
          Three rooms.
          <br />
          <span className="text-shimmer-gold">One decision.</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/55">
          Each plate has a price tag in days. Days from Kyoto.
        </p>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto px-6 pb-2">
        {["Nearby", "Omakase", "Ramen", "Vegetarian", "Late night"].map((c, i) => (
          <span
            key={c}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] ${
              i === 0
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-white/10 bg-white/5 text-foreground/60"
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-5 px-6">
        {LIST.map((r, i) => (
          <Link
            to="/restaurant"
            key={r.id}
            className="group relative overflow-hidden rounded-3xl border border-white/8 bg-surface animate-rise"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={r.img}
                alt={r.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] backdrop-blur">
                <span className="text-gold">★</span>
                <span>{r.rating}</span>
                <span className="mx-1 text-foreground/40">·</span>
                <span className="text-foreground/70">{r.time}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[20px] leading-tight">{r.name}</h3>
                  <p className="mt-1 text-[12px] text-foreground/50">{r.cuisine}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-[18px] text-foreground/85">{r.price}</div>
                  <div className="text-[10px] uppercase tracking-wider text-foreground/40">avg</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] uppercase tracking-[0.22em] text-gold/70">
                  trade · {r.trade}
                </span>
                <span className="text-gold text-sm">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-6 mt-8 rounded-2xl border border-white/8 bg-surface/50 p-5 text-center">
        <p className="font-display text-[16px] italic leading-snug text-foreground/75">
          "The thing you crave is rarely the thing you need."
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-gold"
        >
          Skip · go home <span>↗</span>
        </Link>
      </div>

      <BottomNav active="home" />
    </Screen>
  );
}

export default RestaurantsScreen;
