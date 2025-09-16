const app = require("../server.js");

module.exports = (req, res) => {
  // Log incoming requests for debugging
  console.log("Incoming request:", req.method, req.url);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    res.status(200).end();
    return;
  }

  console.log("Forwarding to Express app");
  return app(req, res);
};
