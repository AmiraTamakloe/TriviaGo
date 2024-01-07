/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

export interface Player {
    name: string;
    points: number;
    state: '#ff0000' | '#00ff00' | '#ffff00' | '#000000';
}

@Component({
    selector: 'app-player-list-table',
    templateUrl: './player-list-table.component.html',
    styleUrls: ['./player-list-table.component.scss'],
    standalone: true,
    imports: [MatSortModule, CommonModule, MatTableModule],
})
export class PlayerListTableComponent implements OnInit {
    playersMap = new Map();
    sortedData: Player[];
    protected displayedColumns: string[] = ['name', 'points', 'state', 'chat'];
    protected red: string = '#ff0000';
    protected green: string = '#00ff00';
    protected yellow: string = '#ffff00';
    protected black: string = '#000000';
    protected players: Player[];

    constructor(
        private playersListManagementService: PlayersListManagementService,
        private changeDetectorRef: ChangeDetectorRef,
        private socketClientService: SocketClientService,
    ) {
        this.fillPlayerMap();
    }

    get playersNameList(): string[] {
        return this.playersListManagementService.playersList;
    }

    get playersPoints() {
        return this.playersListManagementService.playersPointsList;
    }

    get playersOutNameList(): string[] {
        return this.playersListManagementService.playersOutList;
    }

    get playersOutPoints() {
        return this.playersListManagementService.playersOutPointsList;
    }

    async ngOnInit(): Promise<void> {
        this.playersListManagementService.init();
        this.playersListManagementService.playersListChange.subscribe(async () => {
            await this.updateTable();
        });
        this.playersListManagementService.playersPointsListChange.subscribe(async () => {
            await this.updateTable();
        });
        this.playersListManagementService.playersOutListChange.subscribe(async (name: string) => {
            this.playersMap.get(name)!.state = this.black;
            await this.updateTable();
        });
        this.playersListManagementService.playerInteraction.subscribe(async (val: { playerName: string; step: number }) => {
            if (val.step === 0) {
                this.playersMap.get(val.playerName)!.state = this.yellow;
            } else if (val.step === 1) {
                this.playersMap.get(val.playerName)!.state = this.green;
            }
            await this.updateTable();
        });
        this.playersListManagementService.resetColor.subscribe(async () => {
            this.playersMap.forEach((player) => {
                if (player.state !== this.black) {
                    player.state = this.red;
                }
            });
            await this.updateTable();
        });
        await this.createTable();
        this.sortedData = this.players.slice();
    }

    fillPlayerMap() {
        for (const player of this.playersListManagementService.playersList) {
            this.playersMap.set(player, {
                name: player,
                points: 0,
                state: this.red,
            });
        }
    }

    sortData(sort: Sort) {
        const data = this.players.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedData = data;
            return;
        }

        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                case 'state':
                    return this.compare(a.state, b.state, isAsc);
                case 'points':
                    return this.comparePoints(a, b, isAsc);
                default:
                    return 0;
            }
        });
    }

    compare(a: string, b: string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    comparePoints(a: Player, b: Player, isAsc: boolean) {
        if (a.points === b.points) {
            return this.compare(a.name, b.name, isAsc);
        }
        return (a.points < b.points ? -1 : 1) * (isAsc ? 1 : -1);
    }

    updatePoints() {
        this.playersListManagementService.playersMap.forEach((value, key) => {
            this.playersMap.get(key)!.points = value;
        });
    }

    async updateTable() {
        this.updatePoints();
        await this.createTable();
        this.sortedData = this.players.slice();
        this.detectChanges();
    }

    async createTable() {
        const playersList: Player[] = [];
        this.playersMap.forEach((player) => {
            playersList.push(player);
        });
        this.players = playersList;
    }

    detectChanges(): void {
        this.changeDetectorRef.detectChanges();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async onCheckboxChange(event: any, playerName: string) {
        if (event.target.checked) {
            this.socketClientService.send('mutePlayer', playerName);
        } else {
            this.socketClientService.send('unmutePlayer', playerName);
        }
    }
}
