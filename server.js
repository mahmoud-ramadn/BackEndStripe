const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: [
      "https://furniro-livid.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Simple test endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running - root endpoint",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "Backend is running - test endpoint",
    timestamp: new Date().toISOString(),
  });
});

app.post("/create-checkout-session", async (req, res) => {
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

    res.json({
      message: "Checkout session created",
      success: true,
      id: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Example function for storing items in the database
async function storeItemsInDatabase(items) {
  // Save items to your database (e.g., MongoDB, PostgreSQL) and return the orderId
  const orderId = "unique-order-id"; // Replace with your actual logic
  return orderId;
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;

// Only listen when running locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
