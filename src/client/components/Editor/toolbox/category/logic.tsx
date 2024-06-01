export const logic = {
  kind: "category",
  name: "logic",
  colour: "#10b981",
  contents: [
    {
      kind: "block",
      type: "controls_if",
    },
    {
      kind: "block",
      type: "controls_if",
      extraState: {
        hasElse: "true",
      },
    },
    {
      kind: "block",
      type: "controls_if",
      extraState: {
        hasElse: "true",
        elseIfCount: 1,
      },
    },
    {
      kind: "block",
      type: "logic_compare",
    },
    {
      kind: "block",
      type: "logic_operation",
    },
    {
      kind: "block",
      type: "logic_negate",
    },
    {
      kind: "block",
      type: "logic_boolean",
    },
    {
      kind: "block",
      type: "logic_null",
    },
    {
      kind: "block",
      type: "logic_ternary",
    },
  ],
};
export default logic;
