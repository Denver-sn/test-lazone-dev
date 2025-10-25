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

function tr(base: string | null | undefined, i18n: any, locale: Locale) {
  if (i18n && typeof i18n === "object" && i18n[locale]) return i18n[locale];
  return base ?? "";
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const locale = getLocale(req);
  const currency = getCurrency(req);

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "*",
      "variants.*",
      "variants.prices.*",
      "images.*",
      "categories.*",
    ],
    filters: {
      status: ["published"],
      handle: [req.params.handle],
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          currency_code: currency.toUpperCase(),
        }),
      },
    },
  });

  if (!products?.length) {
    return res.status(404).json({
      message: `Product with handle ${req.params.handle} not found`,
    });
  }

  const p = products[0];
  const md = (p.metadata as unknown as ProductMetadata) || {
    sale_mode: "both",
    rent_daily_price_minor: { eur: 0, usd: 0 },
    title_i18n: { fr: "", en: "" },
    description_i18n: { fr: "", en: "" },
  };

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

  const product: DroneProduct = {
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
  };

  return res.json(product);
}
