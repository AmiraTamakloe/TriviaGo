import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModificationGameService {
    private isModified: boolean = false;

    get isDiff(): boolean {
        return this.isModified;
    }
    set isDiff(value: boolean) {
        this.isModified = value;
    }
}
