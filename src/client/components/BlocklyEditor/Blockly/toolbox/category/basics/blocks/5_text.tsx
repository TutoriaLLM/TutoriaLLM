export const category = {
	kind: "category",
	name: "%{BKY_TEXT_CATEGORY}",
	colour: "#f97316",
	contents: [
		{
			kind: "block",
			type: "text",
		},
		{
			kind: "block",
			type: "text_join",
		},
		{
			kind: "block",
			type: "text_append",
			inputs: {
				TEXT: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_length",
			inputs: {
				VALUE: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "string",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_isEmpty",
			inputs: {
				VALUE: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_indexOf",
			inputs: {
				VALUE: {
					block: {
						type: "variables_get",
					},
				},
				FIND: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "string",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_charAt",
			inputs: {
				VALUE: {
					block: {
						type: "variables_get",
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_getSubstring",
			inputs: {
				STRING: {
					block: {
						type: "variables_get",
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_changeCase",
			inputs: {
				TEXT: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "string",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_trim",
			inputs: {
				TEXT: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "string",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_count",
			inputs: {
				SUB: {
					shadow: {
						type: "text",
					},
				},
				TEXT: {
					shadow: {
						type: "text",
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_replace",
			inputs: {
				FROM: {
					shadow: {
						type: "text",
					},
				},
				TO: {
					shadow: {
						type: "text",
					},
				},
				TEXT: {
					shadow: {
						type: "text",
					},
				},
			},
		},
		{
			kind: "block",
			type: "text_reverse",
			inputs: {
				TEXT: {
					shadow: {
						type: "text",
					},
				},
			},
		},
		// {
		// 	kind: "block",
		// 	type: "text_print",
		// 	inputs: {
		// 		TEXT: {
		// 			shadow: {
		// 				type: "text",
		// 				fields: {
		// 					TEXT: "string",
		// 				},
		// 			},
		// 		},
		// 	},
		// },
	],
};

export const locale = {
	en: {
		TEXT_CATEGORY: "Text",
	},
	ja: {
		TEXT_CATEGORY: "テキスト",
	},
};
