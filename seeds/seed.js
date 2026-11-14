// Seeds categories, products, and two demo accounts.
//
//   pnpm seed          # upsert fixtures (safe to rerun, never duplicates)
//   pnpm seed:fresh    # wipe Products + Categories, then seed from scratch
//
// Reuses `lib/connectDB.js` on purpose: it installs the DNS resolver workaround
// that `mongodb+srv://` needs on this machine. A script that calls
// `mongoose.connect()` directly fails with `querySrv ECONNREFUSED`.
//
// Notes:
//   - `--fresh` deletes *all* products and categories, not only the fixtures.
//     Users, carts, and orders are left alone (orders keep their item snapshots).
//   - Demo users are created with `User.create()` so the pre-save hook hashes the
//     password. An existing email is never modified, so a rerun cannot reset it.
//   - `timestamps: false` on the product upsert is what allows the staggered
//     `createdAt` values to survive, so `sort=oldest` / `sort=newest` differ.

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../lib/connectDB.js";
import Category from "../models/Category.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";
import { categories, products, users } from "./data.js";

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: node seeds/seed.js [--fresh]

  (no flags)  Upsert the fixture categories, products, and demo users.
  --fresh     Delete all Products and Categories first, then seed.
  --help      Show this message.`);
  process.exit(0);
}

const FRESH = args.has("--fresh");

// Spread `createdAt` one day apart so the newest-first default sort has a real
// order instead of 60 documents created in the same second.
const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_CREATED_AT = Date.UTC(2026, 0, 1, 12);

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Deterministic, reachable placeholder images. `picsum.photos` is fine for dev
// and every URL passes the `isURL()` check in the product validator.
const buildImages = (name) => {
  const seed = slugify(name);
  return [
    `https://picsum.photos/seed/${seed}/600/600`,
    `https://picsum.photos/seed/${seed}-detail/600/600`,
  ];
};

const seedCategories = async () => {
  const existing = new Set(
    (
      await Category.find({ name: { $in: categories } }).select("name").lean()
    ).map((category) => category.name),
  );

  const categoryMap = new Map();

  for (const name of categories) {
    const category = await Category.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    categoryMap.set(name, category._id);
  }

  return {
    categoryMap,
    created: categories.filter((name) => !existing.has(name)).length,
    updated: categories.filter((name) => existing.has(name)).length,
  };
};

const seedProducts = async (categoryMap) => {
  const existing = new Set(
    (
      await Product.find({ name: { $in: products.map((p) => p.name) } })
        .select("name")
        .lean()
    ).map((product) => product.name),
  );

  for (const [index, item] of products.entries()) {
    const category = categoryMap.get(item.category);

    // Guard against a typo in data.js instead of writing a dangling reference.
    if (!category) {
      throw new Error(
        `Product "${item.name}" references unknown category "${item.category}"`,
      );
    }

    if (item.description.length < 10 || item.description.length > 200) {
      throw new Error(
        `Description for "${item.name}" must be between 10 and 200 characters`,
      );
    }

    await Product.findOneAndUpdate(
      { name: item.name },
      {
        $set: {
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          category,
          images: buildImages(item.name),
          updatedAt: new Date(),
        },
        // Only on insert: a rerun must not reshuffle the sort order.
        $setOnInsert: {
          createdAt: new Date(BASE_CREATED_AT + index * DAY_MS),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        // Required for the explicit createdAt above — otherwise Mongoose
        // overwrites it with the current time on every write.
        timestamps: false,
        setDefaultsOnInsert: true,
      },
    );
  }

  return {
    created: products.filter((item) => !existing.has(item.name)).length,
    updated: products.filter((item) => existing.has(item.name)).length,
  };
};

const seedUsers = async () => {
  const results = [];

  for (const user of users) {
    const existing = await User.findOne({ email: user.email });

    if (existing) {
      results.push({ ...user, created: false, storedRole: existing.role });
      continue;
    }

    // `User.create()` (not insertMany) so the pre-save hook hashes the password.
    const created = await User.create(user);
    results.push({ ...user, created: true, storedRole: created.role });
  }

  return results;
};

const main = async () => {
  dotenv.config();

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set. Add it to .env (see the project README) before seeding.",
    );
  }

  await connectDB();

  if (FRESH) {
    // Products first: they reference categories.
    const deletedProducts = await Product.deleteMany({});
    const deletedCategories = await Category.deleteMany({});
    console.log(
      `Cleared ${deletedProducts.deletedCount} products and ${deletedCategories.deletedCount} categories`,
    );
  }

  const {
    categoryMap,
    created: categoriesCreated,
    updated: categoriesUpdated,
  } = await seedCategories();

  const { created: productsCreated, updated: productsUpdated } =
    await seedProducts(categoryMap);

  const userResults = await seedUsers();

  console.log("\nSeed complete");
  console.log(
    `  Categories  ${categoriesCreated} created, ${categoriesUpdated} already existed (${categories.length} fixtures)`,
  );
  console.log(
    `  Products    ${productsCreated} created, ${productsUpdated} updated (${products.length} fixtures)`,
  );

  for (const result of userResults) {
    console.log(
      `  User        ${result.email} (${result.storedRole}) ${
        result.created ? "created" : "already existed — left unchanged"
      }`,
    );

    if (result.storedRole !== result.role) {
      console.warn(
        `              warning: fixture expects role "${result.role}" — update it in Atlas/Compass if needed`,
      );
    }
  }

  console.log("\nCategory ids");
  for (const [name, id] of categoryMap) {
    console.log(`  ${name.padEnd(20)} ${id}`);
  }

  console.log(
    "\nLogin with admin@best-shop.dev / Admin123! or user@best-shop.dev / User1234!",
  );
};

try {
  await main();
} catch (error) {
  console.error(`\nSeed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
