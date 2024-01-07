import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { CountdownPopupComponent } from '@app/components/countdown-popup/countdown-popup.component';
import { FileUploaderComponent } from '@app/components/file-uploader/file-uploader.component';
import { GameDetailsComponent } from '@app/components/game-details/game-details.component';
import { GameListComponent } from '@app/components/game-list/game-list.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { HistoryListComponent } from '@app/components/history-list/history-list.component';
import { PasswordAdministatorComponent } from '@app/components/password-administator/password-administator.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { QuestionDescriptionComponent } from '@app/components/question-description/question-description.component';
import { QuestionListComponent } from '@app/components/question-list/question-list.component';
import { QuestionTemplateComponent } from '@app/components/question-template/question-template.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdministrationPageComponent } from '@app/pages/administration-page/administration-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { GameService } from '@app/services/game/game.service';
import { ButtonComponent } from './components/button/button.component';
import { HistogramSliderComponent } from './components/histogram-slider/histogram-slider.component';
import { LoginAdministratorComponent } from './components/login-administrator/login-administrator.component';
import { PlayAreaMultiplayerComponent } from './components/play-area-multiplayer/play-area-multiplayer.component';
import { PlayerListTableComponent } from './components/player-list-table/player-list-table.component';
import { QrlHostHistogramComponent } from './components/qrl-host-histogram/qrl-host-histogram.component';
import { QrlHostValidationComponent } from './components/qrl-host-validation/qrl-host-validation.component';
import { QrlMultiplayerComponent } from './components/qrl-multiplayer/qrl-multiplayer.component';
import { QrlPlayerComponent } from './components/qrl-player/qrl-player.component';
import { QrlResultsComponent } from './components/qrl-results/qrl-results.component';
import { QrlTextBoxComponent } from './components/qrl-text-box/qrl-text-box.component';
import { ResultsComponent } from './components/results/results.component';
import { StaticHistogramComponent } from './components/static-histogram/static-histogram.component';
import { TimerControlComponent } from './components/timer-control/timer-control.component';
import { HistoryComponent } from './pages/history/history.component';
import { WaitingScreenPageComponent } from './pages/waiting-screen-page/waiting-screen-page.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        PlayAreaComponent,
        FileUploaderComponent,
        MainPageComponent,
        QuestionTemplateComponent,
        ChatBoxComponent,
        PlayerInfoComponent,
        QuestionDescriptionComponent,
        ButtonComponent,
        CreationPageComponent,
        GameListComponent,
        GameDetailsComponent,
        QuestionListComponent,
        AdministrationPageComponent,
        HeaderComponent,
        GameDetailsComponent,
        GameListComponent,
        ConfirmationPopupComponent,
        WaitingScreenPageComponent,
        CountdownPopupComponent,
        ConfirmationPopupComponent,
        HeaderComponent,
        AdministrationPageComponent,
        MainPageComponent,
        TimerControlComponent,
        PlayAreaMultiplayerComponent,
        ResultsComponent,
        HistogramComponent,
        HistoryComponent,
        QrlTextBoxComponent,
        HistoryListComponent,
        QrlPlayerComponent,
        QrlMultiplayerComponent,
        QrlHostHistogramComponent,
        QrlResultsComponent,
        QrlHostValidationComponent,
        HistogramSliderComponent,
        StaticHistogramComponent,
    ],
    providers: [GameService],
    bootstrap: [AppComponent],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatIconModule,
        PasswordAdministatorComponent,
        LoginAdministratorComponent,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatPaginatorModule,
        DragDropModule,
        MatTooltipModule,
        RouterModule,
        MatTableModule,
        PlayerListTableComponent,
    ],
})
export class AppModule {}
