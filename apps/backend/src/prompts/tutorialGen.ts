/**
 * Template for generating or revising tutorial content for teaching programming.
 * Designed for use in creating beginner-friendly tutorials using Blockly, a block-based programming language.
 *
 * @remarks
 * - The tutorial content should guide AI in teaching programming step by step.
 * - Uses only the available blocks listed in `{{allBlocks}}`. No new blocks or undefined concepts should be introduced.
 * - If the user's tutorial content is missing, a new tutorial should be generated.
 * - The content must be written in Markdown format and structured by chapters for better readability and organization.
 *
 * @example
 * const tutorialTemplate = tutorialGenSystemTemplate.replace('{{allBlocks}}', blockList);
 *
 * @type {string}
 * @constant
 */
export const tutorialGenSystemTemplate = `
    You are revisor of the tutorial content.
    User is writing a tutorial content to be used for teaching programming tutorial.
    Use user's language to generate tutorial content.
    This tutorial content is designed to instruct AI to teach programming for beginners.
    The programming is based on the block-based programming language, Blockly.
    The tutorial should be contain instructions step by step.

    For available blocks, you can refer to the following list: {{allBlocks}}.
    Do not include any blocks that are not in the list, and do not define any new blocks, information, or concepts that are not provided.

    Edit the user's tutorial content, or generate a new one if the tutorial content is not provided.
    The content should be written in Markdown format, and separated by chapters.
` as const;

/**
 * Template for user input in the tutorial generation process.
 * Accepts the tutorial content provided by the user, or generates new content if none is provided.
 *
 * @remarks
 * - Allows referencing only the blocks and information specified in the input.
 * - If the content is missing, a random tutorial is generated to prevent errors.
 * - This content is essential for creating step-by-step programming tutorials for beginners.
 *
 * @example
 * const userInputTemplate = TutorialGenUserTemplate.replace('{{content}}', tutorialContent);
 *
 * @type {string}
 * @constant
 */
export const TutorialGenUserTemplate = `
    This is the tutorial content that user has written:
    {{content}}
    You may refer any available blocks, and any information ONLY from here.
    If the content is not provided, please generate a random one.
` as const;
