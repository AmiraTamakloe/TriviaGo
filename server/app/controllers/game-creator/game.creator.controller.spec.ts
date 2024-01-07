import { Application } from '@app/app';
import { EstablishConnection } from '@app/db';
import { Question } from '@app/interfaces/question';
import { GameDB } from '@app/models/game';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GameCreatorService } from '@app/services/game-creator/game.creator.service';
describe('GameCreatorController', () => {
    let expressApp: Express.Application;

    before(async () => {
        const app = Container.get(Application);
        expressApp = app.app;
        await EstablishConnection.switchToTestDB();
        await GameDB.collection.drop();
        const choiceTrue = { text: 'rep1', isCorrect: true };
        const choiceFalse = { text: 'rep1', isCorrect: false };
        const myQuestionValid: Question = {
            type: 'QCM',
            text: 'Question 1',
            points: 10,
            choices: [choiceTrue, choiceFalse, choiceFalse, choiceFalse],
        };
        const myGame = new GameDB({
            id: '5f8792b55d9d972ac8348e52',
            $schema: 'schema',
            visible: true,
            title: 'MyValidGame',
            description: 'Description',
            duration: 60,
            questions: [myQuestionValid],
        });
        await GameDB.create(myGame);
    });

    after(async () => {
        GameDB.collection.drop();
    });

    it('should create a new game with valid data', async () => {
        const choiceTrue = { text: 'rep1', isCorrect: true };
        const choiceFalse = { text: 'rep1', isCorrect: false };
        const myQuestionValid: Question = {
            type: 'QCM',
            text: 'Question 1',
            points: 10,
            choices: [choiceTrue, choiceFalse, choiceFalse, choiceFalse],
        };
        const newGame = {
            $schema: 'schema',
            visible: true,
            title: 'New Game Title',
            description: 'Description',
            duration: 60,
            questions: [myQuestionValid],
        };
        const gameCreatorService = Container.get(GameCreatorService);
        gameCreatorService.validId = async () => true;
        await supertest(expressApp).post('/createMatch').send(newGame).expect(StatusCodes.CREATED);
    });

    it('should change the id of a game if it is already taken', async () => {
        const choiceTrue = { text: 'rep1', isCorrect: true };
        const choiceFalse = { text: 'rep1', isCorrect: false };
        const myQuestionValid: Question = {
            type: 'QCM',
            text: 'Question 1',
            points: 10,
            choices: [choiceTrue, choiceFalse, choiceFalse, choiceFalse],
        };
        const newGame = {
            $schema: 'schema',
            visible: true,
            title: 'New Game Title For Id Test',
            description: 'Description',
            duration: 60,
            questions: [myQuestionValid],
        };
        const gameCreatorService = Container.get(GameCreatorService);
        gameCreatorService.validId = async () => false;
        await supertest(expressApp).post('/createMatch').send(newGame).expect(StatusCodes.CREATED);
    });
    it('should return a bad request for creating a game with invalid data', async () => {
        const invalidGame = {
            $schema: 'schema',
            visible: true,
        };

        await supertest(expressApp).post('/createMatch').send(invalidGame).expect(StatusCodes.BAD_REQUEST);
    });

    it('should update an existing game with valid data', async () => {
        const updatedGame = {
            title: 'Updated Game Title',
        };

        return await supertest(expressApp).patch('/createMatch/5f8792b55d9d972ac8348e52').send(updatedGame).expect(StatusCodes.OK);
    });

    it('should return a bad request for updating a game with invalid data', async () => {
        const existingGame = await GameDB.create({
            $schema: 'schema',
            visible: true,
            title: 'Existing Game Title',
            description: 'Description',
            duration: 60,
            questions: [{}],
        });

        const invalidGame = {
            duration: false,
        };

        await supertest(expressApp).patch(`/createMatch/${existingGame.id}`).send(invalidGame).expect(StatusCodes.BAD_REQUEST);
    });

    it('should post a game if it was deleted', async () => {
        await GameDB.findByIdAndDelete('5f8792b55d9d972ac8348e52');
        const choiceTrue = { text: 'rep1', isCorrect: true };
        const choiceFalse = { text: 'rep1', isCorrect: false };
        const myQuestionValid: Question = {
            type: 'QCM',
            text: 'Question 1',
            points: 10,
            choices: [choiceTrue, choiceFalse, choiceFalse, choiceFalse],
        };
        const updatedGame = {
            id: '5f8792b55d9d972ac8348e52',
            $schema: 'schema',
            visible: true,
            title: 'Updated Game Title',
            description: 'Description',
            duration: 60,
            questions: [myQuestionValid],
        };

        await supertest(expressApp).patch(`/createMatch/${updatedGame.id}`).send(updatedGame).expect(StatusCodes.CREATED);
    });

    it('should toggle the visibility of an existing game', async () => {
        const existingGame = await GameDB.create({
            $schema: 'schema',
            visible: true,
            title: 'Toggle Game Title',
            description: 'Description',
            duration: 60,
            questions: [
                {
                    title: 'Question Title',
                    description: 'Description',
                    answer: 'Answer',
                    choices: [],
                },
            ],
        });

        const response = await supertest(expressApp).patch(`/createMatch/${existingGame.id}/toggleVisibility`).expect(StatusCodes.OK);

        expect(response.body.visible).to.equal(false);
    });

    it('should return an error when trying to toggle visibility of a non-existent game', async () => {
        return await supertest(expressApp).patch('/createMatch/123456789012345678901234/toggleVisibility').expect(StatusCodes.NOT_FOUND);
    });

    it('should delete an existing game', async () => {
        await supertest(expressApp).delete('/createMatch/5f8792b55d9d972ac8348e52').expect(StatusCodes.OK);

        const deletedGame = await GameDB.findById('5f8792b55d9d972ac8348e52');
        expect(deletedGame).to.equal(null);
    });

    it('should return an error when trying to patch a deleted game', async () => {
        await GameDB.findByIdAndDelete('5f8792b55d9d972ac8348e52');
        const choiceFalse = { text: 'rep1', isCorrect: false };
        const myQuestionValid: Question = {
            type: 'QCM',
            text: 'Question 1',
            points: 10,
            choices: [choiceFalse, choiceFalse, choiceFalse, choiceFalse],
        };
        const updatedGame = {
            id: '5f8792b55d9d972ac8348e52',
            $schema: 'schema',
            visible: true,
            title: 'Updated Game Title',
            description: 'Description',
            duration: 60,
            questions: [myQuestionValid],
        };

        await supertest(expressApp).patch(`/createMatch/${updatedGame.id}`).send(updatedGame).expect(StatusCodes.CONFLICT);
    });
});
