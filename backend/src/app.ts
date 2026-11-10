import cors from "cors";
import express from "express";
import { z } from "zod";
import { loadCatalogue } from "./lib/catalogue.js";
import { optimize } from "./lib/optimizer.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_request, response) => response.json({ ok: true }));
  app.get("/api/catalogue", async (_request, response, next) => {
    try { response.json(await loadCatalogue()); } catch (error) { next(error); }
  });
  app.post("/api/optimize", async (request, response, next) => {
    try {
      const body = z.object({ items: z.array(z.object({ text: z.string().min(1) })).min(1), budget: z.number().nonnegative().optional(), excludedBrands: z.array(z.string()).optional() }).parse(request.body);
      const catalogue = await loadCatalogue();
      response.json(optimize(body, catalogue.listings, catalogue.stores, catalogue.snapshotDate));
    } catch (error) { next(error); }
  });
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Request failed";
    response.status(400).json({ error: message });
  });
  return app;
}