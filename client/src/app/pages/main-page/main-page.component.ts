/* eslint-disable max-params */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PasswordAdministatorComponent } from '@app/components/password-administator/password-administator.component';
import { AuthGuardService } from '@app/services/auth-guard/auth-guard.service';
import JoinMatchService from '@app/services/join-match/join-match.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'TRIVIA GO';
    private password: string;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private authGuardService: AuthGuardService,
        private matchManagementService: MatchManagementService,
        private joinMatchService: JoinMatchService,
    ) {
        this.matchManagementService.init();
    }
    openDialogJoin(code?: string | undefined, name?: string | undefined): void {
        this.joinMatchService.openDialog(code, name);
    }

    openDialog(message?: string | undefined): void {
        this.dialog
            .open(PasswordAdministatorComponent, {
                data: { password: this.password, message },
            })
            .afterClosed()
            .subscribe((result) => {
                this.handleDialogResult(result);
            });
    }

    private handleDialogResult(result: string): void {
        this.authGuardService.setPassword(result);
        if (this.authGuardService.isAuthorized()) this.router.navigate(['admin']);
        else this.checkEmptyPassword(result);
    }

    private checkEmptyPassword(result: string): void {
        if (result) {
            this.openDialog('Le mot de passe est invalide');
        }
    }
}
