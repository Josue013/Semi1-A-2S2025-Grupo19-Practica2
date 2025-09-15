const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/database");
require("dotenv").config();

const app = express();

// MIDDLEWARES
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-frontend-domain.com",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// RUTAS
app.use("/api/auth", require("./routes/auth"));

// RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Plataforma de Recetas funcionando correctamente",
    version: "2.0.0",
    description: "API simplificada para autenticación de usuarios",
    endpoints: {
      auth: {
        base: "/api/auth",
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        test: "GET /api/auth/test",
      },
    },
    note: "Sin JWT - Login/Register directo con respuesta de datos de usuario",
    database: "Conectado a MySQL",
    timestamp: new Date().toISOString(),
  });
});

// RUTA DE SALUD
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// MANEJO DE ERRORES MEJORADO
app.use((err, req, res, next) => {
  console.error("❌ Error en la aplicación:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// RUTA NO ENCONTRADA
app.use("*", (req, res) => {
  console.log("❌ Ruta no encontrada:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      root: "GET /",
      health: "GET /health",
      auth: "POST /api/auth/login, POST /api/auth/register",
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 ================================================");
  console.log(`🚀 Servidor de Recetas corriendo en puerto ${PORT}`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log("🚀 API para autenticación sin JWT");
  console.log("🚀 Endpoints disponibles:");
  console.log("🚀   - GET / (info de la API)");
  console.log("🚀   - GET /health (estado del servidor)");
  console.log("🚀   - POST /api/auth/register (registro)");
  console.log("🚀   - POST /api/auth/login (login)");
  console.log("🚀   - GET /api/auth/test (prueba auth)");
  console.log("🚀 ================================================");

  // Probar conexión a base de datos
  testConnection();
});
