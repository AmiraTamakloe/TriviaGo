import { model, Schema } from 'mongoose';

const historySchema = new Schema({
    gameName: String,
    date: String,
    playersNumber: Number,
    bestScore: Number,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const History = model('History', historySchema);
