import { type Primitive, z } from "zod";

export function zodLiteralUnionType<T extends Primitive>(
	constArray: readonly T[],
) {
	if (constArray.length === 0) throw new Error("最低1つのリテラルが必要です");

	const literalsArray = (
		constArray.length === 1 ? [constArray[0], constArray[0]] : constArray
	).map((literal) => z.literal(literal)) as [
		z.ZodLiteral<T>,
		z.ZodLiteral<T>,
		...z.ZodLiteral<T>[],
	];

	return z.union(literalsArray);
}
