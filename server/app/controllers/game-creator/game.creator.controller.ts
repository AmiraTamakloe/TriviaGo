/* eslint-disable no-underscore-dangle */
import { Game } from '@app/interfaces/game';
import { GameDB } from '@app/models/game';
import { GameCreatorService } from '@app/services/game-creator/game.creator.service';
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_CREATED_REQUEST } from '@common/constants';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Service } from 'typedi';

interface ValidStatus {
    valid: boolean;
    errors: string[];
}

@Service()
export class GameCreatorController {
    router: Router;
    constructor(private readonly gameCreatorService: GameCreatorService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.patch('/:id', async (req: Request, res: Response) => {
            const myGame: Game = {
                visible: req.body.visible,
                title: req.body.title,
                description: req.body.description,
                duration: req.body.duration,
                questions: req.body.questions,
            };
            if (await GameDB.findById(req.params.id)) {
                const validGame: ValidStatus = await this.gameCreatorService.patchingGame(myGame, req.params.id);

                if (validGame.valid) {
                    GameDB.updateOne(
                        { _id: req.params.id },
                        {
                            $set: {
                                visible: req.body.visible,
                                title: req.body.title,
                                description: req.body.description,
                                duration: req.body.duration,
                                lastModification: req.body.lastModification,
                                questions: req.body.questions,
                            },
                        },
                    ).then(() => res.sendStatus(StatusCodes.OK));
                } else {
                    res.status(HTTP_STATUS_BAD_REQUEST).send(validGame.errors);
                }
            } else {
                const game = new GameDB({
                    $schema: req.body.$schema,
                    id: req.body.id,
                    title: req.body.title,
                    description: req.body.description,
                    duration: req.body.duration,
                    lastModification: req.body.lastModification,
                    questions: req.body.questions,
                });
                const validGame: ValidStatus = await this.gameCreatorService.validGame(myGame, req.query.isJson as string);

                if (!validGame.valid) {
                    res.status(StatusCodes.CONFLICT).send(validGame.errors);
                    return;
                }
                game.save().then(() => {
                    res.sendStatus(HTTP_STATUS_CREATED_REQUEST);
                });
            }
        });

        this.router.patch('/:id/toggleVisibility', async (req: Request, res: Response) => {
            const game = await GameDB.findById(req.params.id);
            if (!game) {
                res.status(StatusCodes.NOT_FOUND).json({ message: 'Game not found' });
            } else {
                game.visible = !game.visible;
                await game.save().then(() => res.status(StatusCodes.OK).send(game));
            }
        });

        this.router.delete('/:id', async (req: Request, res: Response) => {
            GameDB.findByIdAndDelete(req.params.id).then((game) => res.status(StatusCodes.OK).send(game));
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const { $schema, id, title, description, duration, lastModification, questions } = req.body;
            const game = new GameDB({
                $schema: req.body.$schema,
                visible: false,
                title: req.body.title,
                description: req.body.description,
                duration: req.body.duration,
                lastModification: req.body.lastModification,
                questions: req.body.questions,
            });

            const myGame: Game = {
                $schema,
                visible: false,
                id,
                title,
                description,
                duration,
                lastModification,
                questions,
            };

            const validGame: ValidStatus = await this.gameCreatorService.validGame(myGame, req.query.isJson as string);
            if (!validGame.valid) {
                res.status(HTTP_STATUS_BAD_REQUEST).send(validGame.errors);
                return;
            }
            if (await this.gameCreatorService.validId(id)) {
                game._id = id;
            } else {
                game._id = new ObjectId();
            }
            game.save().then(() => {
                res.status(HTTP_STATUS_CREATED_REQUEST).send(game);
            });
        });
    }
}
