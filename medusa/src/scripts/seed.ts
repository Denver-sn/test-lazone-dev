import { CreateInventoryLevelInput } from "@medusajs/types";
import { ExecArgs } from "@medusajs/types/dist/common";
import { ProductStatus } from "@medusajs/types/dist/product";
import { ContainerRegistrationKeys, Modules } from "@medusajs/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const PRODUCT_STATUS = {
  DRAFT: "draft",
  PROPOSED: "proposed",
  PUBLISHED: "published",
  REJECTED: "rejected",
} as const;

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

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  // -----------------------------
  // Clean up existing inventory and products
  // -----------------------------
  logger.info("Cleaning up existing inventory and products...");

  // First clean up inventory items
  const { data: inventoryItemsToClean } = await query.graph({
    entity: "inventory_item",
    filters: {},
    fields: ["id", "sku"],
  });

  if (inventoryItemsToClean.length > 0) {
    const inventoryModuleService = container.resolve(Modules.INVENTORY);

    for (const item of inventoryItemsToClean) {
      try {
        await inventoryModuleService.deleteInventoryItems([item.id]);
        logger.info(`Deleted inventory item ${item.sku}`);
      } catch (error) {
        logger.warn(
          `Failed to delete inventory item ${item.sku}: ${error.message}`
        );
      }
    }
    logger.info(
      `Attempted to delete ${inventoryItemsToClean.length} existing inventory items.`
    );
  }

  // Then clean up products
  const { data: productsToClean } = await query.graph({
    entity: "product",
    filters: {},
    fields: ["id", "handle"],
  });

  if (productsToClean.length > 0) {
    const productModuleService = container.resolve(Modules.PRODUCT);

    for (const product of productsToClean) {
      try {
        await productModuleService.updateProducts(
          { id: { $in: [product.id] } },
          { status: PRODUCT_STATUS.DRAFT }
        );
        await productModuleService.deleteProducts([product.id]);
        logger.info(`Deleted product ${product.handle}`);
      } catch (error) {
        logger.warn(
          `Failed to delete product ${product.handle}: ${error.message}`
        );
      }
    }
    logger.info(
      `Attempted to delete ${productsToClean.length} existing products.`
    );
  }

  // -----------------------------
  // Store & Sales Channel
  // -----------------------------
  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // -----------------------------
  // Regions (EU + US) & Tax regions
  // -----------------------------
  logger.info("Seeding region data...");
  const euCountries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const regionModuleService = container.resolve(Modules.REGION);

  // Check existing regions
  const existingRegions = await regionModuleService.listRegions({
    name: { $in: ["Europe", "US"] },
  });

  let regionResult = existingRegions;

  if (!existingRegions.length) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries: euCountries,
            payment_providers: ["pp_system_default"],
          },
          {
            name: "US",
            currency_code: "usd",
            countries: ["us"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    regionResult = result;
  }

  const regionEU = regionResult.find((r) => r.name === "Europe")!;
  const regionUS = regionResult.find((r) => r.name === "US")!;

  logger.info("Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const allCountries = [...euCountries, "us"];

  // Check existing tax regions
  const existingTaxRegions = await taxModuleService.listTaxRegions({
    country_code: { $in: allCountries },
  });

  const existingCountryCodes = existingTaxRegions.map((tr) => tr.country_code);
  const newCountryCodes = allCountries.filter(
    (cc) => !existingCountryCodes.includes(cc)
  );

  if (newCountryCodes.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: newCountryCodes.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  }

  // -----------------------------
  // Stock locations (EU + US)
  // -----------------------------
  logger.info("Seeding stock location data...");
  // Check existing stock locations
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address_id"],
    filters: { name: { $in: ["European Warehouse", "US Warehouse"] } },
  });

  let stockLocationResult = existingLocations as any;

  if (!existingLocations.length) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "European Warehouse",
            address: { city: "Copenhagen", country_code: "DK", address_1: "" },
          },
          {
            name: "US Warehouse",
            address: { city: "New York", country_code: "US", address_1: "" },
          },
        ],
      },
    });
    stockLocationResult = result;
  }

  const stockLocationEU = stockLocationResult.find(
    (l) => l.name === "European Warehouse"
  )!;
  const stockLocationUS = stockLocationResult.find(
    (l) => l.name === "US Warehouse"
  )!;

  // Set EU as default location
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocationEU.id },
    },
  });

  // Link both locations to the (manual) fulfillment provider
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationEU.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationUS.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  // -----------------------------
  // Fulfillment sets (EU + US) & shipping options
  // -----------------------------
  logger.info("Seeding fulfillment data...");

  // Shipping profile (default)
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  // EU fulfillment set
  const existingEUSet = await fulfillmentModuleService.listFulfillmentSets({
    name: "European Warehouse delivery",
  });

  let fulfillmentSetEU;
  if (existingEUSet.length) {
    fulfillmentSetEU = existingEUSet[0];
    // Ensure service zones exist
    if (!fulfillmentSetEU.service_zones?.length) {
      [fulfillmentSetEU] = await fulfillmentModuleService.updateFulfillmentSets(
        [
          {
            id: fulfillmentSetEU.id,
            service_zones: [
              {
                name: "Europe",
                geo_zones: euCountries.map((cc) => ({
                  country_code: cc,
                  type: "country",
                })),
              },
            ],
          },
        ]
      );
    }
  } else {
    [fulfillmentSetEU] = await fulfillmentModuleService.createFulfillmentSets([
      {
        name: "European Warehouse delivery",
        type: "shipping",
        service_zones: [
          {
            name: "Europe",
            geo_zones: euCountries.map((cc) => ({
              country_code: cc,
              type: "country",
            })),
          },
        ],
      },
    ]);
  }

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationEU.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSetEU.id },
  });

  // US fulfillment set
  const existingUSSet = await fulfillmentModuleService.listFulfillmentSets({
    name: "US Warehouse delivery",
  });

  let fulfillmentSetUS;
  if (existingUSSet.length) {
    fulfillmentSetUS = existingUSSet[0];
    // Ensure service zones exist
    if (!fulfillmentSetUS.service_zones?.length) {
      [fulfillmentSetUS] = await fulfillmentModuleService.updateFulfillmentSets(
        [
          {
            id: fulfillmentSetUS.id,
            service_zones: [
              {
                name: "United States",
                geo_zones: [
                  {
                    country_code: "us",
                    type: "country",
                  },
                ],
              },
            ],
          },
        ]
      );
    }
  } else {
    [fulfillmentSetUS] = await fulfillmentModuleService.createFulfillmentSets([
      {
        name: "US Warehouse delivery",
        type: "shipping",
        service_zones: [
          {
            name: "United States",
            geo_zones: [
              {
                country_code: "us",
                type: "country",
              },
            ],
          },
        ],
      },
    ]);
  }

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationUS.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSetUS.id },
  });

  // Shipping options (amounts in MINOR UNITS: 1000 = 10.00)
  const shippingOptionNames = [
    "Standard EU",
    "Express EU",
    "Standard US",
    "Express US",
  ];
  const existingShippingOptions =
    await fulfillmentModuleService.listShippingOptions({
      name: { $in: shippingOptionNames },
    });

  const newShippingOptions = shippingOptionNames.filter(
    (name) => !existingShippingOptions.find((so) => so.name === name)
  );

  if (newShippingOptions.length > 0) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        // EU
        {
          name: "Standard EU",
          price_type: "flat" as const,
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSetEU.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 2-3 days.",
            code: "eu_standard",
          },
          prices: [
            { currency_code: "eur", amount: 1000 },
            { region_id: regionEU.id, amount: 1000 },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq" as any,
            },
            { attribute: "is_return", value: "false", operator: "eq" as any },
          ],
        },
        {
          name: "Express EU",
          price_type: "flat" as const,
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSetEU.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24 hours.",
            code: "eu_express",
          },
          prices: [
            { currency_code: "eur", amount: 1500 },
            { region_id: regionEU.id, amount: 1500 },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq" as any,
            },
            { attribute: "is_return", value: "false", operator: "eq" as any },
          ],
        },
        // US
        {
          name: "Standard US",
          price_type: "flat" as const,
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSetUS.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 3-5 days.",
            code: "us_standard",
          },
          prices: [
            { currency_code: "usd", amount: 1000 },
            { region_id: regionUS.id, amount: 1000 },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq" as any,
            },
            { attribute: "is_return", value: "false", operator: "eq" as any },
          ],
        },
        {
          name: "Express US",
          price_type: "flat" as const,
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSetUS.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24-48 hours.",
            code: "us_express",
          },
          prices: [
            { currency_code: "usd", amount: 1500 },
            { region_id: regionUS.id, amount: 1500 },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq" as any,
            },
            { attribute: "is_return", value: "false", operator: "eq" as any },
          ],
        },
      ].filter((option) => newShippingOptions.includes(option.name)),
    });
  }

  // Link BOTH stock locations to Sales Channel
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocationEU.id, add: [defaultSalesChannel[0].id] },
  });
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocationUS.id, add: [defaultSalesChannel[0].id] },
  });

  logger.info("Finished seeding fulfillment & stock locations.");

  // -----------------------------
  // Publishable API Key
  // -----------------------------
  logger.info("Seeding publishable API key data...");
  const apiKeyModuleService = container.resolve(Modules.API_KEY);

  // Check existing API keys
  const existingApiKeys = await apiKeyModuleService.listApiKeys({
    title: "Webshop",
  });

  let publishableApiKeyResult;
  if (existingApiKeys.length) {
    publishableApiKeyResult = existingApiKeys;
  } else {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title: "Webshop", type: "publishable", created_by: "" }],
      },
    });
    publishableApiKeyResult = result;
  }
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [defaultSalesChannel[0].id] },
  });

  logger.info("Publishable key created & linked.");

  // -----------------------------
  // Categories (incl. Drones)
  // -----------------------------
  logger.info("Seeding product categories...");
  const categoryNames = ["Drones", "Shirts", "Sweatshirts", "Pants", "Merch"];
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "is_active"],
    filters: { name: { $in: categoryNames } },
  });

  let categoryResult = existingCategories as any;

  const newCategories = categoryNames.filter(
    (name) => !existingCategories.find((cat) => cat.name === name)
  );

  if (newCategories.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: newCategories.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    categoryResult = [...existingCategories, ...result];
  }
  const dronesCategoryId = categoryResult.find((c) => c.name === "Drones")!.id;

  // -----------------------------
  // Products (2 Drones)
  // -----------------------------
  logger.info("Seeding product data (drones)...");
  const productModuleService = container.resolve(Modules.PRODUCT);
  const pricingModuleService = container.resolve(Modules.PRICING);

  const productHandles = ["drone-x-pro", "drone-air"];
  const existingProducts = await productModuleService.listProducts({
    handle: { $in: productHandles },
  });

  const newProductHandles = productHandles.filter(
    (handle) => !existingProducts.find((p) => p.handle === handle)
  );

  if (newProductHandles.length > 0) {
    // First create products with prices
    logger.info("Creating products with prices...");
    logger.info(
      `Product data: ${JSON.stringify(
        {
          products: [
            {
              title: "Drone X Pro",
              prices: [
                {
                  amount: 99900,
                  currency_code: "eur",
                },
                {
                  amount: 109900,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Drone Air",
              prices: [
                {
                  amount: 69900,
                  currency_code: "eur",
                },
                {
                  amount: 79900,
                  currency_code: "usd",
                },
              ],
            },
          ],
        },
        null,
        2
      )}`
    );

    const { result: products } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Drone X Pro",
            category_ids: [dronesCategoryId],
            description: "4K video, 3-axis gimbal",
            handle: "drone-x-pro",
            weight: 1200,
            status: PRODUCT_STATUS.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [{ url: "https://picsum.photos/seed/drone-x-pro/800/600" }],
            metadata: {
              sale_mode: "both",
              rent_daily_price_minor: { eur: 1900, usd: 2100 }, // 19.00€/j, $21.00/j
              title_i18n: { fr: "Drone X Pro", en: "Drone X Pro" },
              description_i18n: {
                fr: "Vidéo 4K, stabilisation 3 axes",
                en: "4K video, 3-axis gimbal",
              },
            },
            options: [{ title: "Model", values: ["Standard"] }],
            variants: [
              {
                title: "Standard",
                sku: "DRONEXPRO-STD",
                options: {
                  Model: "Standard",
                },
                prices: [
                  {
                    amount: 99900,
                    currency_code: "eur",
                    region_id: regionEU.id,
                  },
                  {
                    amount: 109900,
                    currency_code: "usd",
                    region_id: regionUS.id,
                  },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Drone Air",
            category_ids: [dronesCategoryId],
            description: "Lightweight 4K drone",
            handle: "drone-air",
            weight: 900,
            status: PRODUCT_STATUS.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [{ url: "https://picsum.photos/seed/drone-air/800/600" }],
            metadata: {
              sale_mode: "both",
              rent_daily_price_minor: { eur: 1500, usd: 1700 }, // 15.00€/j, $17.00/j
              title_i18n: { fr: "Drone Air", en: "Drone Air" },
              description_i18n: {
                fr: "Drone 4K ultra-léger",
                en: "Ultra-light 4K drone",
              },
            },
            options: [{ title: "Model", values: ["Standard"] }],
            variants: [
              {
                title: "Standard",
                sku: "DRONEAIR-STD",
                options: {
                  Model: "Standard",
                },
                prices: [
                  {
                    amount: 69900,
                    currency_code: "eur",
                    region_id: regionEU.id,
                  },
                  {
                    amount: 79900,
                    currency_code: "usd",
                    region_id: regionUS.id,
                  },
                ],
              },
            ],
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
        ].filter((product) => newProductHandles.includes(product.handle)),
      },
    });

    // Log created products
    logger.info(`Created products: ${JSON.stringify(products, null, 2)}`);

    // Try to get prices for each variant
    const pricingService = container.resolve(Modules.PRICING);
    for (const product of products) {
      const variant = product.variants[0];
      logger.info(`Checking prices for variant ${variant.id}...`);

      // Try to get prices in EUR
      const eurPrices = await pricingService.listPrices({
        id: [variant.id],
        currency_code: "EUR",
      });
      logger.info(`EUR prices: ${JSON.stringify(eurPrices, null, 2)}`);

      // Try to get prices in USD
      const usdPrices = await pricingService.listPrices({
        id: [variant.id],
        currency_code: "USD",
      });
      logger.info(`USD prices: ${JSON.stringify(usdPrices, null, 2)}`);
    }
  }

  // -----------------------------
  // Inventory levels (EU + US)
  // -----------------------------
  logger.info("Seeding inventory levels (EU + US)...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    // stock EU
    inventoryLevels.push({
      location_id: stockLocationEU.id,
      stocked_quantity: 1_000_000,
      inventory_item_id: inventoryItem.id,
    });
    // stock US
    inventoryLevels.push({
      location_id: stockLocationUS.id,
      stocked_quantity: 1_000_000,
      inventory_item_id: inventoryItem.id,
    });
  }

  await createInventoryLevelsWorkflow(container).run({
    input: { inventory_levels: inventoryLevels },
  });

  logger.info("✅ Finished seeding all data.");
}
