import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection URL from environment
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/interview_prep";

// Create postgres connection
export const client = postgres(DATABASE_URL);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
