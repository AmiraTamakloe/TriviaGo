import { HttpException } from '@app/classes/http-exception/http.exception';
import { GameCreatorController } from '@app/controllers/game-creator/game.creator.controller';
import { GameInfosController } from '@app/controllers/game-info/game.info.controller';
import { EstablishConnection } from '@app/db';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { HistoryController } from './controllers/history-controller/history.controller';
import { PasswordController } from './controllers/password/password.controller';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameInfoController: GameInfosController,
        private readonly gameCreatorController: GameCreatorController,
        private readonly passwordController: PasswordController,
        private readonly historyController: HistoryController,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/game', this.gameInfoController.router);
        this.app.use('/createMatch', this.gameCreatorController.router);
        this.app.use('/password', this.passwordController.router);
        this.app.use('/history', this.historyController.router);
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());

        // Connect app to db
        const mongoDbConnector = new EstablishConnection();
        mongoDbConnector.connectionToDB();
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces  leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
