/* eslint-disable max-lines */
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameDB } from '@app/models/game';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { GameCreatorService } from './game.creator.service';
interface ValidStatus {
    valid: boolean;
    errors: string[];
}
const choiceTrue = { text: 'rep1', isCorrect: true };
const choiceFalse = { text: 'rep1', isCorrect: false };
const myQuestionValid: Question = {
    type: 'QCM',
    text: 'Question 1',
    points: 10,
    choices: [choiceTrue, choiceFalse, choiceFalse, choiceFalse],
};
const validGame: Game = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    visible: false,
    id: '123',
    lastModification: '2021-03-22T15:00:00.000Z',
    title: 'New Game',
    description: 'A new game',
    duration: 30,
    questions: [myQuestionValid, myQuestionValid],
};
describe('GameCreatorService', () => {
    let gameCreatorService: GameCreatorService;
    beforeEach(() => {
        gameCreatorService = new GameCreatorService();
    });
    describe('validGame', () => {
        it('should call checkRequired when isJson is true', async () => {
            const checkRequiredSpy = sinon.spy(gameCreatorService, 'checkRequired');
            await gameCreatorService.validGame(validGame, 'true');
            expect(checkRequiredSpy.calledOnce).to.equal(true);
            checkRequiredSpy.restore();
        });
        it('should call validTitle', async () => {
            const validTitleSpy = sinon.spy(gameCreatorService, 'validTitle');
            await gameCreatorService.validGame(validGame, 'true');
            expect(validTitleSpy.calledOnce).to.equal(true);
            validTitleSpy.restore();
        });
        it('should call validDescription', async () => {
            const validDescriptionSpy = sinon.spy(gameCreatorService, 'validDescription');
            await gameCreatorService.validGame(validGame, 'true');
            expect(validDescriptionSpy.calledOnce).to.equal(true);
            validDescriptionSpy.restore();
        });
        it('should call validDuration', async () => {
            const validDurationSpy = sinon.spy(gameCreatorService, 'validDuration');
            await gameCreatorService.validGame(validGame, 'true');
            expect(validDurationSpy.calledOnce).to.equal(true);
            validDurationSpy.restore();
        });
        it('should call validQuestions', async () => {
            const validQuestionsSpy = sinon.spy(gameCreatorService, 'validQuestions');
            await gameCreatorService.validGame(validGame, 'true');
            expect(validQuestionsSpy.calledOnce).to.equal(true);
            validQuestionsSpy.restore();
        });
    });
    describe('validDescription', () => {
        it('should return valid status with no errors if the description is valid', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validDescription(validGame, validStatus);
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
        it('should return invalid status with an error if the description is not valid', () => {
            const myInvalidGame: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'Anewgame123',
                duration: 30,
                questions: [myQuestionValid, myQuestionValid],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validDescription(myInvalidGame, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal('La description ne doit pas dépasser 200 caractères et contenir que des lettres et des espaces');
        });
        it('should return valid status if the description is undefined', () => {
            const validGameWithoutDescription: Game = {
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: undefined,
                duration: 30,
                questions: [myQuestionValid, myQuestionValid],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validDescription(validGameWithoutDescription, validStatus);
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
    });
    describe('validDuration', () => {
        it('should return valid status with no errors if the duration is valid', () => {
            const myValidStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validDuration(validGame, myValidStatus);
            expect(myValidStatus.valid).to.equal(true);
            expect(myValidStatus.errors.length).to.equal(0);
        });
        it('should return invalid status with an error if the duration is less than 10', () => {
            const inValidGame: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'Anewgame',
                duration: 5,
                questions: [myQuestionValid, myQuestionValid],
            };
            const myValidStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validDuration(inValidGame, myValidStatus);
            expect(myValidStatus.valid).to.equal(false);
            expect(myValidStatus.errors.length).to.equal(1);
            expect(myValidStatus.errors[0]).to.equal('Le temps doit être entre 10 et 60 secondes pour le jeu: New Game');
        });
        it('should return invalid status with an error if the duration is greater than or equal to 60', () => {
            const inValidGame: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'Anewgame',
                duration: 75,
                questions: [myQuestionValid, myQuestionValid],
            };
            const myValidStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validDuration(inValidGame, myValidStatus);
            expect(myValidStatus.valid).to.equal(false);
            expect(myValidStatus.errors.length).to.equal(1);
            expect(myValidStatus.errors[0]).to.equal('Le temps doit être entre 10 et 60 secondes pour le jeu: New Game');
        });
    });
    describe('validId', () => {
        it('should return an error if id is empty when json', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: true },
                        ],
                        points: 10,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.checkRequired(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal("Votre jeu a besoin d'un id");
        });

        it('should return true if id is good', async () => {
            const validId = '65483bd03dc81f9ed5a55168';
            expect(await gameCreatorService.validId(validId)).to.equal(true);
        });

        it("should return false if id doesn't respect the pattern", async () => {
            const invalidId = '65483bd03dc81f9ed5a55';
            expect(await gameCreatorService.validId(invalidId)).to.equal(false);
        });

        it('should return false if id is already used', async () => {
            const invalidId = '65483bd03dc81f9ed5a55168';
            const findStub = sinon.stub(GameDB, 'findById');
            findStub.withArgs(invalidId).resolves({ id: invalidId });
            expect(await gameCreatorService.validId(invalidId)).to.equal(false);
            findStub.restore();
        });
    });
    describe('validTitle', () => {
        it('should return valid status with no errors if the title is valid', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validTitle(validGame, validStatus);
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
        it('should return invalid status with an error if the title is taken', async () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const findByTitleStub = sinon.stub(GameDB, 'find');
            findByTitleStub.withArgs().resolves([validGame]);
            await gameCreatorService.validTitle(validGame, validStatus);
            expect(validStatus.errors[0]).to.equal('Le titre du jeu est déjà utilisé');
            findByTitleStub.restore();
        });
    });
    describe('validQuestions', () => {
        it('should return invalid status with an error if there are no questions', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal("Il n'y a pas de question pour le jeu: New Game");
        });
        it('should return invalid status with an error if a QCM question has less than 2 or more than 4 choices', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    { text: 'Question 1', type: 'QCM', points: 10 },
                    {
                        text: 'Question 2',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                            { text: 'Choice 3', isCorrect: false },
                        ],
                        points: 20,
                    },
                    {
                        text: 'Question 3',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                            { text: 'Choice 3', isCorrect: false },
                            { text: 'Choice 4', isCorrect: false },
                            { text: 'Choice 5', isCorrect: false },
                        ],
                        points: 30,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(2);
            expect(validStatus.errors[0]).to.equal('Vous devez mettre entre 2 et 4 choix de réponses: Question 1');
            expect(validStatus.errors[1]).to.equal('Vous devez mettre entre 2 et 4 choix de réponses: Question 3');
        });
        it('should return invalid status with an error if a QCM question has a score that is not a multiple of 10', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                        ],
                        points: 15,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal('Votre score doit être un multiple de 10 pour la question Question 1');
        });
        it('should return invalid status with an error if type of a question is not QCM', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCU',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                        ],
                        points: 20,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal("Une des questions n'est pas de type QCM: Question 1");
        });
        it('should return valid status even if isCorrect is a string false or true', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: 'true' },
                            { text: 'Choice 2', isCorrect: 'false' },
                        ],
                        points: 10,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
        it('should return invalid status with an error if there is one correct answer and no incorrect answer', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: true },
                        ],
                        points: 10,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal('Vous devez avoir au moins une réponse fausse et une vraie pour la question: Question 1');
        });
        it('should return invalid status with an error if isCorrect is not false or true', () => {
            const game: Game = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                visible: false,
                id: '123',
                lastModification: '2021-03-22T15:00:00.000Z',
                title: 'New Game',
                description: 'A new game',
                duration: 30,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: 'fajenrlse' },
                            { text: 'Choice 2', isCorrect: 'kjef' },
                        ],
                        points: 10,
                    },
                ],
            };
            const validStatus: ValidStatus = { valid: true, errors: [] };
            gameCreatorService.validQuestions(game, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(3);
            expect(validStatus.errors[0]).to.equal('Vous devez avoir des choix de réponses ayant un booléen pour isCorrect pour le choix: Choice 1');
        });
        it('should call validateQRL if the question is a QRL', async () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const myGame: Game = {
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QRL',
                        points: 10,
                    },
                ],
            };
            const validateQRLSpy = sinon.spy(gameCreatorService, 'validateQRL');
            await gameCreatorService.validQuestions(myGame, validStatus);
            expect(validateQRLSpy.calledOnce).to.equal(true);
            validateQRLSpy.restore();
        });
        it('should call validQCM if the question is a QCM', async () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const myGame: Game = {
                questions: [
                    {
                        text: 'Question 1',
                        type: 'QCM',
                        points: 10,
                    },
                ],
            };
            const validQCMSpy = sinon.spy(gameCreatorService, 'validQCM');
            await gameCreatorService.validQuestions(myGame, validStatus);
            expect(validQCMSpy.calledOnce).to.equal(true);
            validQCMSpy.restore();
        });
    });
    describe('validPatch', () => {
        it('should return valid status with no errors if the title is undefined', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const myGame: Game = {
                title: undefined,
            };
            gameCreatorService.patchingGame(myGame, '123');
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
        it('should call validTitle if the title is changed', async () => {
            const id = '123';
            const game = { title: 'New Title' };
            const unchangedTitle = { title: 'Old Title' };
            const findByIdStub = sinon.stub(GameDB, 'findById');
            findByIdStub.withArgs(id).resolves(unchangedTitle);
            const validTitle = sinon.spy(gameCreatorService, 'validTitle');
            await gameCreatorService.patchingGame(game, id);
            expect(validTitle.calledOnce).to.equal(true);
            findByIdStub.restore();
        });
        it('should not call validTitle if the title is not changed', async () => {
            const id = '123';
            const game = { title: 'New Title' };
            const unchangedTitle = { title: 'New Title' };
            const findByIdStub = sinon.stub(GameDB, 'findById');
            findByIdStub.withArgs(id).resolves(unchangedTitle);
            const validTitle = sinon.spy(gameCreatorService, 'validTitle');
            await gameCreatorService.patchingGame(game, id);
            expect(validTitle.calledOnce).to.equal(false);
            findByIdStub.restore();
        });
        it('should call validDescription if the description is changed', async () => {
            const validDescriptionSpy = sinon.spy(gameCreatorService, 'validDescription');
            const myGame: Game = {
                description: 'A new game',
            };
            await gameCreatorService.patchingGame(myGame, '123');
            expect(validDescriptionSpy.calledOnce).to.equal(true);
            validDescriptionSpy.restore();
        });
        it('should call validDuration if the duration is changed', async () => {
            const validDurationSpy = sinon.spy(gameCreatorService, 'validDuration');
            const myGame: Game = {
                duration: 30,
            };
            await gameCreatorService.patchingGame(myGame, '123');
            expect(validDurationSpy.calledOnce).to.equal(true);
            validDurationSpy.restore();
        });
        it('should call validQuestions if the questions are changed', async () => {
            const validQuestionsSpy = sinon.spy(gameCreatorService, 'validQuestions');
            const myGame: Game = {
                questions: [myQuestionValid, myQuestionValid],
            };
            await gameCreatorService.patchingGame(myGame, '123');
            expect(validQuestionsSpy.calledOnce).to.equal(true);
            validQuestionsSpy.restore();
        });
    });
    describe('validateQRL', () => {
        it('should return valid if a QRL is correct', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const qrl: Question = {
                type: 'QRL',
                text: 'Question 1',
                points: 10,
            };
            gameCreatorService.validateQRL(qrl, validStatus);
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
        it('should return invalid if a QRL text is undefined', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const qrl: Question = {
                type: 'QRL',
                text: undefined,
                points: 10,
            };
            gameCreatorService.validateQRL(qrl, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal('Le texte de la question est obligatoire');
        });
        it('should return invalid if a QRL text is undefined', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const qrl: Question = {
                type: 'QRL',
                text: 'text',
                points: undefined,
            };
            gameCreatorService.validateQRL(qrl, validStatus);
            expect(validStatus.valid).to.equal(false);
            expect(validStatus.errors.length).to.equal(1);
            expect(validStatus.errors[0]).to.equal('Le pointage de la question est obligatoire');
        });
    });
    describe('validQCM', () => {
        it('should return valid if a QCM is correct', () => {
            const validStatus: ValidStatus = { valid: true, errors: [] };
            const qcm: Question = {
                type: 'QCM',
                text: 'Question 1',
                points: 10,
                choices: [{ text: 'Undefined Choice', isCorrect: null }, choiceFalse, choiceFalse, choiceTrue],
            };
            gameCreatorService.validQCM(qcm, validStatus);
            expect(validStatus.valid).to.equal(true);
            expect(validStatus.errors.length).to.equal(0);
        });
    });
});
