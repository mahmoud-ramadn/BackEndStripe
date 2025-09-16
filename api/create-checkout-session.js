const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function storeItemsInDatabase(items) {
  const orderId = "unique-order-id";
  return orderId;
}

module.exports = async (req, res) => {
  const allowedOrigins = [
    "https://furniro-livid.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  const origin = req.headers.origin || "";
  res.setHeader("Vary", "Origin");

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid items data");
    }

    const orderId = await storeItemsInDatabase(items);

    const lineItems = items.map((item) => {
      const { name, discountedPrice, quantity, images } = item;

      if (!name || !discountedPrice || !quantity || !images) {
        throw new Error("Missing item properties");
      }

      return {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(discountedPrice * 100),
          product_data: {
            name,
            images: [images[0]],
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:
        "https://furniro-livid.vercel.app/Success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://furniro-livid.vercel.app/cancel",
      metadata: { orderId },
    });

    res.status(200).json({
      message: "Checkout session created",
      success: true,
      id: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: error.message });
  }
};
