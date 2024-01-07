import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import DbGameFinder from '@app/classes/db-game-finder/db-game-finder';

@Service()
export class GameInfosController {
    router: Router;
    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.get('/', async (_req: Request, res: Response) => {
            try {
                let games;
                switch (_req.query.isGameVisible) {
                    case 'true': {
                        games = await DbGameFinder.findVisibleGames();
                        res.status(StatusCodes.OK).json(games);
                        break;
                    }
                    case undefined: {
                        games = await DbGameFinder.findAllGames();
                        res.status(StatusCodes.OK).json(games);
                        break;
                    }
                    default: {
                        res.status(StatusCodes.BAD_REQUEST).json(games);
                        break;
                    }
                }
            } catch (err) {
                res.status(StatusCodes.BAD_REQUEST).json('Error: ' + err);
            }
        });
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const game = await DbGameFinder.findById(req.params.id);
                res.status(StatusCodes.OK).json(game);
            } catch (err) {
                res.status(StatusCodes.BAD_REQUEST).json('Error: ' + err);
            }
        });
    }
}
