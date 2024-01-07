import { Application } from '@app/app';
import DbGameFinder from '@app/classes/db-game-finder/db-game-finder';
import { EstablishConnection } from '@app/db';
import { GameDB } from '@app/models/game';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameInfoController', () => {
    let expressApp: Express.Application;

    before(async () => {
        const app = Container.get(Application);
        expressApp = app.app;

        await EstablishConnection.switchToTestDB();

        await GameDB.collection.drop();

        await GameDB.create({
            title: 'B visible game title',
            description: 'description',
            visible: true,
        });
        await GameDB.create({
            title: 'A visible game title',
            description: 'description',
            visible: true,
        });
        await GameDB.create({
            title: 'B invisible game title',
            description: 'description',
            visible: false,
        });
        await GameDB.create({
            title: 'A invisible game title',
            description: 'description',
            visible: false,
        });
    });

    after(async () => {
        GameDB.collection.drop();
    });

    it('should return correct message from general get', async () => {
        return await supertest(expressApp).get('/game').expect(StatusCodes.OK);
    });

    it('should have two visible games querying game?isGameVisible=true', async () => {
        const visibleGames = await supertest(expressApp).get('/game?isGameVisible=true').expect(StatusCodes.OK);
        expect(visibleGames.body).to.have.lengthOf(2);
    });

    it('visible games should be sorted alphabetically by title', async () => {
        const visibleGames = await supertest(expressApp).get('/game?isGameVisible=true').expect(StatusCodes.OK);
        expect(visibleGames.body[0].title).to.equal('A visible game title');
        expect(visibleGames.body[1].title).to.equal('B visible game title');
    });

    it("should return all item's info from a find by id query", async () => {
        const visibleGames = await supertest(expressApp).get('/game?isGameVisible=true');

        const query: string = '/game/' + visibleGames.body[0].id;

        const gameById = await supertest(expressApp).get(query).expect(StatusCodes.OK);

        expect(gameById.body.title).to.equal('A visible game title');
    });

    it('should return bad request error from a find by id query with wrong id', async () => {
        await supertest(expressApp).get('/game/0').expect(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request error from a find visible games false', async () => {
        await supertest(expressApp).get('/game?isGameVisible=false').expect(StatusCodes.BAD_REQUEST);
    });
    it('should return bad request error from a general get', async () => {
        const error = new Error('Test error');
        sinon.stub(DbGameFinder, 'findAllGames').throws(error);
        await supertest(expressApp).get('/game').expect(StatusCodes.BAD_REQUEST);
    });
});
