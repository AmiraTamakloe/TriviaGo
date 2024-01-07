import { Injectable } from '@angular/core';
import { ALARM_SOUND_PATH } from '@app/../constants';

@Injectable({
    providedIn: 'root',
})
export default class PlayAudioService {
    private audio: HTMLAudioElement;
    constructor() {
        this.audio = new Audio();
        this.audio.src = ALARM_SOUND_PATH;
        this.audio.load();
    }
    loopAudio() {
        this.playOnceFromStart();
        this.audio.addEventListener('ended', () => {
            this.playOnceFromStart();
        });
    }
    pauseAudio() {
        this.audio.pause();
    }
    private playOnceFromStart() {
        this.audio.currentTime = 0;
        this.audio.play();
    }
}
