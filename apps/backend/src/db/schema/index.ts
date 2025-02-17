import type { auth } from "@/libs/auth";
import type { appSessions } from "./session";
import type { guides, trainingData } from "./training";
import type { tags, tutorials, tutorialsTags } from "./tutorial";

export * from "./auth";
export * from "./session";
export * from "./training";
export * from "./tutorial";

// export type InsertUser = typeof use.$inferInsert;
// export type SelectUser = typeof users.$inferSelect;

// export type InsertAuthSession = typeof authSessions.$inferInsert;
// export type SelectAuthSession = typeof authSessions.$inferSelect;

export type InsertAppSession = typeof appSessions.$inferInsert;
export type SelectAppSession = typeof appSessions.$inferSelect;

export type InsertTag = typeof tags.$inferInsert;
export type SelectTag = typeof tags.$inferSelect;

export type InsertTutorialsTags = typeof tutorialsTags.$inferInsert;
export type SelectTutorialsTags = typeof tutorialsTags.$inferSelect;

export type InsertTutorial = typeof tutorials.$inferInsert;
export type SelectTutorial = typeof tutorials.$inferSelect;

export type InsertGuide = typeof guides.$inferInsert;
export type SelectGuide = typeof guides.$inferSelect;

export type InsertTrainingData = typeof trainingData.$inferInsert;
export type SelectTrainingData = typeof trainingData.$inferSelect;

// Temporary type aliases until migration is complete
// export type User = SelectUser;
export type AuthSession = typeof auth.$Infer.Session;
export type AppSession = SelectAppSession;
export type Tag = SelectTag;
export type TutorialsTags = SelectTutorialsTags;
export type Tutorial = SelectTutorial;
export type Guide = SelectGuide;
export type TrainingData = SelectTrainingData;
