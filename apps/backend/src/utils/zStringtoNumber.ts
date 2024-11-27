import { z } from "zod";

export const stringToNumber = z.preprocess((v) => Number(v), z.number());
