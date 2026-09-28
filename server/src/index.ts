import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { UPLOAD_DIR } from "./uploads/images";

import { registerAuthRoutes } from "./routes/auth";
import { registerAdminRoutes } from "./routes/admin";
import { registerDiplomaRoutes } from "./routes/diplomas";
import { registerStaffRoutes } from "./routes/staff";
import { registerGalleryRoutes } from "./routes/gallery";
import { registerContentRoutes } from "./routes/content";
import { registerCategoryRoutes } from "./routes/categories";
import { registerMessageRoutes } from "./routes/messages";

const app = express();

const allowedOrigins = [
  "https://alhaythamacademy.com",
  "https://www.alhaythamacademy.com",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) {
      return cb(null, true);
    }

    // Production
    if (process.env.NODE_ENV === "production") {
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error(`CORS blocked: ${origin}`));
    }

    // Development
    const ok =
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:\d+$/.test(origin);

    return ok
      ? cb(null, true)
      : cb(new Error(`CORS blocked: ${origin}`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_DIR),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// routes
registerAuthRoutes(app);
registerAdminRoutes(app);
registerDiplomaRoutes(app);
registerStaffRoutes(app);
registerGalleryRoutes(app);
registerContentRoutes(app);
registerCategoryRoutes(app);
registerMessageRoutes(app);

const clientDist = path.join(process.cwd(), "..", "client", "dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get("/{*splat}", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/uploads") ||
      req.path === "/health"
    ) {
      return next();
    }

    return res.sendFile(
      path.join(clientDist, "index.html"),
    );
  });
}


const port = Number(process.env.PORT || 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${port}`);
});
