import 'reflect-metadata';
import { createRequire } from 'node:module';
import type { Express } from 'express';
import type { Test } from 'supertest';
import request from 'supertest';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const routeRequire = createRequire(import.meta.url);

let cachedApp: Express | null = null;

async function getApp(): Promise<Express> {
  if (!cachedApp) {
    const mod = routeRequire('@fixya/api-runtime') as {
      createApp?: () => Promise<Express>;
    };

    if (typeof mod.createApp !== 'function') {
      throw new Error(
        `createApp inválido en bundle (keys=${Object.keys(mod).join(',')})`,
      );
    }

    cachedApp = await mod.createApp();
  }
  return cachedApp;
}

async function handle(req: NextRequest) {
  try {
    const app = await getApp();
    const url = new URL(req.url);
    const path = url.pathname + url.search;
    const method = req.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

    let agent: Test = request(app)[method](path);

    req.headers.forEach((value, key) => {
      agent = agent.set(key, value);
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) {
        agent = agent.send(body);
      }
    }

    const res = await agent;

    const headers = new Headers();
    for (const [key, value] of Object.entries(res.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, String(v)));
      } else {
        headers.set(key, String(value));
      }
    }

    return new NextResponse(res.text || null, {
      status: res.status,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('API bridge error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
