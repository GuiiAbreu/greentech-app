import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { meRoutes } from "./me.routes.js";
import { productsRoutes } from "./products.routes.js";
import { catalogRoutes } from "./catalog.routes.js";
import { certificationsRoutes } from "./certifications.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/me", meRoutes);
routes.use("/products", productsRoutes);
routes.use("/catalog", catalogRoutes);
routes.use("/certifications", certificationsRoutes);
