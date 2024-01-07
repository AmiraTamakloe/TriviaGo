import { Choice } from './choice';

export enum QuestionType {
    QCM = 'QCM',
    QRL = 'QRL',
}

export interface Question {
    type?: string;
    text?: string;
    points?: number;
    choices?: Choice[];
}
