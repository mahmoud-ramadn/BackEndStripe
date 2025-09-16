const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Example function for storing items in the database
async function storeItemsInDatabase(items) {
  // Save items to your database (e.g., MongoDB, PostgreSQL) and return the orderId
  const orderId = "unique-order-id"; // Replace with your actual logic
  return orderId;
}

module.exports = async (req, res) => {
  // Set CORS headers for all requests
  const allowedOrigins = [
    "https://furniro-livid.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // For preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    res.status(200).end();
    return;
  }

  // Set headers for actual requests
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid items data");
    }

    // Store the items in the database and get an order ID
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
            images: [images[0]], // Send only one image
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
      metadata: {
        orderId, // Save only the orderId reference instead of full item data
      },
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
