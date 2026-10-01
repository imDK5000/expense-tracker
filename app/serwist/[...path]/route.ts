import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import type { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

// A stable revision to help Serwist version the precache manifest
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

const serwistRoute = createSerwistRoute({
  swSrc: "app/sw.ts",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  useNativeEsbuild: true,
});

// Next.js 16 catch-all routes expect path to be string[]
// but @serwist/turbopack generates entries with path as string.
// We wrap generateStaticParams to convert to array form.
export async function generateStaticParams() {
  const entries = await serwistRoute.generateStaticParams();
  return entries.map((entry: { path: string | string[] }) => ({
    path: Array.isArray(entry.path) ? entry.path : [entry.path],
  }));
}

// Wrap GET with correct Next.js 16 types
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<Response | NextResponse<unknown>> {
  // Join the path array back to a string for Serwist's route handler
  const rawParams = await context.params;
  const pathStr = Array.isArray(rawParams.path) ? rawParams.path.join("/") : rawParams.path;
  const patchedContext = { params: Promise.resolve({ path: pathStr }) };
  return serwistRoute.GET(request as Request, patchedContext as unknown as Parameters<typeof serwistRoute.GET>[1]);
}
