/**
 * Seed FP (Featured Products) with more items.
 * These are used by featured_promo and productloop (for CounterHomePage ids/seller/combinationId/attributes).
 * Seeds are sourced from j2b SingleProduct IDs so FP.id matches real products.
 *
 * Run from backend folder:
 *   node seed-data/seed-fp.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import FP from "../models/FP.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const MONGODB_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/j2b";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SINGLEPRODUCTS_JSON_PATH = path.resolve(__dirname, "../../docs/j2b.singleproducts.json");

const NAMEENG_ENUM = new Set(["color", "storage", "connection", "size", "panel", "ram", "other"]);

function toFpAttribute(opt) {
  const nameEngRaw = opt?.type != null ? String(opt.type).toLowerCase().trim() : "other";
  const nameEng = NAMEENG_ENUM.has(nameEngRaw) ? nameEngRaw : "other";
  const value = opt?.label != null && String(opt.label).trim() !== "" ? String(opt.label) : String(opt?.value ?? "");
  const maybeHex = typeof opt?.value === "string" ? opt.value.trim() : "";
  const colorCode = nameEng === "color" && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(maybeHex) ? maybeHex : undefined;

  return {
    name: String(opt?.attribute_name ?? "سایر"),
    nameEng,
    value: value || "-",
    ...(colorCode ? { colorCode } : {}),
  };
}

function pickSelectedCombination(product) {
  const combos = Array.isArray(product?.combinations) ? product.combinations : [];
  return combos.find((c) => c?.selected) || combos[0] || null;
}

function pickSelectedSupplier(combo) {
  const suppliers = Array.isArray(combo?.suppliers) ? combo.suppliers : [];
  return suppliers.find((s) => s?.selected) || suppliers[0] || null;
}

function mapSingleProductToFp(product) {
  const id = String(product?.id ?? "").trim();
  if (!id) return null;

  const combo = pickSelectedCombination(product);
  const supplier = pickSelectedSupplier(combo);

  const title = String(product?.general?.title ?? "").trim() || id;
  const slug = id;
  const image = Array.isArray(product?.general?.images) ? product.general.images[0] : undefined;

  const regularPrice = supplier?.price?.regularPrice;
  const discountedPrice = supplier?.price?.discountedPrice;
  const discountPercent = supplier?.price?.discountPercent;

  const combinationId = combo?.id;
  const sellerId = supplier?.id;
  const sellerLabel = supplier?.name || supplier?.shortName || "دیجیکالا";

  const rawOptions = Array.isArray(combo?.options) ? combo.options : [];
  const attributes = rawOptions.length > 0 ? rawOptions.map(toFpAttribute) : [{ name: "سایر", nameEng: "other", value: "-" }];

  if (typeof combinationId !== "number" || typeof sellerId !== "number") return null;
  if (typeof regularPrice !== "number") return null;

  return {
    id,
    combinationId,
    title,
    slug,
    regularPrice,
    discountedPrice: typeof discountedPrice === "number" ? discountedPrice : undefined,
    discountPercent: discountPercent == null ? undefined : String(discountPercent),
    seller: { id: sellerId, label: String(sellerLabel) },
    image: image || "/static/image/placeholder.webp",
    attributes,
  };
}

async function seedFp() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await FP.deleteMany({});
    console.log("   - Cleared existing FP documents");

    const raw = fs.readFileSync(SINGLEPRODUCTS_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];

    const mapped = list
      .map(mapSingleProductToFp)
      .filter(Boolean);

    // keep first N to avoid huge inserts by default
    const items = mapped.slice(0, 300);

    if (items.length === 0) {
      throw new Error(`No seedable products found in ${SINGLEPRODUCTS_JSON_PATH}`);
    }

    await FP.insertMany(items, { ordered: false });
    console.log(`✅ Seed completed. Inserted FP items: ${items.length}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedFp();

