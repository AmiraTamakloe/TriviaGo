/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';
import { PlayerListTableComponent } from './player-list-table.component';

describe('PlayerListTableComponent', () => {
    let component: PlayerListTableComponent;
    let fixture: ComponentFixture<PlayerListTableComponent>;
    let playersListManagementServiceSpy: PlayersListManagementService;
    beforeEach(() => {
        playersListManagementServiceSpy = jasmine.createSpyObj(
            'PlayersListManagementService',
            ['init', 'scoreAttribution', 'closePopup', 'wrongAnswer', 'endGame'],
            {
                playersList: ['Player1', 'Player2', 'Player3'],
                playersPointsList: [0, 0, 0],
                playersMap: {},
            },
        );
        TestBed.configureTestingModule({
            declarations: [],
            imports: [PlayerListTableComponent, MatSnackBarModule, BrowserAnimationsModule],
            providers: [MatSnackBarModule],
        }).compileComponents();
        playersListManagementServiceSpy = TestBed.inject(PlayersListManagementService);
        fixture = TestBed.createComponent(PlayerListTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get players name list', () => {
        expect(component.playersNameList).toBeTruthy();
    });

    it('should get players points list', () => {
        expect(component.playersPoints).toBeTruthy();
    });

    it('should get players out name list', () => {
        expect(component.playersOutNameList).toBeTruthy();
    });

    it('should get players out points list', () => {
        expect(component.playersOutPoints).toBeTruthy();
    });

    it('should call updateTable on playersListChange', () => {
        spyOn(component, 'updateTable');
        playersListManagementServiceSpy.playersListChange.emit();
        component.ngOnInit();
        expect(component.updateTable).toHaveBeenCalled();
    });

    it('should call updateTable on playersPointsListChange', () => {
        spyOn(component, 'updateTable');
        playersListManagementServiceSpy.playersPointsListChange.emit();
        component.ngOnInit();
        expect(component.updateTable).toHaveBeenCalled();
    });

    it('should call updateTable on playersOutListChange', () => {
        spyOn(component, 'updateTable');
        component.playersMap.set('Player1', { name: 'Player1', points: 0, state: '#ff0000' });
        playersListManagementServiceSpy.playersOutListChange.emit('Player1');
        component.ngOnInit();
        expect(component.updateTable).toHaveBeenCalled();
    });

    it('should change state to yellow on playerInteraction', () => {
        spyOn(component, 'updateTable');
        component.playersMap.set('Player1', { name: 'Player1', points: 0, state: '#ff0000' });
        playersListManagementServiceSpy.playerInteraction.emit({ playerName: 'Player1', step: 0 });
        component.ngOnInit();
        expect(component.updateTable).toHaveBeenCalled();
    });

    it('should change state to green on playerInteraction', () => {
        spyOn(component, 'updateTable');
        component.playersMap.set('Player1', { name: 'Player1', points: 0, state: '#ff0000' });
        playersListManagementServiceSpy.playerInteraction.emit({ playerName: 'Player1', step: 1 });
        component.ngOnInit();
        expect(component.updateTable).toHaveBeenCalled();
    });

    it('should change state to red on resetColor', () => {
        spyOn(component, 'updateTable');
        component.playersMap.set('Player1', { name: 'Player1', points: 0, state: '#ff0000' });
        playersListManagementServiceSpy.resetColor.emit();
        component.ngOnInit();
        expect(component.updateTable).toHaveBeenCalled();
    });

    it('should sort players by points', async () => {
        component.playersMap.set('Player1', { name: 'Player1', points: 2, state: '#ff0000' });
        component.playersMap.set('Player2', { name: 'Player2', points: 1, state: '#ff0000' });
        component.playersMap.set('Player3', { name: 'Player3', points: 3, state: '#ff0000' });
        await component.updateTable();
        component.sortData({ active: 'points', direction: 'asc' });
        expect(component.sortedData[1].name).toEqual('Player2');
        expect(component.sortedData[2].name).toEqual('Player1');
        expect(component.sortedData[3].name).toEqual('Player3');
    });

    it('should sort players by name', async () => {
        component.playersMap.set('Player1', { name: 'Player1', points: 2, state: '#ff0000' });
        component.playersMap.set('Player2', { name: 'Player2', points: 1, state: '#ff0000' });
        component.playersMap.set('Player3', { name: 'Player3', points: 3, state: '#ff0000' });
        await component.updateTable();
        component.sortData({ active: 'name', direction: 'asc' });
        expect(component.sortedData[1].name).toEqual('Player1');
        expect(component.sortedData[2].name).toEqual('Player2');
        expect(component.sortedData[3].name).toEqual('Player3');
    });

    it('should sort players by state', async () => {
        component.playersMap.set('Player1', { name: 'Player1', points: 2, state: '#ff0000' });
        component.playersMap.set('Player2', { name: 'Player2', points: 1, state: '#ff0000' });
        component.playersMap.set('Player3', { name: 'Player3', points: 3, state: '#ff0000' });
        await component.updateTable();
        component.sortData({ active: 'state', direction: 'asc' });
        expect(component.sortedData[1].name).toEqual('Player1');
        expect(component.sortedData[2].name).toEqual('Player2');
        expect(component.sortedData[3].name).toEqual('Player3');
    });

    it('should not sort players when sort active is not defined', async () => {
        component.playersMap.set('Player1', { name: 'Player1', points: 2, state: '#ff0000' });
        component.playersMap.set('Player2', { name: 'Player2', points: 1, state: '#ff0000' });
        component.playersMap.set('Player3', { name: 'Player3', points: 3, state: '#ff0000' });
        await component.updateTable();
        component.sortData({ active: '', direction: 'asc' });
        expect(component.sortedData[1].name).toEqual('Player1');
        expect(component.sortedData[2].name).toEqual('Player2');
        expect(component.sortedData[3].name).toEqual('Player3');
    });

    it('should call compare if two points are equal', () => {
        spyOn(component, 'compare');
        component.comparePoints({ name: 'Player1', points: 2, state: '#ff0000' }, { name: 'Player2', points: 2, state: '#ff0000' }, true);
        expect(component.compare).toHaveBeenCalled();
    });

    it('should update points', () => {
        component.playersMap.set('Player1', { name: 'Player1', points: 2, state: '#ff0000' });
        component.playersMap.set('Player2', { name: 'Player2', points: 1, state: '#ff0000' });
        component.playersMap.set('Player3', { name: 'Player3', points: 3, state: '#ff0000' });

        component.updatePoints();
        expect(component.playersMap.get('Player1').points).toEqual(2);
        expect(component.playersMap.get('Player2').points).toEqual(1);
        expect(component.playersMap.get('Player3').points).toEqual(3);
    });

    it('should call socketClientService.send with "mutePlayer" when checkbox is checked', () => {
        spyOn(component['socketClientService'], 'send');
        const playerName = 'testPlayer';
        const mockEvent = { target: { checked: true } };
        component.onCheckboxChange(mockEvent, playerName);
        expect(component['socketClientService'].send).toHaveBeenCalledWith('mutePlayer', playerName);
    });

    it('should call socketClientService.send with "unmutePlayer" when checkbox is checked', () => {
        spyOn(component['socketClientService'], 'send');
        const playerName = 'testPlayer';
        const mockEvent = { target: { checked: false } };
        component.onCheckboxChange(mockEvent, playerName);
        expect(component['socketClientService'].send).toHaveBeenCalledWith('unmutePlayer', playerName);
    });

    it('updatePoints should score of players', () => {
        playersListManagementServiceSpy.playersMap.set('Player1', 2);
        playersListManagementServiceSpy.playersMap.set('Player2', 1);
        playersListManagementServiceSpy.playersMap.set('Player3', 3);

        component.playersMap.set('Player1', { name: 'Player1', points: 0, state: '#ff0000' });
        component.playersMap.set('Player2', { name: 'Player2', points: 0, state: '#ff0000' });
        component.playersMap.set('Player3', { name: 'Player3', points: 0, state: '#ff0000' });
        component.updatePoints();
        expect(component.playersMap.get('Player1').points).toEqual(2);
        expect(component.playersMap.get('Player2').points).toEqual(1);
        expect(component.playersMap.get('Player3').points).toEqual(3);
    });
});
