const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid items data");
    }

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
            images,
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
        items: JSON.stringify(items),
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

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
