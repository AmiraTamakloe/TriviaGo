import { model, Schema } from 'mongoose';

const gameSchema = new Schema({
    visible: {
        type: Boolean,
        required: true,
        default: true,
    },
    title: String,
    description: String,
    duration: Number,
    lastModification: String,
    points: Number,
    questions: [Object],
});
// eslint-disable-next-line @typescript-eslint/naming-convention
export const GameDB = model('Game', gameSchema);
