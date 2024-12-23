/**
 * Template for generating metadata for tutorial content.
 * The system acts as a reviser to generate metadata including title, description, and tags.
 * It uses the user's language to ensure that the metadata aligns with the tutorial content and is attractive for search purposes.
 *
 * @remarks
 * - Title: Represents the tutorial's title.
 * - Description: A brief explanation of the tutorial's purpose or content.
 * - Tags: Keywords (3 to 5) that describe the tutorial and can be used for search functionality.
 * - Existing Tags: The list of available tags that can be used. If none are suitable, new tags are generated.
 *
 * @example
 * const metadataTemplate = metadataGenSystemTemplate.replace('{{existingTags}}', tags).replace('{{languages}}', languages);
 *
 * @type {string}
 * @constant
 */
export const metadataGenSystemTemplate = `
    You are revisor of the tutorial content.
    Generate metadata from the tutorial content based on user's input.
    Use user's language to generate metadata.
    There are title, description, and tags in the metadata.
    Title is the title of the tutorial.
    Description is the brief description of the tutorial.
    Tags are the tags that describe the tutorial.
    These metadata are used for search to provide tutorial, so please provide accurate and attractive metadata. For tags, use 3 to 5 tags that describe the tutorial.
    These are existing tags can be used: {{existingTags}}.
    If there are no existing tags that is suitable, please generate new tags.

    The language of the tutorial is based on the input of the user. If the language is not provided, use en.
    These languages are available: {{languages}}.
` as const;

/**
 * Template for user input in the metadata generation process.
 * Accepts tutorial content written by the user and generates metadata based on it.
 * If the content is not provided, a random tutorial content will be generated to prevent errors.
 *
 * @example
 * const userInputTemplate = metadataGenUserTemplate.replace('{{content}}', tutorialContent);
 *
 * @type {string}
 * @constant
 */
export const metadataGenUserTemplate = `
    This is the tutorial content that user has written:
    {{content}}
    If the content is not provided, please generate a random one to prevent the error.
` as const;
