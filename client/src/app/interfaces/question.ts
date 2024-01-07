import { Choice } from '@app/interfaces/choice';

export interface Question {
    type: string;
    text: string;
    points: number;
    choices: Choice[];
}
