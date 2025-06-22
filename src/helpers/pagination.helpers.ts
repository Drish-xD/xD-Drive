import { and, type OrderByOperators, type SQL, type TableRelationalConfig } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { type inferType, z } from "@/db/lib";
import type { WhereBuilderConfig } from "./types";

/**
 * Create a schema that can be used as seach query parameter.
 */
const stringParse = <T extends z.ZodType>(schema: T) =>
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

export const orderBySchema = z
	.object({
		desc: z.boolean(),
		id: z.string(),
	})
	.array()
	.default([])
	.meta({ description: "Sorting order of the items", example: [{ desc: true, id: "createdAt" }] });

const filtersSchema = z
	.object({
		id: z.string(),
		value: z.string(),
	})
	.array()
	.default([])
	.meta({ description: "Filters applied to the items", example: [{ id: "column", value: "value" }] });

type TFilter = inferType<typeof filtersSchema>[number];

const metadataSchema = z.object({
	appliedFilters: filtersSchema,
	currentPage: z.coerce.number().min(1).default(1).meta({ description: "Current page number", example: 1 }),
	itemsPerPage: z.coerce.number().min(1).max(200).default(10).meta({ description: "Number of items per page", example: 10 }),
	pageCount: z.coerce.number().min(1).optional().meta({ description: "Total number of pages in the collection", example: 1 }),
	sortOrder: orderBySchema,
	startIndex: z.coerce.number().min(0).meta({ description: "Starting index for the items", example: 0 }),
	totalCount: z.coerce.number().min(0).optional().meta({ description: "Total number of items in the collection", example: 10 }),
});

/**
 * Create a schema that can be used as seach query parameter.
 */
export const createPaginationQuery = () => {
	return z
		.object({
			filters: stringParse(filtersSchema),
			includeTotal: z
				.enum(["true", "false"])
				.transform((x) => x === "true")
				.pipe(z.boolean())
				.default(false)
				.meta({ description: "Include total count in the response", example: "false" }),
			limit: z
				.union([z.coerce.number().min(1).max(100), z.literal(-1)])
				.default(10)
				.meta({
					description: "Items per page (-1 for all items)",
					example: 10,
				}),
			offset: z.coerce.number().min(0).default(0).meta({
				description: "Offset for the items (overrides page-based offset if provided)",
				example: 0,
			}),
			order: stringParse(orderBySchema),
			page: z.coerce.number().min(1).default(1).meta({
				description: "Page number",
				example: 1,
			}),
		})
		.transform((_, ctx) => {
			if (ctx.value.limit === -1) {
				ctx.value.page = 1;
				ctx.value.offset = 0;
			} else {
				if (!ctx.value.offset) {
					ctx.value.offset = (Number(ctx.value.page) - 1) * Number(ctx.value.limit);
				} else {
					ctx.value.page = Math.floor(ctx.value.offset / Number(ctx.value.limit)) + 1;
				}
			}

			return ctx.value;
		});
};

/**
 * Create a schema for pagination response.
 */
export const createPaginationResponse = <T extends z.ZodObject>(dataSchema: T) => {
	return z.object({
		data: dataSchema.array().meta({ description: "Array of requested items" }),
		meta: metadataSchema.meta({ description: "meta data related to the pagination" }),
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
export const whereQueryBuilder = (filters: TFilter[], config: WhereBuilderConfig, defaultWhere?: SQL): SQL | undefined => {
	const clauses = filters
		.map((filter) => {
			const conf = config[filter.id];
			if (!conf) return undefined;

			const value = conf.transform ? conf.transform(filter.value) : filter.value;

			return conf.operator(conf.column, value);
		})
		.filter(Boolean);

	return clauses.length ? and(...(clauses as SQL[]), defaultWhere) : defaultWhere;
};
