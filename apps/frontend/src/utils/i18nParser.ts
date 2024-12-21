import { useTranslation } from "react-i18next";

/**
 * @description Parse the i18n object to a string for rendering in frontend
 * @example
 * ```ts
 * 
 * //backend
 * const objectInBackend = {
	message: "extension.minecraft-core.connectInfo",
	placeholder: {
		host: "serverRootPath",
		userCode: "joinCode",
	},
    };

   const stringInBackend = "extension.minecraft-core.connectInfo"

    //frontend
    const text = i18nParser(objectInBackend);
    const text = i18nParser(stringInBackend);
    const text = i18nParser("extension.minecraft-core.connectInfo");

    * ```

 */
export const i18nParser = (
	i18nObject:
		| string
		| {
				message: string;
				placeholder: any;
		  },
): string => {
	const { t } = useTranslation();
	if (!i18nObject) {
		return "";
	}
	// Verifies if the string can be parsed and returns it as is if not
	const parsedObject =
		typeof i18nObject === "string"
			? (() => {
					try {
						return JSON.parse(i18nObject);
					} catch {
						return i18nObject;
					}
				})()
			: i18nObject;
	if (
		typeof parsedObject === "string" ||
		(!parsedObject?.message && !parsedObject?.placeholder)
	) {
		return t(parsedObject).toString();
	}

	// Generate text using message and placeholder if available
	const { message, placeholder } = parsedObject as {
		message: string;
		placeholder: any;
	};

	const translatedMessage = t(message, placeholder).toString();

	return translatedMessage;
};
