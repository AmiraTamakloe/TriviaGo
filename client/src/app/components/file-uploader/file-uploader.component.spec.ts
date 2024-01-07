import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormValidationService } from '@app/services/form-validation/form-validation.service';
import { PopupService } from '@app/services/popup/popup.service';
import { HTTP_STATUS_BAD_REQUEST } from '@common/constants';
import { of, throwError } from 'rxjs';
import { FileUploaderComponent } from './file-uploader.component';

describe('FileUploaderComponent', () => {
    let component: FileUploaderComponent;
    let fixture: ComponentFixture<FileUploaderComponent>;
    let formValidationServiceSpy: jasmine.SpyObj<FormValidationService>;
    let routerSpy: jasmine.SpyObj<Router>;
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup', 'closePopup']);

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        formValidationServiceSpy = jasmine.createSpyObj('FormValidationService', ['postGame', 'uploadGame']);
        formValidationServiceSpy.uploadGame.and.returnValue(of({ success: true }));
        TestBed.configureTestingModule({
            declarations: [FileUploaderComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: FormValidationService, useValue: formValidationServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        fixture = TestBed.createComponent(FileUploaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set status to "initial" and update file on file selection', () => {
        const file = new File(['file contents'], 'example.txt', { type: 'text/plain' });
        const event = { target: { files: [file] } } as unknown as Event;

        component.onChange(event);

        expect(component.status).toBe('initial');
        expect(component.file).toBe(file);
    });

    it('should set status to "success" on upload error', fakeAsync(() => {
        const file = new File([], 'test-file.txt');
        component.file = file;
        formValidationServiceSpy.uploadGame.and.returnValue(of(file));
        component.onUpload();
        tick();
        expect(component.status).toBe('success');
    }));

    it('should set status to "fail" on upload error', fakeAsync(() => {
        const file = new File([], 'test-file.txt');
        component.file = file;
        const errorResponse = new HttpErrorResponse({ status: HTTP_STATUS_BAD_REQUEST, error: 'Bad request' });
        formValidationServiceSpy.uploadGame.and.returnValue(throwError(() => errorResponse));
        component.onUpload();
        tick();
        expect(component.status).toBe('fail');
    }));
});
