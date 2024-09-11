export const category = {
	kind: "category",
	name: "%{BKY_MATH_CATEGORY}",
	colour: "#3b82f6",
	contents: [
		{
			kind: "block",
			type: "math_number",
			fields: {
				NUM: 123,
			},
		},
		{
			kind: "block",
			type: "math_arithmetic",
			fields: {
				OP: "ADD",
			},
		},
		// {
		// 	kind: "block",
		// 	type: "math_single",
		// 	fields: {
		// 		OP: "ROOT",
		// 	},
		// },
		// {
		// 	kind: "block",
		// 	type: "math_trig",
		// 	fields: {
		// 		OP: "SIN",
		// 	},
		// },
		// {
		// 	kind: "block",
		// 	type: "math_constant",
		// 	fields: {
		// 		CONSTANT: "PI",
		// 	},
		// },
		{
			kind: "block",
			type: "math_number_property",
			extraState: '<mutation divisor_input="false"></mutation>',
			fields: {
				PROPERTY: "EVEN",
			},
		},
		{
			kind: "block",
			type: "math_round",
			fields: {
				OP: "ROUND",
			},
		},
		{
			kind: "block",
			type: "math_on_list",
			extraState: '<mutation op="SUM"></mutation>',
			fields: {
				OP: "SUM",
			},
		},
		{
			kind: "block",
			type: "math_modulo",
		},
		{
			kind: "block",
			type: "math_constrain",
			inputs: {
				LOW: {
					block: {
						type: "math_number",
						fields: {
							NUM: 1,
						},
					},
				},
				HIGH: {
					block: {
						type: "math_number",
						fields: {
							NUM: 100,
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "math_random_int",
			inputs: {
				FROM: {
					block: {
						type: "math_number",
						fields: {
							NUM: 1,
						},
					},
				},
				TO: {
					block: {
						type: "math_number",
						fields: {
							NUM: 100,
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "math_random_float",
		},
		// {
		// 	kind: "block",
		// 	type: "math_atan2",
		// },
	],
};

export const locale = {
	en: {
		MATH_CATEGORY: "Math",
	},
	ja: {
		MATH_CATEGORY: "数学",
	},
};
