import { HTTP_STATUSES } from "@/constants";
import type { StatusCode } from "./types";

const HTTP_STATUSES_CODE_TO_KEY = Object.fromEntries(Object.entries(HTTP_STATUSES).map(([_key, value]) => [value.CODE, value.KEY]));

export const getStatusKeyByCode = (code: StatusCode) => HTTP_STATUSES_CODE_TO_KEY[code] || null;
