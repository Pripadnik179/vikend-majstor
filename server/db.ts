import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "MYSQL_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = mysql.createPool(connectionString);
export const db = drizzle(pool, { schema, mode: 'default' });
