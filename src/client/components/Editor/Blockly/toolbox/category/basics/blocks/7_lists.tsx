export const category = {
	kind: "category",
	name: "%{BKY_LISTS_CATEGORY}",
	colour: "#737373",
	contents: [
		{
			kind: "block",
			type: "lists_create_empty",
		},
		{
			kind: "block",
			type: "lists_create_with",
			extraState: {
				itemCount: 3,
			},
		},
		{
			kind: "block",
			type: "lists_repeat",
			inputs: {
				NUM: {
					block: {
						type: "math_number",
						fields: {
							NUM: 5,
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "lists_length",
		},
		{
			kind: "block",
			type: "lists_isEmpty",
		},
		{
			kind: "block",
			type: "lists_indexOf",
			fields: {
				END: "FIRST",
			},
		},
		{
			kind: "block",
			type: "lists_getIndex",
			fields: {
				MODE: "GET",
				WHERE: "FROM_START",
			},
		},
		{
			kind: "block",
			type: "lists_setIndex",
			fields: {
				MODE: "SET",
				WHERE: "FROM_START",
			},
		},
	],
};

export const locale = {
	en: {
		LISTS_CATEGORY: "Lists",
	},
	ja: {
		LISTS_CATEGORY: "リスト",
	},
};
