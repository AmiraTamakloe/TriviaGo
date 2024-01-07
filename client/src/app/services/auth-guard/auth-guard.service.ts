import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService {
    private password: string;

    setPassword(newPassword: string) {
        this.password = newPassword;
    }

    getPassword(): string {
        return this.password;
    }

    isAuthorized(): boolean {
        return this.password === 'Tamz';
    }

    canActivate(): boolean {
        const isValid = this.isAuthorized();
        if (isValid) this.setPassword('');
        return isValid;
    }
}
