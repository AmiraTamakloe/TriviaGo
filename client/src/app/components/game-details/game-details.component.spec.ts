/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { DownloadGameJsonFileService } from '@app/services/download-game-json-file/download-game-json-file.service';
import { GameService } from '@app/services/game/game.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { ModificationGameService } from '@app/services/modification-game/modification-game.service';
import { PopupService } from '@app/services/popup/popup.service';
import { VISIBLE_POPUP_DURATION } from '@common/constants';
import { of } from 'rxjs';
import { GameDetailsComponent } from './game-details.component';

describe('GameDetailsComponent', () => {
    let component: GameDetailsComponent;
    let fixture: ComponentFixture<GameDetailsComponent>;
    const iconMore = 'expand_more';
    const iconLess = 'expand_less';
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let matchManagementServiceSpy: jasmine.SpyObj<MatchManagementService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let modificationGameServiceSpy: jasmine.SpyObj<ModificationGameService>;
    let downloadGameJsonFileServiceSpy: jasmine.SpyObj<DownloadGameJsonFileService>;
    const game: Game = {
        id: '5f8792b55d9d972ac8348e52',
        visible: true,
        title: 'Game 1',
        description: 'Description for Game 1',
        duration: 60,
        questions: [
            {
                type: 'QCM',
                text: 'Question 1 for Game 1',
                points: 2,
                choices: [{ text: 'Choice 1', isCorrect: true }],
            },
        ],
        $schema: '',
        lastModification: '',
    };

    beforeEach(async () => {
        matchManagementServiceSpy = jasmine.createSpyObj('MatchManagementService', ['createMatch', 'createTestMatch']);
        downloadGameJsonFileServiceSpy = jasmine.createSpyObj('DownloadGameJsonFileService', ['download', 'copyWithoutVisibleAttribute']);
        modificationGameServiceSpy = jasmine.createSpyObj('ModificationGameService', ['isDiff']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup', 'closePopup']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['fetchGameById', 'patchGameVisibility', 'removeGame']);
        TestBed.configureTestingModule({
            declarations: [GameDetailsComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ModificationGameService, useValue: modificationGameServiceSpy },
                { provide: DownloadGameJsonFileService, useValue: downloadGameJsonFileServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: MatchManagementService, useValue: matchManagementServiceSpy },
            ],

            imports: [MatIconModule, HttpClientModule, MatSnackBarModule],
        });
        fixture = TestBed.createComponent(GameDetailsComponent);
        component = fixture.componentInstance;
        component.game = game;
        gameServiceSpy.fetchGameById.and.returnValue(of(game));
        gameServiceSpy.patchGameVisibility.and.returnValue(of([]));
        fixture.detectChanges();
    });

    it('isSelected should change value when displayDetails() is called', () => {
        component['isSelected'] = false;
        component.displayDetails();
        expect(component['isSelected']).toBeTruthy();
    });

    it('icon expand_more should be set to expand_less when displayDetails() is called', () => {
        component['icon'] = iconMore;
        component.displayDetails();
        expect(component['icon']).toEqual(iconLess);
    });

    it('icon expand_less should be set to expand_more when displayDetails() is called', () => {
        component['icon'] = iconLess;
        component.displayDetails();
        expect(component['icon']).toEqual(iconMore);
    });

    it('should call dialog open() when displayQuestions is called ()', () => {
        component.displayQuestions();

        const expectedDialogConfig = jasmine.objectContaining({ autoFocus: true });
        expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), {
            data: { questions: component.game.questions, dialogConfig: expectedDialogConfig },
            panelClass: 'scrollable-dialog',
        });
    });

    it('should navigate to the correct route if the game is available when startTestingGame() is called', async () => {
        spyOn(component as any, 'checkIfGameIsAvailable').and.resolveTo(true);
        spyOn(component.updateView, 'emit');

        await component.startTestingGame();
        expect(component.updateView.emit).not.toHaveBeenCalled();
    });

    it('should navigate to the correct route if the game is available when createMatch() is called', async () => {
        spyOn(component as any, 'checkIfGameIsAvailable').and.resolveTo(true);
        spyOn(component.updateView, 'emit');

        await component.createMatch();

        expect(matchManagementServiceSpy.createMatch).toHaveBeenCalledWith(component.game.id);
        expect(component.updateView.emit).not.toHaveBeenCalled();
    });

    it('should trigger the emitter if the game is unavailable when startTestingGame() is called', async () => {
        spyOn(component as any, 'checkIfGameIsAvailable').and.resolveTo(false);

        spyOn(component.updateView, 'emit');

        await component.startTestingGame();

        expect(component.updateView.emit).toHaveBeenCalled();
    });

    it('should trigger the emitter if the game is unavailable when createMatch() is called', async () => {
        spyOn(component as any, 'checkIfGameIsAvailable').and.resolveTo(false);

        spyOn(component.updateView, 'emit');

        await component.createMatch();

        expect(component.updateView.emit).toHaveBeenCalled();
    });

    it('should call the service fetchVisibleGames() when checkIfGameIsAvailable() is called', fakeAsync(() => {
        component['checkIfGameIsAvailable']();
        tick();
        expect(gameServiceSpy.fetchGameById).toHaveBeenCalled();
    }));

    it('should set isDiff to true and navigate to the modification page', () => {
        component.modifGame(game.id);
        expect(modificationGameServiceSpy.isDiff).toBe(true);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['modification/' + game.id]);
    });

    it('should export a game and display an alert', () => {
        component.exportGame(game);
        expect(downloadGameJsonFileServiceSpy.download).toHaveBeenCalledWith(game);
    });

    it('should have attribute icon initialized to expand_more', () => {
        expect(component['icon']).toEqual(iconMore);
    });

    it('should call changeVisibility and update game visibility', () => {
        const initialVisibility = component.game.visible;
        component.changeVisibility();
        expect(gameServiceSpy.patchGameVisibility).toHaveBeenCalledWith(component.game.id);
        expect(component.game.visible).toBe(!initialVisibility);
    });

    it('should open a popup when changeVisibility is called', () => {
        component.game.visible = false;
        component.changeVisibility();
        expect(popupServiceSpy.openPopup).toHaveBeenCalledWith('Le jeu est visible', VISIBLE_POPUP_DURATION);
    });

    it('should delete the game when confirmed in the dialog', () => {
        const falseGame: Game = {
            id: '5f8792b55d9d972ac8348e52',
            visible: false,
            title: 'Game 1',
            description: 'Description for Game 1',
            duration: 60,
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 1',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
            $schema: '',
            lastModification: '',
        };
        component.game = falseGame;
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
        (dialogSpy.open as jasmine.Spy).and.returnValue(dialogRefSpyObj);
        gameServiceSpy.removeGame(falseGame.id);
        spyOn(window, 'alert');
        component.deleteGame(game.id);
        expect(window.alert).toHaveBeenCalledWith('Game 1 supprimé');
    });

    it('should return false if the game is not available when checkIfGameIsAvailable() is called', async () => {
        spyOn(component as any, 'checkIfGameIsAvailable').and.resolveTo(false);
        const result = await (component as any).checkIfGameIsAvailable();
        expect(result).toBeFalse();
    });
});
