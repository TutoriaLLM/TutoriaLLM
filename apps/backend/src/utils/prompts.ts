/**
 * 👏: https://zenn.dev/kimuson/articles/type_safe_prompt
 */

/**
 * A type to extract variable placeholders from a template string.
 * Example: Extracts `"name"` from `"Hello, {{name}}!"`.
 *
 * @template T - Input string type
 * @template Vars - Type holding the variables extracted so far
 * @example
 * type Variables = ExtractPromptVariables<"Hello, {{name}}!">; // "name"
 */
export type ExtractPromptVariables<
	T extends string,
	Vars = never,
> = T extends `${infer Before}{{${infer I}}}${infer After}`
	? ExtractPromptVariables<`${Before}${After}`, Vars | I>
	: Vars;

/**
 * A type to fill placeholders in a template string with specified variables.
 * Example: Generates `"Hello, Alice!"` from `"Hello, {{name}}!"` and `{ name: "Alice" }`.
 *
 * @template T - Input string type (template string)
 * @template Vars - Key-value pairs of variables
 * @example
 * type Filled = FilledPrompt<"Hello, {{name}}!", { name: "Alice" }>; // "Hello, Alice!"
 */
export type FilledPrompt<
	T extends string,
	Vars extends { [K: string]: string },
> = T extends `${infer Before}{{${infer I}}}${infer After}`
	? FilledPrompt<`${Before}${Vars[I]}${After}`, Vars>
	: T;

/**
 * A function to fill a template string with given variables.
 * Replaces placeholders with the corresponding variable values.
 * Useful for generating prompts.
 *
 * @param template - The string template containing placeholders (e.g., `{{name}}`)
 * @param vars - Key-value pairs of variable names and their values
 * @returns The template string with placeholders filled in
 *
 * @example
 * const result = fillPrompt("Hello, {{name}}!", { name: "Alice" });
 * console.log(result); // "Hello, Alice!"
 */
export const fillPrompt = <
	const Template extends string,
	const Vars extends {
		[K in VariableNames]: string;
	},
	VariableNames extends string = ExtractPromptVariables<Template>,
>(
	template: Template,
	vars: Vars,
) => {
	return Object.entries(vars).reduce(
		(template: string, [key, value]) =>
			template.replaceAll(`{{${key}}}`, String(value)),
		template,
	) as FilledPrompt<Template, Vars>;
};
