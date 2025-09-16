module.exports = async (req, res) => {
  res.status(200).json({ 
    message: "Test endpoint is working",
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
};