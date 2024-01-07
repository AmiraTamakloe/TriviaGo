import { Question } from './question';
import { History } from './history';

export interface Game {
    $schema?: string;
    id?: string;
    visible?: boolean;
    title?: string;
    description?: string;
    duration?: number;
    lastModification?: string;
    questions?: Question[];
    history?: History[];
}
