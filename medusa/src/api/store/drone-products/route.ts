import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  Modules,
  QueryContext,
} from "@medusajs/framework/utils";
import type {
  ProductTypes,
  ProductDTO,
  ProductVariantDTO,
  MoneyAmountDTO,
  ProductImageDTO,
} from "@medusajs/types";
import type { PricingTypes } from "@medusajs/types";

type Locale = "fr" | "en";
type Currency = "eur" | "usd";
type SaleMode = "sale" | "rent" | "both";

interface ProductI18n {
  fr: string;
  en: string;
}

interface RentPrices {
  eur: number;
  usd: number;
}

interface ProductMetadata {
  sale_mode: SaleMode;
  rent_daily_price_minor: RentPrices;
  title_i18n: ProductI18n;
  description_i18n: ProductI18n;
}

interface ExtendedProductVariantDTO extends ProductVariantDTO {
  calculated_price?: number;
  prices?: {
    currency_code: string;
    amount: number;
  }[];
}

interface DroneProduct {
  id: string;
  handle: string;
  sale_mode: SaleMode;
  title: string;
  description: string;
  thumbnail: string | null;
  images: string[];
  sale_price_minor: number | null;
  rent_daily_price_minor: number | null;
  weight: number;
  category_id: string;
}

function getLocale(req: MedusaRequest): Locale {
  const v = String(req.query.locale || "fr").toLowerCase();
  return (v === "en" ? "en" : "fr") as Locale;
}

function getCurrency(req: MedusaRequest): Currency {
  const v = String(req.query.currency || "eur").toLowerCase();
  return (v === "usd" ? "usd" : "eur") as Currency;
}

function getPagination(req: MedusaRequest) {
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(req.query.limit || 20), 10))
  );
  const offset = Math.max(0, parseInt(String(req.query.offset || 0), 10));
  return { limit, offset };
}

function tr(base: string | null | undefined, i18n: any, locale: Locale) {
  if (i18n && typeof i18n === "object" && i18n[locale]) return i18n[locale];
  return base ?? "";
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const locale = getLocale(req);
  const currency = getCurrency(req);
  const { limit, offset } = getPagination(req);
  const saleModeFilter = req.query.sale_mode as SaleMode | undefined;
  const q = (req.query.q as string | undefined)?.toLowerCase()?.trim();

  // Services v2
  const productService = req.scope.resolve(
    Modules.PRODUCT
  ) as ProductTypes.IProductModuleService;
  const priceService = req.scope.resolve(
    Modules.PRICING
  ) as PricingTypes.IPricingModuleService;
  const regionService = req.scope.resolve(Modules.REGION) as any;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Récupérer les régions
  const regions = await regionService.listRegions();
  const regionEU = regions.find((r: any) => r.name === "Europe");
  const regionUS = regions.find((r: any) => r.name === "US");

  // On récupère les produits publiés avec leurs prix calculés
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "*",
      "variants.*",
      "variants.calculated_price.*",
      "images.*",
      "categories.*",
      "variants.prices.*",
    ],
    filters: {
      status: ["published"],
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          currency_code: currency.toUpperCase(),
          region_id: currency === "usd" ? regionUS.id : regionEU.id,
        }),
      },
    },
  });

  console.log("products", JSON.stringify(products, null, 2));

  // Map + filtres (sale_mode, q) côté serveur
  const out: DroneProduct[] = [];
  for (const p of products) {
    const md = (p.metadata as unknown as ProductMetadata) || {
      sale_mode: "both",
      rent_daily_price_minor: { eur: 0, usd: 0 },
      title_i18n: { fr: "", en: "" },
      description_i18n: { fr: "", en: "" },
    };

    // Filtre sale_mode si demandé
    if (saleModeFilter && (md.sale_mode ?? "both") !== saleModeFilter) continue;

    // Recherche simple q (dans title, description et i18n)
    if (q) {
      const t = (p.title || "").toLowerCase();
      const d = (p.description || "").toLowerCase();
      const ti = JSON.stringify(md.title_i18n || {}).toLowerCase();
      const di = JSON.stringify(md.description_i18n || {}).toLowerCase();
      if (![t, d, ti, di].some((s) => s.includes(q))) continue;
    }

    // Prix de vente via le premier variant du produit
    const variant = (p.variants || [])[0] as ExtendedProductVariantDTO;
    let sale_price_minor: number | null = null;
    if (variant?.prices) {
      const price = variant.prices.find(
        (p: any) => p.currency_code?.toLowerCase() === currency.toLowerCase()
      );
      if (price?.amount) {
        sale_price_minor = Number(price.amount);
      }
    }

    const rent_daily_price_minor: number | null =
      Number(md?.rent_daily_price_minor?.[currency] ?? null) || null;

    out.push({
      id: p.id,
      handle: p.handle,
      sale_mode: md.sale_mode ?? "both",
      title: tr(p.title, md.title_i18n, locale),
      description: tr(p.description, md.description_i18n, locale),
      thumbnail: p.thumbnail,
      images: (p.images || []).map((img: any) => img.url),
      sale_price_minor,
      rent_daily_price_minor,
      weight: Number(p.weight) || 0,
      category_id: p.categories?.[0]?.id ?? "",
    });
  }

  res.json({
    locale,
    currency,
    count: out.length,
    limit,
    offset,
    // info brute côté source si jamais tu veux la vraie pagination DB
    source_total: products.length,
    products: out,
  });
}
