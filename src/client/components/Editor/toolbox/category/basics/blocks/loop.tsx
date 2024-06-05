export const loops = {
  kind: "category",
  name: "Loops",
  colour: "#10b981",
  contents: [
    {
      kind: "block",
      type: "controls_repeat_ext",
      inputs: {
        TIMES: {
          block: {
            type: "math_number",
            fields: {
              NUM: 10,
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "controls_whileUntil",
    },
    {
      kind: "block",
      type: "controls_for",
      fields: {
        VAR: "i",
      },
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
              NUM: 10,
            },
          },
        },
        BY: {
          block: {
            type: "math_number",
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: "block",
      type: "controls_forEach",
    },
    {
      kind: "block",
      type: "controls_flow_statements",
    },
  ],
};
export default loops;
