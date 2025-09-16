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

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    message: "CORS test successful",
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};
