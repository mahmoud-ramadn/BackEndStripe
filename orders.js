const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe(
  "sk_test_51Qi1ltG1Yc7r0GlRy4wffT3q8HacStcDOdwZBxH8QeMmUbryGNwWvV3KUSAWBS1K4FHzURZE00pn6Yu93YUhCRvc00e7abqOLU"
);

app.use(cors());
app.use(express.json());

// Mock data (orders)
const orders = [
  {
    id: 1,
    title: "Product 1",
    description: "Description of product 1",
    price: "$20",
    count: 2,
  },
  {
    id: 2,
    title: "Product 2",
    description: "Description of product 2",
    price: "$15",
    count: 1,
  },
  // More mock orders can go here
];

// GET /orders endpoint to fetch all orders
app.get("/orders", (req, res) => {
  try {
    res.json(orders); // Send all orders as JSON
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /orders/:id endpoint to fetch a specific order by its id
app.get("/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id); // Fetch id from the URL

  const order = orders.find((order) => order.id === orderId); // Find the order by id

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(order); // Send the specific order data as JSON
});

// POST /create-checkout-session endpoint for Stripe checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send("Invalid items data");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => {
        const description = item.description
          ? item.description
          : "Default product description"; // Default description if none provided

        return {
          price_data: {
            currency: "usd", // Set currency
            product_data: {
              name: item.title,
              images:item.images[0]
            },
            unit_amount: parseInt(item.price.replace("$", "") * 100), // Convert to cents
          },
          quantity: item.count,
        };
      }),
      mode: "payment",
      success_url: `http://localhost:5173/Success`,
      cancel_url: `http://localhost:5173/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
