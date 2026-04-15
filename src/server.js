const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("./docs/openapi");
require("dotenv").config();

// Initialize Express App
const app = express();
app.use(express.json());

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",            // Local dev
  "https://pjsa-ui.vercel.app"        // Production frontend (Vercel)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true // If you're using cookies/auth headers
  })
);

// Connect to MongoDB
connectDB();

// OpenAPI / Swagger UI
app.get("/pjsa/openapi.json", (req, res) => res.json(openapiSpec));
app.use("/pjsa/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Routes — modular architecture
const modules = require("./modules/index");
app.use("/pjsa", modules);

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to PKPA API 1.0");
});

// Central error handler (must be last)
const errorHandler = require("./middlewares/error.middleware");
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 7143;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
