# Giai đoạn 1: Build NestJS
FROM node:20-alpine AS builder
WORKDIR /app

# Cài đặt các công cụ biên dịch cần thiết cho node-gyp (để build bcrypt)
RUN apk add --no-cache python3 make g++ gcc build-base
RUN npm install -g pnpm

# Cấu hình pnpm cài đặt dạng phẳng (node-linker=hoisted) tránh lỗi liên kết symlink trong Docker
RUN echo "node-linker=hoisted" > .npmrc

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .
# Cung cấp DATABASE_URL giả lập để vượt qua bước kiểm tra cấu hình của Prisma lúc generate
RUN DATABASE_URL=postgresql://localhost:5432/db pnpm exec prisma generate
RUN pnpm build

# Giai đoạn 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Cài đặt các công cụ biên dịch cần thiết cho việc install production dependencies
RUN apk add --no-cache python3 make g++ gcc build-base
RUN npm install -g pnpm

# Cấu hình pnpm cài đặt dạng phẳng (node-linker=hoisted) tránh lỗi liên kết symlink trong Docker
RUN echo "node-linker=hoisted" > .npmrc

# Copy package.json, pnpm-lock.yaml và prisma.config.ts từ builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Cài dependencies production và dev dependencies (cho seed)
RUN pnpm install --prod --frozen-lockfile && \
    pnpm add -D tsx && \
    apk del python3 make g++ gcc build-base

# Cung cấp DATABASE_URL giả lập để vượt qua bước kiểm tra cấu hình của Prisma lúc generate
RUN DATABASE_URL=postgresql://localhost:5432/db pnpm exec prisma generate

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Tự động đẩy schema vào DB khi container start, sau đó chạy app (lưu ý đường dẫn dist/src/main)
CMD ["sh", "-c", "pnpm exec prisma db push && node dist/src/main"]
