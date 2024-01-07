import { Application } from '@app/app';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_OK = StatusCodes.OK;

const fakeHistory = [
    {
        gameName: 'Cedrick test',
        date: '2023-11-24 09:42:28',
        playersNumber: 1,
        bestScore: 60,
    },
];

describe('History Controller', () => {
    let expressApp: Express.Application;

    beforeEach(async () => {
        const app = Container.get(Application);
        expressApp = app.app;
    });

    it('should return correct message from general get', async () => {
        return await supertest(expressApp).get('/history').expect(StatusCodes.OK);
    });
    it('should return correct code on a valid post request to post', async () => {
        const requestBody = fakeHistory;
        return supertest(expressApp).post('/history').send(requestBody).set('Accept', 'application/json').expect(HTTP_STATUS_OK);
    });

    it('should delete all history', async () => {
        await supertest(expressApp).delete('/history').expect(StatusCodes.OK);
    });
});
