import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import dotenv from "dotenv";

dotenv.config();

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter:Ratelimit.slidingWindow(100,"10 s"),
});

export const authRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    prefix: "ratelimit:auth",
    limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export const loginRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    prefix: "ratelimit:login",
    limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export default ratelimit