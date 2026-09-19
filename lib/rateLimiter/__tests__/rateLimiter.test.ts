import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
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
import {
  credentialsSignInEmailRateLimiter,
  credentialsSignInIpRateLimiter,
  emailSignInEmailRateLimiter,
  emailSignInIpRateLimiter,
  forgotPasswordEmailRateLimiter,
  forgotPasswordIpRateLimiter,
  isRateLimited,
  resetPasswordIpRateLimiter,
  signupEmailRateLimiter,
  signupIpRateLimiter,
} from "../rateLimiter";
/*
  Mocking the redis client so constructing the real RateLimiterRedis instances below doesn't try to
  open a real connection.
*/
function mockRedisClientModule() {
  return {};
}
jest.mock("../../redis/redis-client", mockRedisClientModule);
/*
  A minimal stand-in for RateLimiterRedis
*/
const createFakeLimiter = () =>
  ({ consume: jest.fn() }) as unknown as RateLimiterRedis;

describe("isRateLimited", () => {
  /*
    A key that hasn't exhausted its points should not be rate limited.
  */
  it("Should return false when the limiter has points left", async () => {
    const limiter = createFakeLimiter();
    (limiter.consume as jest.Mock).mockResolvedValueOnce({});
    /*
      Act
    */
    const result = await isRateLimited(limiter, "some-key");
    /*
      Assert
    */
    expect(result).toBe(false);
    expect(limiter.consume).toHaveBeenCalledWith("some-key");
  });
  /*
    A key that has exhausted its points should be rate limited.
  */
  it("Should return true when the limiter rejects with a RateLimiterRes", async () => {
    const limiter = createFakeLimiter();
    (limiter.consume as jest.Mock).mockRejectedValueOnce(new RateLimiterRes());
    /*
      Act
    */
    const result = await isRateLimited(limiter, "some-key");
    /*
      Assert
    */
    expect(result).toBe(true);
  });
  /*
    Any other failure (e.g. Redis being down) should fail open rather than block the request.
  */
  it("Should return false (fail open) when the limiter rejects with an unexpected error", async () => {
    const limiter = createFakeLimiter();
    (limiter.consume as jest.Mock).mockRejectedValueOnce(
      new Error("Redis is down"),
    );
    /*
      Act
    */
    const result = await isRateLimited(limiter, "some-key");
    /*
      Assert
    */
    expect(result).toBe(false);
  });
});

describe("rate limiter configuration", () => {
  /*
    Guards against accidentally loosening/tightening a limit
  */
  it.each([
    [
      "forgotPasswordIpRateLimiter",
      forgotPasswordIpRateLimiter,
      {
        keyPrefix: FORGOT_PASSWORD_IP_RATE_LIMITER_KEY_PREFIX,
        points: MODERATE_POINTS,
        duration: FIFTEEN_MINUTES_IN_SECONDS,
      },
    ],
    [
      "forgotPasswordEmailRateLimiter",
      forgotPasswordEmailRateLimiter,
      {
        keyPrefix: FORGOT_PASSWORD_EMAIL_RATE_LIMITER_KEY_PREFIX,
        points: STRICT_POINTS,
        duration: ONE_HOUR_IN_SECONDS,
      },
    ],
    [
      "credentialsSignInIpRateLimiter",
      credentialsSignInIpRateLimiter,
      {
        keyPrefix: CREDENTIALS_SIGN_IN_IP_RATE_LIMITER_KEY_PREFIX,
        points: GENEROUS_POINTS,
        duration: FIFTEEN_MINUTES_IN_SECONDS,
      },
    ],
    [
      "credentialsSignInEmailRateLimiter",
      credentialsSignInEmailRateLimiter,
      {
        keyPrefix: CREDENTIALS_SIGN_IN_EMAIL_RATE_LIMITER_KEY_PREFIX,
        points: MODERATE_POINTS,
        duration: FIFTEEN_MINUTES_IN_SECONDS,
      },
    ],
    [
      "emailSignInIpRateLimiter",
      emailSignInIpRateLimiter,
      {
        keyPrefix: EMAIL_SIGN_IN_IP_RATE_LIMITER_KEY_PREFIX,
        points: MODERATE_POINTS,
        duration: FIFTEEN_MINUTES_IN_SECONDS,
      },
    ],
    [
      "emailSignInEmailRateLimiter",
      emailSignInEmailRateLimiter,
      {
        keyPrefix: EMAIL_SIGN_IN_EMAIL_RATE_LIMITER_KEY_PREFIX,
        points: STRICT_POINTS,
        duration: ONE_HOUR_IN_SECONDS,
      },
    ],
    [
      "signupIpRateLimiter",
      signupIpRateLimiter,
      {
        keyPrefix: SIGNUP_IP_RATE_LIMITER_KEY_PREFIX,
        points: GENEROUS_POINTS,
        duration: FIFTEEN_MINUTES_IN_SECONDS,
      },
    ],
    [
      "signupEmailRateLimiter",
      signupEmailRateLimiter,
      {
        keyPrefix: SIGNUP_EMAIL_RATE_LIMITER_KEY_PREFIX,
        points: STRICT_POINTS,
        duration: ONE_HOUR_IN_SECONDS,
      },
    ],
    [
      "resetPasswordIpRateLimiter",
      resetPasswordIpRateLimiter,
      {
        keyPrefix: RESET_PASSWORD_IP_RATE_LIMITER_KEY_PREFIX,
        points: GENEROUS_POINTS,
        duration: FIFTEEN_MINUTES_IN_SECONDS,
      },
    ],
  ])("Should configure %s correctly", (_name, limiter, expected) => {
    expect(limiter.keyPrefix).toBe(expected.keyPrefix);
    expect(limiter.points).toBe(expected.points);
    expect(limiter.duration).toBe(expected.duration);
  });
  /*
    Every per-email limiter should be stricter than its corresponding per-IP limiter.
  */
  it.each([
    [
      "forgotPassword",
      forgotPasswordIpRateLimiter,
      forgotPasswordEmailRateLimiter,
    ],
    [
      "credentialsSignIn",
      credentialsSignInIpRateLimiter,
      credentialsSignInEmailRateLimiter,
    ],
    ["emailSignIn", emailSignInIpRateLimiter, emailSignInEmailRateLimiter],
    ["signup", signupIpRateLimiter, signupEmailRateLimiter],
  ])(
    "Should make the %s email limiter stricter than its IP limiter",
    (_name, ipLimiter, emailLimiter) => {
      expect(emailLimiter.points).toBeLessThanOrEqual(ipLimiter.points);
      expect(emailLimiter.duration).toBeGreaterThanOrEqual(ipLimiter.duration);
    },
  );
});
