import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import redisClient from "@/lib/redis/redis-client";
/*
  Consumes a point from the given rate limiter for the given key and returns whether the request should be blocked.
  Any failure other than the limit actually being exceeded (e.g. Redis being down) fails open, so a Redis outage doesn't take down the endpoint using it entirely.
*/
export async function isRateLimited(
  limiter: RateLimiterRedis,
  key: string,
): Promise<boolean> {
  try {
    await limiter.consume(key);
    return false;
  } catch (rejection) {
    return rejection instanceof RateLimiterRes;
  }
}
/*
  Limits forgot password requests per IP address.
*/
export const forgotPasswordIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "forgotPasswordIp",
  points: 5,
  duration: 15 * 60,
});
/*
  Limits forgot password requests per email address, on top of the IP limiter.
*/
export const forgotPasswordEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "forgotPasswordEmail",
  points: 3,
  duration: 60 * 60,
});
/*
  Limits credentials sign-in attempts per IP address.
*/
export const credentialsSignInIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "credentialsSignInIp",
  points: 10,
  duration: 15 * 60,
});
/*
  Limits credentials sign-in attempts per email address, on top of the IP limiter.
*/
export const credentialsSignInEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "credentialsSignInEmail",
  points: 5,
  duration: 15 * 60,
});
/*
  Limits magic link sign-in emails per IP address.
*/
export const emailSignInIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "emailSignInIp",
  points: 5,
  duration: 15 * 60,
});
/*
  Limits magic link sign-in emails per email address, on top of the IP limiter.
*/
export const emailSignInEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "emailSignInEmail",
  points: 3,
  duration: 60 * 60,
});
/*
  Limits signup requests per IP address.
*/
export const signupIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "signupIp",
  points: 10,
  duration: 15 * 60,
});
/*
  Limits signup requests per email address, on top of the IP limiter.
*/
export const signupEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "signupEmail",
  points: 3,
  duration: 60 * 60,
});
/*
  Limits reset password requests per IP address.
*/
export const resetPasswordIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: "resetPasswordIp",
  points: 10,
  duration: 15 * 60,
});
