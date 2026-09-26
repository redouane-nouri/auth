# syntax=docker/dockerfile:1

# Branching:
#  base -> deps -> dev
#               -> builder -> runner
#
# so in docker-compose.dev.yml we set target: dev it builds base -> deps -> dev
#
# if omited it goes to the last stage, or if mentioned like in docker-compose.prod.yml taget: runner
#
# it builds base -> deps -> builder -> runner


FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*


FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node node_modules/prisma/build/index.js generate
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]


FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_AXIOS_BASEPATH
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_AXIOS_BASEPATH=$NEXT_PUBLIC_AXIOS_BASEPATH
RUN node node_modules/prisma/build/index.js generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Standalone's pruned node_modules covers the app itself, but not the prisma CLI needed to run migrations.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh \
  && mkdir -p /app/prisma/db \
  && chown -R nextjs:nodejs /app/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
