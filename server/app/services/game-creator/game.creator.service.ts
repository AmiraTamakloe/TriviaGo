import { EstablishConnection } from '@app/db';
import { Choice } from '@app/interfaces/choice';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameDB } from '@app/models/game';
import { MAX_DESCRIPTION_LENGTH, MAX_NUMBER_CHOICE, MAX_TIME_SECONDS, MIN_TIME_SECONDS, TIME_MULTIPLE, ID_SIZE } from '@common/constants';
import { Router } from 'express';
import { Service } from 'typedi';

interface ValidStatus {
    valid: boolean;
    errors: string[];
}
type ReturnType = [ValidStatus, boolean, boolean];

@Service()
export class GameCreatorService {
    router: Router;
    mongoDbConnector: EstablishConnection;

    async validGame(game: Game, isJson: string) {
        let validStatus: ValidStatus = { valid: true, errors: [] };
        if (isJson === 'true') {
            validStatus = this.checkRequired(game, validStatus);
        }

        await this.validTitle(game, validStatus);
        this.validDescription(game, validStatus);

        this.validDuration(game, validStatus);

        validStatus = this.validQuestions(game, validStatus);

        return validStatus;
    }
    async patchingGame(game: Game, id: string) {
        let validStatus: ValidStatus = { valid: true, errors: [] };
        for (const key of Object.keys(game)) {
            switch (key) {
                case 'title': {
                    const unchangedTitle = await GameDB.findById(id);
                    if (unchangedTitle.title === game.title || game.title === undefined) {
                        break;
                    }
                    await this.validTitle(game, validStatus);
                    break;
                }
                case 'description': {
                    if (game.description !== undefined) {
                        this.validDescription(game, validStatus);
                    }
                    break;
                }
                case 'duration': {
                    if (game.duration !== undefined) {
                        this.validDuration(game, validStatus);
                    }

                    break;
                }
                case 'questions': {
                    if (game.questions !== undefined) {
                        validStatus = this.validQuestions(game, validStatus);
                    }
                    break;
                }
            }
        }
        return validStatus;
    }

    async validTitle(game: Game, validStatus: ValidStatus) {
        if (game.title === undefined) {
            validStatus.valid = false;
            validStatus.errors.push('Le titre du jeu est obligatoire');
        } else {
            const gameTitleCheckup = await GameDB.find({ title: game.title });
            if (gameTitleCheckup.length) {
                validStatus.valid = false;
                validStatus.errors.push('Le titre du jeu est déjà utilisé');
            }
        }
    }

    async validId(id: string) {
        const regEx = /^[a-zA-Z0-9]{24}$/;
        if (!regEx.test(id)) {
            return false;
        }
        const gameICheckup = await GameDB.findById(id);
        if (gameICheckup) {
            return false;
        }
        return true;
    }

    validDescription(game: Game, validStatus: ValidStatus) {
        const regEx = /^[a-zA-Z\s]*$/;
        if (game.description !== undefined && (!regEx.test(game.description) || game.description.length > MAX_DESCRIPTION_LENGTH)) {
            validStatus.valid = false;
            validStatus.errors.push('La description ne doit pas dépasser 200 caractères et contenir que des lettres et des espaces');
        }
        return validStatus;
    }

    validDuration(game: Game, validStatus: ValidStatus) {
        if (game.duration === undefined || game.duration < MIN_TIME_SECONDS || game.duration > MAX_TIME_SECONDS) {
            validStatus.valid = false;
            validStatus.errors.push('Le temps doit être entre 10 et 60 secondes pour le jeu: ' + game.title);
        }
        return validStatus;
    }

    validQuestions(game: Game, validStatus: ValidStatus): ValidStatus {
        const questions = game.questions;
        if (questions === undefined || !questions.length) {
            validStatus.valid = false;
            validStatus.errors.push("Il n'y a pas de question pour le jeu: " + game.title);
            return validStatus;
        }
        questions.forEach((question) => {
            if (question.type === 'QCM') {
                validStatus = this.validQCM(question, validStatus);
            } else if (question.type === 'QRL') {
                validStatus = this.validateQRL(question, validStatus);
            } else {
                validStatus.valid = false;
                validStatus.errors.push("Une des questions n'est pas de type QCM: " + question.text);
            }
        });
        return validStatus;
    }

    validateQRL(question: Question, validStatus: ValidStatus) {
        if (question.text === undefined) {
            validStatus.valid = false;
            validStatus.errors.push('Le texte de la question est obligatoire');
        }
        if (question.points === undefined) {
            validStatus.valid = false;
            validStatus.errors.push('Le pointage de la question est obligatoire');
        }
        return validStatus;
    }

    validQCM(question: Question, validStatus: ValidStatus) {
        if (question.choices === undefined || question.choices.length < 2 || question.choices.length > MAX_NUMBER_CHOICE) {
            validStatus.valid = false;
            validStatus.errors.push('Vous devez mettre entre 2 et 4 choix de réponses: ' + question.text);
        } else {
            let hasTrue = false;
            let hasNoFalse = true;
            question.choices.forEach((choice) => {
                [validStatus, hasNoFalse, hasTrue] = this.validateChoice(choice, validStatus, [hasNoFalse, hasTrue]);
            });

            if (!hasTrue || hasNoFalse) {
                validStatus.valid = false;
                validStatus.errors.push('Vous devez avoir au moins une réponse fausse et une vraie pour la question: ' + question.text);
            }
        }
        if (question.points % TIME_MULTIPLE !== 0) {
            validStatus.valid = false;
            validStatus.errors.push('Votre score doit être un multiple de 10 pour la question ' + question.text);
        }
        return validStatus;
    }

    checkRequired(game: Game, validStatus: ValidStatus) {
        if (game.id === undefined) {
            validStatus.valid = false;
            validStatus.errors.push("Votre jeu a besoin d'un id");
        } else if (game.id.length !== ID_SIZE) {
            validStatus.valid = false;
            validStatus.errors.push('Votre id doit être de 24 caractères');
        }
        return validStatus;
    }
    private validateChoice(choice: Choice, validStatus: ValidStatus, [hasNoFalse, hasTrue]: [boolean, boolean]): ReturnType {
        if (
            typeof choice.isCorrect === 'boolean' ||
            choice.isCorrect === 'true' ||
            choice.isCorrect === 'false' ||
            choice.isCorrect === undefined ||
            choice.isCorrect === null
        ) {
            let myChoice;
            if (typeof choice.isCorrect === 'string') {
                myChoice = JSON.parse(choice.isCorrect);
            } else if (choice.isCorrect === undefined || choice.isCorrect === null) {
                myChoice = false;
            } else {
                myChoice = choice.isCorrect;
            }
            hasTrue = myChoice || hasTrue;
            hasNoFalse = hasNoFalse && myChoice;
        } else {
            validStatus.valid = false;
            validStatus.errors.push('Vous devez avoir des choix de réponses ayant un booléen pour isCorrect pour le choix: ' + choice.text);
        }
        return [validStatus, hasNoFalse, hasTrue];
    }
}
