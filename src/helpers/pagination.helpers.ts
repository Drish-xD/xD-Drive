import { db } from "@/db";
import { z } from "@hono/zod-openapi";
import type { Operators, OrderByOperators, SQL, TableRelationalConfig } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

/**
 * Create a schema that can be used as seach query parameter.
 */
const stringParse = <T extends z.ZodTypeAny>(schema: T) =>
	z.union([
		schema,
		z
			.string()
			.transform((str) => {
				try {
					return JSON.parse(str);
				} catch {
					throw new Error("Invalid JSON string");
				}
			})
			.pipe(schema),
	]);

const orderBySchema = z
	.object({
		id: z.string(),
		desc: z.boolean(),
	})
	.array()
	.default([])
	.openapi({ description: "Sorting order of the items", example: [{ id: "createdAt", desc: true }] });

const filtersSchema = z
	.object({
		id: z.string(),
		value: z.string(),
	})
	.array()
	.default([])
	.openapi({ description: "Filters applied to the items", example: [{ id: "column", value: "value" }] });

/**
 * Create a schema that can be used as seach query parameter.
 */
export const createPaginationQuery = () => {
	return z
		.object({
			page: z.coerce.number().min(1).default(1).openapi({
				description: "Page number",
				example: 1,
			}),
			limit: z
				.union([z.coerce.number().min(1).max(100), z.literal(-1)])
				.default(10)
				.openapi({
					description: "Items per page (-1 for all items)",
					example: 10,
				}),
			offset: z.coerce.number().min(0).default(0).openapi({
				description: "Offset for the items (overrides page-based offset if provided)",
				example: 0,
			}),
			order: stringParse(orderBySchema),
			filters: stringParse(filtersSchema),
			includeTotal: z
				.enum(["true", "false"])
				.transform((x) => x === "true")
				.pipe(z.boolean())
				.default("false")
				.openapi({ description: "Include total count in the response", example: "false" }),
		})
		.superRefine((data) => {
			if (data.limit === -1) {
				data.page = 1;
				data.offset = 0;
			} else {
				if (!data.offset) {
					data.offset = (Number(data.page) - 1) * Number(data.limit);
				} else {
					data.page = Math.floor(data.offset / Number(data.limit)) + 1;
				}
			}

			return data;
		});
};

const metadataSchema = z.object({
	currentPage: z.coerce.number().min(1).default(1).openapi({ description: "Current page number", example: 1 }),
	itemsPerPage: z.coerce.number().min(1).max(200).default(10).openapi({ description: "Number of items per page", example: 10 }),
	startIndex: z.coerce.number().min(0).openapi({ description: "Starting index for the items", example: 0 }),
	totalCount: z.coerce.number().min(0).optional().openapi({ description: "Total number of items in the collection", example: 10 }),
	pageCount: z.coerce.number().min(1).optional().openapi({ description: "Total number of pages in the collection", example: 1 }),
	sortOrder: orderBySchema,
	appliedFilters: filtersSchema,
});

/**
 * Create a schema for pagination response.
 */
export const createPaginationResponse = <T extends z.AnyZodObject>(dataSchema: T) => {
	return z.object({
		meta: metadataSchema.openapi({ description: "meta data related to the pagination" }),
		data: dataSchema.array().openapi({ description: "Array of requested items", example: [] }),
	});
};

/**
 * Create a query builder to find total count for pagination
 */
export const totalCountQueryBuilder = async <T extends TableConfig>(table: PgTableWithColumns<T>, includeTotal: boolean, filters?: SQL<unknown>) =>
	includeTotal ? await db.$count(table, filters) : undefined;

/**
 * Create a order by clause for SQL query
 */
export const orderByQueryBuilder =
	(_orderBy: z.infer<typeof orderBySchema> = []) =>
	<T extends TableRelationalConfig>(fields: T["columns"], operators: OrderByOperators, defaultOrder: keyof T["columns"] = "createdAt") => {
		if (!_orderBy.length) {
			const defaultOrderByField = fields?.[defaultOrder];
			if (!defaultOrderByField) return [];
			return [operators.asc(defaultOrderByField)];
		}

		return _orderBy.map((item) => (item.desc ? operators.desc(fields[item.id]) : operators.asc(fields[item.id])));
	};

/**
 * Create where clause using filters for SQL query
 */
export const whereQueryBuilder =
	<T extends TableConfig>(_filters: z.infer<typeof filtersSchema> = []) =>
	(table: PgTableWithColumns<T>, operators: Operators) => {
		return [];
	};
