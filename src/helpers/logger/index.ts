import { Config } from "@/config";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import pinoPretty from "pino-pretty";

const pinoOptions = pino({ level: Config.LOG_LEVEL }, Config.IsProd ? undefined : pinoPretty({ colorize: true }));

export const logger = () => pinoLogger({ pino: pinoOptions });
