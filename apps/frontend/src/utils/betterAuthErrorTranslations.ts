import type { TFunction } from "i18next";

//this is a function that translates the error messages from the better-auth(backend) to the frontend with i18n with suppoting base and plugins
export function errorMessageByCode({
	status,
	t,
}: {
	status: string;
	t: TFunction;
}): string {
	switch (status) {
		//base
		case "USER_NOT_FOUND":
			return t("auth.userNotFound");
		case "FAILED_TO_CREATE_USER":
			return t("auth.failedToCreateUser");
		case "FAILED_TO_CREATE_SESSION":
			return t("auth.failedToCreateSession");
		case "FAILED_TO_UPDATE_USER":
			return t("auth.failedToUpdateUser");
		case "FAILED_TO_GET_SESSION":
			return t("auth.failedToGetSession");
		case "INVALID_PASSWORD":
			return t("auth.invalidPassword");
		case "INVALID_EMAIL":
			return t("auth.invalidEmail");
		case "INVALID_EMAIL_OR_PASSWORD":
			return t("auth.invalidEmailOrPassword");
		case "SOCIAL_ACCOUNT_ALREADY_LINKED":
			return t("auth.socialAccountAlreadyLinked");
		case "PROVIDER_NOT_FOUND":
			return t("auth.providerNotFound");
		case "INVALID_TOKEN":
			return t("auth.invalidToken");
		case "ID_TOKEN_NOT_SUPPORTED":
			return t("auth.idTokenNotSupported");
		case "FAILED_TO_GET_USER_INFO":
			return t("auth.failedToGetUserInfo");
		case "USER_EMAIL_NOT_FOUND":
			return t("auth.userEmailNotFound");
		case "EMAIL_NOT_VERIFIED":
			return t("auth.emailNotVerified");
		case "PASSWORD_TOO_SHORT":
			return t("auth.passwordTooShort");
		case "PASSWORD_TOO_LONG":
			return t("auth.passwordTooLong");
		case "USER_ALREADY_EXISTS":
			return t("auth.userAlreadyExists");
		case "EMAIL_CAN_NOT_BE_UPDATED":
			return t("auth.emailCannotBeUpdated");
		case "CREDENTIAL_ACCOUNT_NOT_FOUND":
			return t("auth.credentialAccountNotFound");
		case "SESSION_EXPIRED":
			return t("auth.sessionExpired");
		case "FAILED_TO_UNLINK_LAST_ACCOUNT":
			return t("auth.failedToUnlinkLastAccount");
		case "ACCOUNT_NOT_FOUND":
			return t("auth.accountNotFound");

		//username
		case "INVALID_USERNAME_OR_PASSWORD":
			return t("auth.invalidUsernameOrPassword");
		case "UNEXPECTED_ERROR":
			return t("auth.unexpectedError");
		case "USERNAME_IS_ALREADY_TAKEN":
			return t("auth.usernameIsAlreadyTaken");

		//admin
		case "YOU_CANNOT_BAN_YOURSELF":
			return t("auth.youCannotBanYourself");
		case "ONLY_ADMINS_CAN_ACCESS_THIS_ENDPOINT":
			return t("auth.onlyAdminsCanAccessThisEndpoint");

		//anonymous
		case "COULD_NOT_CREATE_SESSION":
			return t("auth.couldNotCreateSession");
		case "ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY":
			return t("auth.anonymousUsersCannotSignInAgainAnonymously");
		default:
			return t("auth.unknownError");
	}
}
