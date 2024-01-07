import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PasswordAdministatorComponent } from './password-administator.component';

describe('PasswordAdministatorComponent', () => {
    let component: PasswordAdministatorComponent;
    let fixture: ComponentFixture<PasswordAdministatorComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PasswordAdministatorComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        TestBed.configureTestingModule({
            declarations: [],
            imports: [MatDialogModule, PasswordAdministatorComponent, BrowserAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: { password: '', message: '' } },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PasswordAdministatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the correct data', () => {
        const expectedPassword = '';
        const expectedMessage = '';
        expect(component.data.password).toBe(expectedPassword);
        expect(component.data.message).toBe(expectedMessage);
    });

    it('should close dialog using on enter', () => {
        component.onEnter();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
