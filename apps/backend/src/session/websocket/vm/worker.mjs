import { register } from "tsx/esm/api";

// Register tsx enhancement
const unregister = register();

await import("./tsWorker.ts");

// Unregister when needed
unregister();
