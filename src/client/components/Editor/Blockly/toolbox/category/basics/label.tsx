export function label(props: { text: string }) {
  return {
    kind: "label",
    text: props.text,
    "web-class": "blocklyLabelTitle",
  };
}
export default label;
