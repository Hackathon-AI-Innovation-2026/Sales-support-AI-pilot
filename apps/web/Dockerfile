# Giai đoạn 1: Cài đặt dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm

# Cấu hình pnpm cài đặt dạng phẳng (node-linker=hoisted) tránh lỗi liên kết symlink trong Docker
RUN echo "node-linker=hoisted" > .npmrc

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Giai đoạn 2: Build ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Khai báo các build arguments cho biến môi trường Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# Giai đoạn 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Phân quyền thư mục cache của Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy code build standalone đã được tối ưu hóa
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
