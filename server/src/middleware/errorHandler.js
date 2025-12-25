import "dotenv/config";

// Global error handler for Express
// Usage: place after routes. Controllers should throw or call next(err).
export default function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === "production";
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const payload = {
    success: false,
    message,
  };

  // Optionally include structured error data
  if (err.data) {
    payload.data = err.data;
  }

  // Hide stack in production
  if (!isProd && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
