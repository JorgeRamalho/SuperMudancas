FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS api
WORKDIR /app

COPY api/package.json ./api/
WORKDIR /app/api
RUN npm install --omit=dev

COPY api/ ./
COPY web/ /app/web/
COPY --from=client-build /app/client/dist /app/client/dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
