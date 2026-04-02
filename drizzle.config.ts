import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables
config();

export default defineConfig({
  schema: "./apps/api/src/database/schema.ts",
  out: "./apps/api/src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/interview_prep",
  },
});
