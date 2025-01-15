import { CONFIG } from "@/config";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import pinoPretty from "pino-pretty";

const pinoOptions = pino({ level: CONFIG.LOG_LEVEL }, CONFIG.IsProd ? undefined : pinoPretty({ colorize: true }));

export const logger = () => pinoLogger({ pino: pinoOptions });
