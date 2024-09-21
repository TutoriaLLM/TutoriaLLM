import express from "express";

import trainingDataManager from "./data.js";
import guideManager from "./guides.js";

const trainingManager = express.Router();

trainingManager.use("/data", trainingDataManager);
trainingManager.use("/guide", guideManager);

export default trainingManager;
