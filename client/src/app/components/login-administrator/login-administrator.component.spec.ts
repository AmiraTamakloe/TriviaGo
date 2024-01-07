import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginAdministratorComponent } from './login-administrator.component';

describe('LoginAdministratorComponent', () => {
    let component: LoginAdministratorComponent;
    let fixture: ComponentFixture<LoginAdministratorComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<LoginAdministratorComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule, LoginAdministratorComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { code: '', name: '' } },
                { provide: MatDialogRef, useValue: dialogRefSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginAdministratorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog using on enter', () => {
        component.onEnter();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
