/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { GameModeSelectionService } from '@app/services/game-mode-selection/game-mode-selection.service';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';

describe('PlayerInfoComponent', () => {
    let component: PlayerInfoComponent;
    let fixture: ComponentFixture<PlayerInfoComponent>;
    let playersListManagementServiceSpy: jasmine.SpyObj<PlayersListManagementService>;
    let gameModeSelectionServiceSpy: GameModeSelectionService;

    beforeEach(async () => {
        playersListManagementServiceSpy = jasmine.createSpyObj('PlayersListManagementService', [
            'init',
            'matchAboutToStart',
            'playersPointsList',
            'playersList',
            'playersOutList',
            'endGame',
            { playersList: ['ced', 'hector'] },
            { playerOutList: ['jean', 'karim'] },
        ]);
        await TestBed.configureTestingModule({
            declarations: [PlayerInfoComponent],
            providers: [{ provide: PlayersListManagementService, useValue: playersListManagementServiceSpy }],
            imports: [MatSnackBarModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerInfoComponent);
        gameModeSelectionServiceSpy = TestBed.inject(GameModeSelectionService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should initialize playerPoints to 0', () => {
        component['playerPoint'] = 0;
        expect(component.playerPoint).toBe(0);
    });

    it('should set playerPoints to 10', () => {
        component.playerPoints = 10;
        expect(component.playerPoints).toBe(10);
    });

    it('should get playerPoint', () => {
        component.playerPoints = 5;
        expect(component.playerPoint).toBe(5);
    });

    it('should set playerPoint to 7', () => {
        component['playerPoint'] = 7;
        expect(component.playerPoints).toBe(7);
    });

    it('should get playerName', () => {
        expect(component['playerName']).toBe('Cedrick');
    });

    it('should set playerName to "Alice"', () => {
        component['playerName'] = 'Alice';
        expect(component['playerName']).toBe('Alice');
    });

    it('should set playerPoints to 5 and update playerPoint', () => {
        component.playerPoints = 5;
        expect(component.playerPoint).toBe(5);
    });

    it('should set playerPoint to 7 and update playerPoints', () => {
        gameModeSelectionServiceSpy.setSelectedMode('solo');
        component['playerPoint'] = 7;
        expect(component.playerPoints).toBe(7);
    });

    it('should get playerspoints', () => {
        gameModeSelectionServiceSpy.setSelectedMode('multi');
        const points = [1, 2];
        playersListManagementServiceSpy['playersPointsList'] = points;
        expect(component.playersPoints).toBe(points);
    });

    it('should return the correct playersOutPoints', () => {
        const expectedPlayersOutPointsList = [10, 20];
        playersListManagementServiceSpy.playersOutPointsList = expectedPlayersOutPointsList;
        const result = component.playersOutPoints;
        expect(result).toEqual(expectedPlayersOutPointsList);
    });

    it('should get the correct playersNameList', () => {
        const result = component.playersNameList;
        expect(result).toEqual(playersListManagementServiceSpy.playersList);
    });

    it('should get the correct playersOutList', () => {
        const result = component.playersOutNameList;
        expect(result).toEqual(playersListManagementServiceSpy.playersOutList);
    });
});
