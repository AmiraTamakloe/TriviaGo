export interface GameInterface {
    _id: string;
    title: string;
    description: string;
    duration: number;
    points: number;
    questions: [
        {
            type: string;
            text: string;
            points: number;
            choices: [{ text: string; isCorrect: boolean }];
        },
    ];
}
