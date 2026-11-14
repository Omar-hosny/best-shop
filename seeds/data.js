// Fixture data for `seeds/seed.js`. Nothing here talks to the database — the
// runner resolves the category names to ids and writes the documents.
//
// Keep every value inside the schema bounds in `models/Product.model.js`:
//   name        2–50 characters
//   description 10–200 characters (optional, but present on every fixture here)
//   price       >= 0
//   quantity    whole number >= 0
//
// Image URLs are derived from the product name in the runner, so a fixture only
// needs a name, price, quantity, description, and category.

export const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Sports & Outdoors",
  "Beauty",
  "Toys & Games",
  "Groceries",
];

// 60 products — enough to exercise pagination (default limit 20 → 3 pages,
// max limit 50 → 2 pages) and page-past-the-end responses.
//
// Testing notes:
//   - `quantity: 0` marks out-of-stock items (8 of them) for `?inStock=false`
//     and for the cart/checkout stock errors.
//   - `Mindful Mornings` has `quantity: 1` so a second unit fails the order
//     transaction and stock rolls back.
//   - Prices run from 7.99 to 329.99, and names are deliberately spread across
//     the alphabet, so every `sort` option produces a visibly different order.
//   - "wireless", "organic", "cotton", "stainless", and "steel" appear in
//     several names/descriptions → good `?q=` searches.
export const products = [
  // ── Electronics (8) ──────────────────────────────────────────────────────
  {
    name: "Wireless Noise-Cancelling Headphones",
    price: 129.99,
    quantity: 25,
    description:
      "Over-ear headphones with active noise cancelling and 30-hour battery life.",
    category: "Electronics",
  },
  {
    name: "Bluetooth Portable Speaker",
    price: 59.99,
    quantity: 40,
    description:
      "Compact waterproof speaker with rich bass for outdoor listening.",
    category: "Electronics",
  },
  {
    name: "4K Action Camera",
    price: 249.0,
    quantity: 12,
    description:
      "Rugged action camera that records stable 4K video up to 60 fps.",
    category: "Electronics",
  },
  {
    name: "Mechanical Gaming Keyboard",
    price: 89.5,
    quantity: 18,
    description:
      "Tenkeyless mechanical keyboard with hot-swappable switches and RGB lighting.",
    category: "Electronics",
  },
  {
    name: "Wireless Ergonomic Mouse",
    price: 24.99,
    quantity: 60,
    description:
      "Rechargeable mouse with a sculpted shape and adjustable DPI settings.",
    category: "Electronics",
  },
  {
    name: "USB-C Fast Charger 65W",
    price: 34.99,
    quantity: 75,
    description:
      "GaN wall charger that powers laptops, tablets, and phones from one port.",
    category: "Electronics",
  },
  {
    name: "Smart Fitness Watch",
    price: 149.99,
    quantity: 0,
    description:
      "Tracks heart rate, sleep, and workouts with a bright always-on display.",
    category: "Electronics",
  },
  {
    name: "27-Inch LED Monitor",
    price: 329.99,
    quantity: 9,
    description:
      "QHD monitor with slim bezels, a 75 Hz refresh rate, and height adjustment.",
    category: "Electronics",
  },

  // ── Clothing (8) ─────────────────────────────────────────────────────────
  {
    name: "Organic Cotton T-Shirt",
    price: 19.99,
    quantity: 80,
    description:
      "Soft organic cotton tee with a relaxed fit and reinforced neckline.",
    category: "Clothing",
  },
  {
    name: "Slim-Fit Denim Jeans",
    price: 49.99,
    quantity: 35,
    description:
      "Stretch denim jeans with a slim leg and classic five-pocket styling.",
    category: "Clothing",
  },
  {
    name: "Waterproof Rain Jacket",
    price: 89.0,
    quantity: 15,
    description:
      "Lightweight shell with taped seams and an adjustable hood.",
    category: "Clothing",
  },
  {
    name: "Merino Wool Beanie",
    price: 22.5,
    quantity: 50,
    description:
      "Warm merino beanie that stays comfortable through long winter walks.",
    category: "Clothing",
  },
  {
    name: "Classic White Sneakers",
    price: 64.99,
    quantity: 28,
    description:
      "Minimal leather sneakers with a cushioned insole for all-day wear.",
    category: "Clothing",
  },
  {
    name: "Linen Summer Shirt",
    price: 39.99,
    quantity: 0,
    description:
      "Breathable linen shirt with a camp collar and mother-of-pearl buttons.",
    category: "Clothing",
  },
  {
    name: "Fleece Zip Hoodie",
    price: 54.99,
    quantity: 42,
    description:
      "Brushed fleece hoodie with a full zip and two side pockets.",
    category: "Clothing",
  },
  {
    name: "Leather Belt",
    price: 29.99,
    quantity: 33,
    description: "Full-grain leather belt with a brushed metal buckle.",
    category: "Clothing",
  },

  // ── Home & Kitchen (7) ───────────────────────────────────────────────────
  {
    name: "Stainless Steel Chef Knife",
    price: 42.0,
    quantity: 20,
    description:
      "Balanced eight-inch chef knife forged from high-carbon stainless steel.",
    category: "Home & Kitchen",
  },
  {
    name: "Cast Iron Skillet 12-Inch",
    price: 38.5,
    quantity: 25,
    description:
      "Pre-seasoned cast iron skillet for searing, baking, and campfire cooking.",
    category: "Home & Kitchen",
  },
  {
    name: "Ceramic Pour-Over Coffee Set",
    price: 34.99,
    quantity: 18,
    description:
      "Hand-glazed dripper and carafe set for a clean, slow-brewed cup.",
    category: "Home & Kitchen",
  },
  {
    name: "Bamboo Cutting Board",
    price: 24.0,
    quantity: 45,
    description:
      "Reversible bamboo board with a juice groove and easy-grip handles.",
    category: "Home & Kitchen",
  },
  {
    name: "Vacuum Insulated Water Bottle",
    price: 27.99,
    quantity: 70,
    description:
      "Double-wall stainless steel bottle that keeps drinks cold for 24 hours.",
    category: "Home & Kitchen",
  },
  {
    name: "Cotton Bath Towel Set",
    price: 44.99,
    quantity: 30,
    description:
      "Four plush cotton towels that stay soft after repeated washing.",
    category: "Home & Kitchen",
  },
  {
    name: "Adjustable LED Desk Lamp",
    price: 39.99,
    quantity: 0,
    description:
      "Dimmable desk lamp with warm and cool light modes and a USB port.",
    category: "Home & Kitchen",
  },

  // ── Books (8) ────────────────────────────────────────────────────────────
  {
    name: "The Silent Orchard",
    price: 14.99,
    quantity: 40,
    description:
      "A quiet family saga set across three generations of apple growers.",
    category: "Books",
  },
  {
    name: "Atlas of Forgotten Places",
    price: 32.0,
    quantity: 22,
    description:
      "Illustrated guide to abandoned towns, ruins, and lost landmarks.",
    category: "Books",
  },
  {
    name: "Learning JavaScript the Practical Way",
    price: 39.99,
    quantity: 35,
    description:
      "Hands-on introduction to JavaScript with a small project in every chapter.",
    category: "Books",
  },
  {
    name: "A Short History of Everything Small",
    price: 18.5,
    quantity: 0,
    description:
      "Essays on microbes, molecules, and the tiny things that shape our world.",
    category: "Books",
  },
  {
    name: "The Art of Simple Cooking",
    price: 26.0,
    quantity: 28,
    description:
      "Weeknight recipes built on pantry staples and minimal equipment.",
    category: "Books",
  },
  {
    name: "Midnight on Maple Street",
    price: 12.99,
    quantity: 55,
    description:
      "A small-town mystery that unfolds over one long summer night.",
    category: "Books",
  },
  {
    name: "The Complete Guide to Home Gardening",
    price: 29.95,
    quantity: 17,
    description:
      "Practical advice for growing vegetables, herbs, and flowers in small spaces.",
    category: "Books",
  },
  {
    name: "Mindful Mornings",
    price: 16.99,
    quantity: 1,
    description:
      "Daily prompts and breathing exercises for a calmer start to the day.",
    category: "Books",
  },

  // ── Sports & Outdoors (7) ────────────────────────────────────────────────
  {
    name: "Non-Slip Yoga Mat",
    price: 29.99,
    quantity: 38,
    description:
      "Six-millimetre mat with a textured grip surface and a carry strap.",
    category: "Sports & Outdoors",
  },
  {
    name: "Adjustable Dumbbell Set",
    price: 199.0,
    quantity: 8,
    description:
      "Pair of dial-adjustable dumbbells ranging from five to fifty pounds.",
    category: "Sports & Outdoors",
  },
  {
    name: "Trail Running Backpack 20L",
    price: 79.99,
    quantity: 14,
    description:
      "Ventilated running pack with a hydration sleeve and secure pockets.",
    category: "Sports & Outdoors",
  },
  {
    name: "Insulated Camping Mug",
    price: 21.99,
    quantity: 50,
    description:
      "Stainless steel mug that keeps coffee hot through a cold morning hike.",
    category: "Sports & Outdoors",
  },
  {
    name: "Carbon Fibre Trekking Poles",
    price: 89.99,
    quantity: 0,
    description:
      "Collapsible poles with cork grips and adjustable wrist straps.",
    category: "Sports & Outdoors",
  },
  {
    name: "Resistance Band Set",
    price: 24.99,
    quantity: 65,
    description:
      "Five latex bands with handles, ankle straps, and a door anchor.",
    category: "Sports & Outdoors",
  },
  {
    name: "Two-Person Camping Tent",
    price: 159.0,
    quantity: 11,
    description:
      "Freestanding three-season tent with two doors and a full rainfly.",
    category: "Sports & Outdoors",
  },

  // ── Beauty (8) ───────────────────────────────────────────────────────────
  {
    name: "Hydrating Face Serum",
    price: 34.99,
    quantity: 40,
    description:
      "Lightweight serum with hyaluronic acid for all-day hydration.",
    category: "Beauty",
  },
  {
    name: "Shea Butter Body Lotion",
    price: 18.5,
    quantity: 60,
    description:
      "Rich daily lotion that absorbs quickly and softens dry skin.",
    category: "Beauty",
  },
  {
    name: "Charcoal Clay Mask",
    price: 22.0,
    quantity: 33,
    description:
      "Detoxifying clay mask with activated charcoal and green tea.",
    category: "Beauty",
  },
  {
    name: "Bamboo Toothbrush Set",
    price: 12.99,
    quantity: 90,
    description:
      "Four biodegradable bamboo toothbrushes with soft bristles.",
    category: "Beauty",
  },
  {
    name: "Rosehip Facial Oil",
    price: 27.5,
    quantity: 25,
    description:
      "Cold-pressed rosehip oil that helps even skin tone overnight.",
    category: "Beauty",
  },
  {
    name: "Mineral Sunscreen SPF 50",
    price: 24.99,
    quantity: 0,
    description:
      "Reef-safe mineral sunscreen with a clear, non-greasy finish.",
    category: "Beauty",
  },
  {
    name: "Lavender Essential Oil",
    price: 15.99,
    quantity: 70,
    description:
      "Steam-distilled lavender oil for diffusers and evening routines.",
    category: "Beauty",
  },
  {
    name: "Silk Sleep Mask",
    price: 19.0,
    quantity: 44,
    description:
      "Mulberry silk mask with an adjustable strap and a cooling feel.",
    category: "Beauty",
  },

  // ── Toys & Games (7) ─────────────────────────────────────────────────────
  {
    name: "Wooden Building Blocks Set",
    price: 39.99,
    quantity: 30,
    description:
      "Fifty sanded maple blocks in shapes that stack and balance.",
    category: "Toys & Games",
  },
  {
    name: "1000-Piece Landscape Puzzle",
    price: 24.99,
    quantity: 45,
    description:
      "Detailed mountain landscape puzzle that ships with a poster guide.",
    category: "Toys & Games",
  },
  {
    name: "Remote Control Racing Car",
    price: 54.99,
    quantity: 20,
    description:
      "Rechargeable off-road car with proportional steering and rubber tyres.",
    category: "Toys & Games",
  },
  {
    name: "Plush Highland Cow Toy",
    price: 21.5,
    quantity: 55,
    description:
      "Super-soft plush cow with floppy ears and embroidered eyes.",
    category: "Toys & Games",
  },
  {
    name: "Junior Chess Set",
    price: 29.0,
    quantity: 18,
    description:
      "Wooden chess set with a folding board and a beginner strategy guide.",
    category: "Toys & Games",
  },
  {
    name: "Magnetic Tile Building Kit",
    price: 64.99,
    quantity: 0,
    description:
      "Sixty magnetic tiles for open-ended towers, castles, and shapes.",
    category: "Toys & Games",
  },
  {
    name: "Family Board Game Night Pack",
    price: 44.0,
    quantity: 26,
    description:
      "Three quick party games bundled for two to eight players.",
    category: "Toys & Games",
  },

  // ── Groceries (7) ────────────────────────────────────────────────────────
  {
    name: "Organic Green Tea",
    price: 12.99,
    quantity: 80,
    description:
      "Loose-leaf green tea from organic gardens, packed in a resealable tin.",
    category: "Groceries",
  },
  {
    name: "Single-Origin Coffee Beans",
    price: 19.99,
    quantity: 65,
    description:
      "Medium-roast whole beans with notes of cocoa and dried fruit.",
    category: "Groceries",
  },
  {
    name: "Extra Virgin Olive Oil",
    price: 24.5,
    quantity: 40,
    description:
      "Cold-pressed olive oil for dressings, dipping, and finishing.",
    category: "Groceries",
  },
  {
    name: "Raw Wildflower Honey",
    price: 16.0,
    quantity: 52,
    description:
      "Unfiltered honey collected from mixed wildflower meadows.",
    category: "Groceries",
  },
  {
    name: "Wholegrain Pasta Trio",
    price: 9.99,
    quantity: 100,
    description:
      "Three shapes of bronze-cut wholegrain pasta in one box.",
    category: "Groceries",
  },
  {
    name: "Organic Almond Butter",
    price: 14.5,
    quantity: 35,
    description:
      "Smooth almond butter made from roasted organic almonds only.",
    category: "Groceries",
  },
  {
    name: "Sea Salt Dark Chocolate",
    price: 7.99,
    quantity: 0,
    description:
      "Seventy percent dark chocolate finished with flaky sea salt.",
    category: "Groceries",
  },
];

// Demo accounts. Created with `User.create()`, so the model's pre-save hook
// hashes the password — never insert these documents directly.
// The runner only creates a user when the email is missing, so rerunning the
// seed never resets a password you changed.
export const users = [
  {
    name: "Shop Admin",
    email: "admin@best-shop.dev",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Demo Customer",
    email: "user@best-shop.dev",
    password: "User1234!",
    role: "user",
  },
];
