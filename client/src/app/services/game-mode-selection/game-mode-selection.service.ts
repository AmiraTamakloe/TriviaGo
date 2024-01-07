import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameModeSelectionService {
    private isMultiValue: boolean = false;
    private selectedGameMode = new BehaviorSubject<string>('game');

    get isMultiplayer(): boolean {
        return this.isMultiValue;
    }
    getSelectedMode(): Observable<string> {
        return this.selectedGameMode.asObservable();
    }

    setSelectedMode(mode: string) {
        this.selectedGameMode.next(mode);
        this.isMultiValue = mode === 'multi';
    }
}
