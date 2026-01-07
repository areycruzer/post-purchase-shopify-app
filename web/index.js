// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import connectDB from "./db.js";
import Shop from "./models/Shop.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Connect to MongoDB
connectDB();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res, next) => {
    // Capture Install logic
    try {
      const shopDomain = req.query.shop;
      if (shopDomain) {
        await Shop.findOneAndUpdate(
          { shopDomain },
          {
            shopDomain,
            installedAt: new Date()
          },
          { upsert: true, headers: { upsert: true } }
        );
        console.log(`Updated registration for shop: ${shopDomain}`);
      }
    } catch (error) {
      console.error(`Error saving shop install info: ${error.message}`);
    }
    next();
  },
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// --- API Routes for Post-Purchase App ---

app.get("/api/message", async (_req, res) => {
  try {
    const session = res.locals.shopify.session;
    const shop = await Shop.findOne({ shopDomain: session.shop });
    res.status(200).send({ message: shop?.postPurchaseMessage || "" });
  } catch (error) {
    console.error(`Error fetching message: ${error.message}`);
    res.status(500).send({ error: "Failed to fetch message" });
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { message } = req.body;

    // Save to DB
    await Shop.findOneAndUpdate(
      { shopDomain: session.shop },
      { postPurchaseMessage: message },
      { upsert: true }
    );

    // Save to Shop Metafield
    // We use the REST resource to save the metafield on the Shop resource.
    const metafield = new shopify.api.rest.Metafield({ session: session });
    metafield.namespace = "post_purchase";
    metafield.key = "message";
    metafield.value = message;
    metafield.type = "single_line_text_field";
    await metafield.save({ update: true });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(`Error saving message: ${error.message}`);
    res.status(500).send({ error: "Failed to save message" });
  }
});

// ----------------------------------------

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
