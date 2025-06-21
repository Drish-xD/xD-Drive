import { pinoLogger } from "hono-pino";
import pino from "pino";
import pinoPretty from "pino-pretty";
import { CONFIG } from "@/config";

const pinoOptions = pino({ level: CONFIG.LOG_LEVEL }, CONFIG.IsProd ? undefined : pinoPretty({ colorize: true }));

export const logger = () => pinoLogger({ pino: pinoOptions });
