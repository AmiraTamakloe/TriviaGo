import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { FileUploaderComponent } from '@app/components/file-uploader/file-uploader.component';
import { HeaderComponent } from './header.component';

class MatDialogMock {
    open() {
        return {
            afterClosed: () => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return { subscribe: () => {} };
            },
        };
    }
}

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HeaderComponent],
            providers: [{ provide: MatDialog, useClass: MatDialogMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent],
            imports: [],
        });
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call dialog.open when displayImport is called', () => {
        spyOn(component.dialog, 'open').and.callThrough();

        component.displayImport();

        expect(component.dialog.open).toHaveBeenCalledWith(FileUploaderComponent);
    });
});
