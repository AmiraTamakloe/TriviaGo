import { TestBed } from '@angular/core/testing';
import { AuthGuardService } from './auth-guard.service';

describe('AuthGuardService', () => {
    let service: AuthGuardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthGuardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should correctly set password', () => {
        const inputPassword = 'Test';
        service.setPassword(inputPassword);
        expect(service.getPassword()).toBe(inputPassword);
    });

    it('should allow access if the password is right', () => {
        service.setPassword('Tamz');
        const canActivate = service.canActivate();
        expect(canActivate).toBe(true);
    });

    it('should deny access if the password is not the right one', () => {
        service.setPassword('tamz');
        const canActivate = service.canActivate();
        expect(canActivate).toBe(false);
    });

    it('should not allow access if the password is not configured', () => {
        const canActivate = service.canActivate();
        expect(canActivate).toBe(false);
    });
});
