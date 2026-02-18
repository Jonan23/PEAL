FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY server/package.json server/bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY server/prisma ./prisma
COPY server/src ./src
COPY server/tsconfig.json .
RUN bunx prisma generate
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .

USER bunuser

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
