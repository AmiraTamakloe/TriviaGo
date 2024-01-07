import { GameDB } from '@app/models/game';
import DbGameFinder from './db-game-finder';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('DbGameFinder', () => {
    const errorMessage = 'error message';
    afterEach(() => {
        sinon.restore();
    });

    it('should throw an error when GameDB.find fails', async () => {
        sinon.stub(GameDB, 'find').throws(errorMessage);
        try {
            await DbGameFinder.findAllGames();
            throw new Error('Expected findAllGames to throw, but it did not');
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
    });
    it('should throw an error when GameDB.find fails', async () => {
        sinon.stub(GameDB, 'find').throws(errorMessage);
        try {
            await DbGameFinder.findVisibleGames();
            throw new Error('Expected findVisibleGames to throw, but it did not');
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
    });
});
