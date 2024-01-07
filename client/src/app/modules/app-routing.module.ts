import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileUploaderComponent } from '@app/components/file-uploader/file-uploader.component';
import { QuestionTemplateComponent } from '@app/components/question-template/question-template.component';
import { AdministrationPageComponent } from '@app/pages/administration-page/administration-page.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HistoryComponent } from '@app/pages/history/history.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { WaitingScreenPageComponent } from '@app/pages/waiting-screen-page/waiting-screen-page.component';
import { AuthGuardService } from '@app/services/auth-guard/auth-guard.service';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'file', component: FileUploaderComponent },
    { path: 'games/test/:id', component: GamePageComponent },
    { path: 'admin', component: AdministrationPageComponent, canActivate: [AuthGuardService] },
    { path: 'modification', component: QuestionTemplateComponent },
    { path: 'modification/:id', component: QuestionTemplateComponent },
    { path: 'games', component: CreationPageComponent },
    { path: 'admin', component: AdministrationPageComponent, canActivate: [AuthGuardService] },
    { path: 'history', component: HistoryComponent },
    { path: 'games/create/:id', component: GamePageComponent },
    { path: 'games/waiting/:id', component: WaitingScreenPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
