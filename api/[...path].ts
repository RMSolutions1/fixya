import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

let cachedApp: Express | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedApp) {
    const { createApp } = await import('../apps/api/dist/apps/api/src/create-app.js');
    cachedApp = await createApp();
  }

  return new Promise<void>((resolve, reject) => {
    cachedApp!(req, res, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
