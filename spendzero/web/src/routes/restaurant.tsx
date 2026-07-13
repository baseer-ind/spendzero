import { Link } from "react-router-dom";
import { BottomNav, Screen, StatusBar } from "../components/Shell";
import sakura from "../assets/rest-sakura.jpg";
import omakase from "../assets/dish-omakase.jpg";
import nigiri from "../assets/dish-nigiri.jpg";
import sushi from "../assets/food-sushi.jpg";


const DISHES = [
  { id: "1", name: "Chef's Omakase", desc: "12-course tasting", price: "₹1,840", img: omakase, trade: "4 days" },
  { id: "2", name: "Anago Nigiri", desc: "Sea eel, sweet glaze", price: "₹420", img: nigiri, trade: "1 day" },
  { id: "3", name: "Salmon Aburi Set", desc: "Torched, with yuzu", price: "₹680", img: sushi, trade: "1.5 days" },
];

function RestaurantScreen() {
  return (
    <Screen>
      <div className="relative">
        <div className="relative h-[320px] w-full overflow-hidden">
          <img
            src={sakura}
            alt="Sakura Omakase"
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        </div>
        <div className="absolute inset-x-0 top-0">
          <StatusBar />
          <div className="flex items-center justify-between px-5 pt-1">
            <Link to="/restaurants" className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s-7-4.5-7-11a4 4 0 017-2.7A4 4 0 0119 10c0 6.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-16 relative px-6 animate-rise">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">A quiet counter</p>
        <h1 className="font-display text-[32px] leading-[1.05] mt-2">Sakura Omakase</h1>
        <div className="mt-3 flex items-center gap-3 text-[12px] text-foreground/55">
          <span className="text-gold">★ 4.8</span>
          <span className="text-foreground/30">·</span>
          <span>Japanese · ₹₹₹</span>
          <span className="text-foreground/30">·</span>
          <span>32 min</span>
        </div>
      </div>

      <div className="mx-6 mt-6 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">tonight's trade</p>
        <p className="mt-2 font-display text-[18px] leading-snug text-foreground/90">
          One dinner here ≈ <span className="text-gold">3.5 days</span> of your Kyoto trip.
        </p>
        <p className="mt-2 text-[12px] text-foreground/55">
          Still hungry? Choose the smaller plate. Or close the app. Both are wins.
        </p>
      </div>

      <div className="px-6 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px]">The menu</h2>
          <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">3 items</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-6">
        {DISHES.map((d, i) => (
          <div
            key={d.id}
            className="flex gap-4 rounded-2xl border border-white/8 bg-surface p-3 animate-rise"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <img src={d.img} alt={d.name} loading="lazy" width={1024} height={1024} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <h4 className="font-display text-[16px] leading-tight">{d.name}</h4>
                <p className="mt-0.5 text-[12px] text-foreground/50">{d.desc}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gold/80">≈ {d.trade} of Kyoto</span>
                <span className="font-display text-[15px]">{d.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-8">
        <Link
          to="/cart"
          className="block w-full rounded-full bg-foreground py-4 text-center font-medium text-background"
        >
          Review cart · ₹820
        </Link>
        <Link
          to="/continue"
          className="mt-3 block text-center text-[12px] uppercase tracking-[0.22em] text-gold"
        >
          Or close the app · save ₹820 →
        </Link>
      </div>

      <BottomNav active="home" />
    </Screen>
  );
}

export default RestaurantScreen;
