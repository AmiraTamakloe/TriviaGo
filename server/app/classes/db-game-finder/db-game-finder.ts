import { Game } from '@app/interfaces/game';
import { GameDB } from '@app/models/game';
import { Document } from 'mongoose';

export default class DbGameFinder {
    static async findAllGames(): Promise<Game[]> {
        try {
            return this.convertGamesDBToGame(await GameDB.find());
        } catch (err) {
            throw new Error(err);
        }
    }

    static async findVisibleGames() {
        try {
            const games = await GameDB.find({ visible: { $eq: true } })
                .sort({ title: 1 })
                .select('title description questions duration');
            return this.convertGamesDBToGame(games);
        } catch (err) {
            throw new Error(err);
        }
    }

    static async findById(id: string): Promise<Game> {
        try {
            return this.convertGameDBToGame(await GameDB.findById(id));
        } catch (err) {
            throw new Error(err);
        }
    }

    private static convertGamesDBToGame(games: Document[]): Game[] {
        return games.map((game: Document) => {
            return this.convertGameDBToGame(game);
        });
    }

    private static convertGameDBToGame(game: Document): Game {
        const { _id, ...rest } = game.toJSON() as { _id: string };
        return {
            id: _id.toString(),
            ...rest,
        } as Game;
    }
}
