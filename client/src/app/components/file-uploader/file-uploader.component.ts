/* eslint-disable max-params */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormValidationService } from '@app/services/form-validation/form-validation.service';
import { PopupService } from '@app/services/popup/popup.service';
import { POPUP_DURATION } from '@common/constants';
@Component({
    selector: 'app-file-uploader',
    templateUrl: './file-uploader.component.html',
    styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent {
    status: 'initial' | 'uploading' | 'success' | 'fail' = 'initial';
    error: string | null = null;
    file: File | null = null;

    constructor(
        private formValidationService: FormValidationService,
        private popupService: PopupService,
        private router: Router,
        private zone: NgZone,
    ) {}

    onChange(event: Event) {
        const files: FileList | null = (event.target as HTMLInputElement).files;
        if (files !== null) {
            const file: File = files[0];
            if (file) {
                this.status = 'initial';
                this.file = file;
            }
        }
    }

    onUpload() {
        if (this.file) {
            const formData = new FormData();
            formData.append('file', this.file, this.file.name);
            const fileUploaded = this.formValidationService.uploadGame(this.file);
            this.status = 'uploading';
            fileUploaded.subscribe({
                next: () => {
                    this.status = 'success';
                    this.popupService.openPopup('Le jeu a été importé avec succès', POPUP_DURATION);
                    this.zone.run(() => {
                        this.router.navigate(['']);
                    });
                },
                error: (error: HttpErrorResponse) => {
                    this.status = 'fail';
                    this.error = error.error;

                    return error;
                },
            });
        }
    }
}
