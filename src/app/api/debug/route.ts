import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "NOT SET";
  return NextResponse.json({
    DATABASE_URL_prefix: url.substring(0, 30) + "...",
    DATABASE_URL_length: url.length,
    starts_with_postgresql: url.startsWith("postgresql://"),
    starts_with_postgres: url.startsWith("postgres://"),
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });
}
