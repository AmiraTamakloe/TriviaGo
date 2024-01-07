import { History } from '@app/models/history';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HistoryController {
    router: Router;
    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const history = await History.find();
                res.status(StatusCodes.OK).json(history);
            } catch (err) {
                res.status(StatusCodes.BAD_REQUEST).json('Error: ' + err);
            }
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const history = new History({
                gameName: req.body[0].gameName,
                date: req.body[0].date,
                playersNumber: req.body[0].playersNumber,
                bestScore: req.body[0].bestScore,
            });

            await history.save().then(() => {
                res.status(StatusCodes.OK).send(history);
            });
        });
        this.router.delete('/', async (req: Request, res: Response) => {
            History.deleteMany({}).then(() => res.sendStatus(StatusCodes.OK));
        });
    }
}
