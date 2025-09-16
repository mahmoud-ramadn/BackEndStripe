const dotenv = require("dotenv");
dotenv.config();

module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigins = [
    "https://furniro-livid.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    message: "Debug endpoint is working",
    stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyLength: process.env.STRIPE_SECRET_KEY
      ? process.env.STRIPE_SECRET_KEY.length
      : 0,
    timestamp: new Date().toISOString(),
  });
};
