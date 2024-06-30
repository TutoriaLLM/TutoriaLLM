import type {
	Generated,
	Insertable,
	JSONColumnType,
	Selectable,
	Updateable,
} from "kysely";

/**
 * @description: SQLiteデータベースのテーブルごとの定義
 **/
export interface Database {
	//sessions: SessionTable;
	users: UserTable;
	tutorials: TutorialTable;
	authSessions: AuthSessionTable;
}

/**
 * @description: usersテーブルの定義
 * @param id: ユーザーのID
 * @param username: ユーザー名
 * @param password: パスワード
 */
export interface UserTable {
	id: Generated<number>;
	username: string;
	password: string;
}

/**
 * @description: auth用のsessionsテーブルの定義。Authのセッション情報を保存する
 * @param id: セッションのID。
 * @param expires_at: セッションの有効期限
 * @param user_id: ユーザーのID。外部キー
 */
export interface AuthSessionTable {
	id: string;
	expires_at: number;
	user_id: string;
}

/**
 * @description: tutorialsテーブルの定義
 * @param id: チュートリアルのID
 * @param content: チュートリアルの内容
 * @param metadata: チュートリアルのメタデータ
 */
export interface TutorialTable {
	id: Generated<number>;
	content: string;
	metadata: JSONColumnType<{
		marp: true;
		title: string;
		description: string;
		author?: string;
		keywords?: string[];
	}>;
}
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdatedUser = Updateable<UserTable>;
export type Tutorial = Selectable<TutorialTable>;
export type NewTutorial = Insertable<TutorialTable>;
export type UpdatedTutorial = Updateable<TutorialTable>;

export type WSMessage = {
	request: string;
	value?: string | number | boolean | object | null;
};

export type ContentType = "user" | "ai" | "log" | "image";

export type Dialogue = {
	contentType: ContentType;
	isuser: boolean;
	content: any; // コンテンツの種類に応じて型を変更できます
};

//フロントエンドでのチュートリアルの進行度を管理するための型
export type TutorialStats = {
	//チュートリアルの有無
	isTutorial: boolean;
	//チュートリアルのid
	tutorialId: string | null;
	//チュートリアルの進行度
	progress: number | null;
};

export type SessionValue = {
	sessioncode: string;
	uuid: string;
	createdAt: Date;
	updatedAt: Date;
	dialogue: Dialogue[];
	//シリアル化したBlockly.Workspaceを保存する
	workspace: any[string];
	isVMRunning: boolean;
	clients: string[];
	language: string;
	//AIへ与えるコンテキスト
	llmContext: string;
	//チュートリアルの有無や設定を保存する
	tutorial: TutorialStats;
};

export type WSMinecraftMessage = {
	Header: null;
	Body: null;
};

export type AppConfig = {
	General_Settings: {
		Enable_Join_by_code: boolean;
		Enable_Create_Room: boolean;
	};
	AI_Settings: {
		AI_Model: string;
		AI_Temperature: number;
		Max_Number_of_processes: number;
	};
};
