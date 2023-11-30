FROM node:lts as runner
WORKDIR /csat-vidaesol
ENV NODE_ENV production
ARG COMMIT_ID
ENV COMMIT_ID=${COMMIT_ID}
COPY . .
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "run", "prod"]
#CMD ["node", "index.js"]