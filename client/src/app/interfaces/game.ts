import { Question } from '@app/interfaces/question';

export interface Game {
    id: string;
    $schema: string;
    visible: boolean;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[];
}
