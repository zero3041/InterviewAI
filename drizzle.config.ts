import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables
config();

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/interview_prep",
  },
});
