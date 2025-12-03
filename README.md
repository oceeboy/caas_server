# Chat as a Service (CAAS)

A NestJS backend for a chat-as-a-service platform. Uses MongoDB (Mongoose), Winston logging, and class-validator/transformer so far.

## Quick start

- Install deps: `yarn`
- Dev server: `yarn start:dev`
- Run Mongo in Docker: `docker compose up -d`
- Env config: edit `.env` (PORT, HOST, MONGO_URI, etc.)

## Useful scripts

- Start Mongo: `yarn db:up`
- Logs Mongo: `yarn db:logs`
- Stop stack: `yarn db:down`

## Tech

- NestJS 11, Mongoose
- Winston logging
- DTO validation (class-validator/transformer)

## License

UNLICENSED
