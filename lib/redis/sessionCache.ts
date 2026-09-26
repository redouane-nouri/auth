import type { AdapterSession, AdapterUser } from "next-auth/adapters";
import redisClient from "@/lib/redis/redis-client";

const SESSION_CACHE_TTL_SECONDS = 60 * 10;

function cacheKey(sessionToken: string): string {
  return `session:${sessionToken}`;
}

type CachedSessionAndUser = { session: AdapterSession; user: AdapterUser };
/*
  What actually comes back out of JSON.parse: same shape, but the Date fields are plain strings.
*/
type SerializedCachedSessionAndUser = {
  session: Omit<AdapterSession, "expires"> & { expires: string };
  user: Omit<AdapterUser, "emailVerified"> & { emailVerified: string | null };
};
/*
  Only cache the fields AdapterUser actually declare.
*/
function toCacheableUser(user: AdapterUser): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
  };
}
/*
  returns the found cached value, or undefined to fall back to DB.
*/
export async function getCachedSessionAndUser(
  sessionToken: string,
): Promise<CachedSessionAndUser | undefined> {
  try {
    const cached = await redisClient.get(cacheKey(sessionToken));
    if (!cached) return undefined;
    /*
      dates from string to Date object.
    */
    const parsed = JSON.parse(cached) as SerializedCachedSessionAndUser;
    return {
      session: { ...parsed.session, expires: new Date(parsed.session.expires) },
      user: {
        ...parsed.user,
        emailVerified: parsed.user.emailVerified
          ? new Date(parsed.user.emailVerified)
          : null,
      },
    };
  } catch (error) {
    console.error("getCachedSessionAndUser failed", error);
    return undefined;
  }
}
/*
  Caches a the user and its session
*/
export async function setCachedSessionAndUser(
  sessionToken: string,
  value: CachedSessionAndUser,
): Promise<void> {
  try {
    await redisClient.set(
      cacheKey(sessionToken),
      JSON.stringify({
        session: value.session,
        user: toCacheableUser(value.user),
      }),
      {
        expiration: { type: "EX", value: SESSION_CACHE_TTL_SECONDS },
      },
    );
  } catch (error) {
    /*
      Not fatal, just a wasted cache miss later
    */
    console.error("setCachedSessionAndUser failed", error);
  }
}
/*
  Cleaser the cached user and its session
*/
export async function invalidateCachedSession(
  sessionToken: string,
): Promise<void> {
  try {
    await redisClient.del(cacheKey(sessionToken));
  } catch (error) {
    /*
      Will still expire on its own via its TTL
    */
    console.error("invalidateCachedSession failed", error);
  }
}
