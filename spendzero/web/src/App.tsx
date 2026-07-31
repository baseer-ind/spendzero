import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/index";
import Future from "./routes/future";
import Journey from "./routes/journey";
import Profile from "./routes/profile";
import Cart from "./routes/cart";
import Continue from "./routes/continue";
import Order from "./routes/order";
import Restaurant from "./routes/restaurant";
import Restaurants from "./routes/restaurants";
import Privacy from "./routes/privacy";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/future" element={<Future />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/continue" element={<Continue />} />
        <Route path="/order" element={<Order />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
