import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import redisClient from "@/lib/redis/redis-client";
import {
  CREDENTIALS_SIGN_IN_EMAIL_RATE_LIMITER_KEY_PREFIX,
  CREDENTIALS_SIGN_IN_IP_RATE_LIMITER_KEY_PREFIX,
  EMAIL_SIGN_IN_EMAIL_RATE_LIMITER_KEY_PREFIX,
  EMAIL_SIGN_IN_IP_RATE_LIMITER_KEY_PREFIX,
  FIFTEEN_MINUTES_IN_SECONDS,
  FORGOT_PASSWORD_EMAIL_RATE_LIMITER_KEY_PREFIX,
  FORGOT_PASSWORD_IP_RATE_LIMITER_KEY_PREFIX,
  GENEROUS_POINTS,
  MODERATE_POINTS,
  ONE_HOUR_IN_SECONDS,
  RESET_PASSWORD_IP_RATE_LIMITER_KEY_PREFIX,
  SIGNUP_EMAIL_RATE_LIMITER_KEY_PREFIX,
  SIGNUP_IP_RATE_LIMITER_KEY_PREFIX,
  STRICT_POINTS,
} from "@/utils/constants";
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
  keyPrefix: FORGOT_PASSWORD_IP_RATE_LIMITER_KEY_PREFIX,
  points: MODERATE_POINTS,
  duration: FIFTEEN_MINUTES_IN_SECONDS,
});
/*
  Limits forgot password requests per email address, on top of the IP limiter.
*/
export const forgotPasswordEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: FORGOT_PASSWORD_EMAIL_RATE_LIMITER_KEY_PREFIX,
  points: STRICT_POINTS,
  duration: ONE_HOUR_IN_SECONDS,
});
/*
  Limits credentials sign-in attempts per IP address.
*/
export const credentialsSignInIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: CREDENTIALS_SIGN_IN_IP_RATE_LIMITER_KEY_PREFIX,
  points: GENEROUS_POINTS,
  duration: FIFTEEN_MINUTES_IN_SECONDS,
});
/*
  Limits credentials sign-in attempts per email address, on top of the IP limiter.
*/
export const credentialsSignInEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: CREDENTIALS_SIGN_IN_EMAIL_RATE_LIMITER_KEY_PREFIX,
  points: MODERATE_POINTS,
  duration: FIFTEEN_MINUTES_IN_SECONDS,
});
/*
  Limits magic link sign-in emails per IP address.
*/
export const emailSignInIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: EMAIL_SIGN_IN_IP_RATE_LIMITER_KEY_PREFIX,
  points: MODERATE_POINTS,
  duration: FIFTEEN_MINUTES_IN_SECONDS,
});
/*
  Limits magic link sign-in emails per email address, on top of the IP limiter.
*/
export const emailSignInEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: EMAIL_SIGN_IN_EMAIL_RATE_LIMITER_KEY_PREFIX,
  points: STRICT_POINTS,
  duration: ONE_HOUR_IN_SECONDS,
});
/*
  Limits signup requests per IP address.
*/
export const signupIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: SIGNUP_IP_RATE_LIMITER_KEY_PREFIX,
  points: GENEROUS_POINTS,
  duration: FIFTEEN_MINUTES_IN_SECONDS,
});
/*
  Limits signup requests per email address, on top of the IP limiter.
*/
export const signupEmailRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: SIGNUP_EMAIL_RATE_LIMITER_KEY_PREFIX,
  points: STRICT_POINTS,
  duration: ONE_HOUR_IN_SECONDS,
});
/*
  Limits reset password requests per IP address.
*/
export const resetPasswordIpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  useRedisPackage: true,
  keyPrefix: RESET_PASSWORD_IP_RATE_LIMITER_KEY_PREFIX,
  points: GENEROUS_POINTS,
  duration: FIFTEEN_MINUTES_IN_SECONDS,
});
