import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import config from './config';
import "dotenv/config";
import mongoose from "mongoose";
import { clerkMiddleware, createClerkClient } from "@clerk/express";
import projectRoutes from './routes/projects.route';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: "forge-api" });
});

// Connect to MongoDB
mongoose.connect(config.mongoURI);

export const clerkClient = createClerkClient({ 
  secretKey: config.clerkSecretKey, 
  publishableKey: config.clerkPublishableKey,
});

app.use(clerkMiddleware({ clerkClient }));

// Routes
app.use('/projects', projectRoutes);


app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(401).json({ error: 'Unauthenticated!' });
});


const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
