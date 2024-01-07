import { TestBed } from '@angular/core/testing';
import PlayAudioService from './play-audio.service';

describe('PlayAudioService', () => {
    let service: PlayAudioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayAudioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should loop audio', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<PlayAudioService, any>(service, 'playOnceFromStart');
        spyOn(service['audio'], 'addEventListener');
        service.loopAudio();
        expect(service['playOnceFromStart']).toHaveBeenCalled();
        expect(service['audio'].addEventListener).toHaveBeenCalledWith('ended', jasmine.any(Function));
    });

    it('should find audio file', () => {
        expect(service['audio'].src).toBeTruthy();
    });

    it('should pause audio', () => {
        spyOn(service['audio'], 'pause');
        service.pauseAudio();
        expect(service['audio'].pause).toHaveBeenCalled();
    });

    it('should play audio from start', () => {
        spyOn(service['audio'], 'play');
        service['audio'].currentTime = 10;
        service['playOnceFromStart']();
        expect(service['audio'].currentTime).toBe(0);
        expect(service['audio'].play).toHaveBeenCalled();
    });

    it('should play audio', () => {
        spyOn(service['audio'], 'play');
        service.loopAudio();
        const endedEvent = new Event('ended');
        service['audio'].dispatchEvent(endedEvent);
        expect(service['audio'].play).toHaveBeenCalled();
    });
});
