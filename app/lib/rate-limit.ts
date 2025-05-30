// lib/rate-limit.ts
import { NextRequest } from 'next/server';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Use the service name from KubeSphere
const redis = new Redis(process.env.REDIS_URL || 'redis://redis-2hj6im:6379');

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  reset?: number;
}

export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  // Your existing rate limit code...
  const identifier =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    `anon-${uuidv4()}`; 

  const key = `rate-limit:${identifier}`;
  const maxRequests = 100;
  const windowMs = 15 * 60 * 1000;

  try {
    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.expire(key, windowMs / 1000);
    }

    if (requests > maxRequests) {
      return { success: false };
    }

    const ttl = await redis.ttl(key);
    return {
      success: true,
      remaining: maxRequests - requests,
      reset: Math.floor(Date.now() / 1000) + ttl,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { success: true }; // Fail open if Redis is unavailable
  }
}