/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

import { ChatBoxComponent } from './chat-box.component';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { FormsModule } from '@angular/forms';

class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let socketClientServiceStub: Partial<SocketClientService>;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    beforeEach(async () => {
        socketClientServiceStub = {
            matchId: 'mockmatchId',
            on: jasmine.createSpy(),
            send: jasmine.createSpy(),
        };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            providers: [{ provide: SocketClientService, useValue: socketClientServiceStub }],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    beforeEach(() => {
        socketClientServiceStub.on = jasmine.createSpy();
    });

    it('should set matchId from SocketClientService', () => {
        expect(component.matchId).toBe('mockmatchId');
    });

    it('should call socketClientService.send on addMessage', () => {
        component.messageText = 'Hello, world!';
        component.addMessage();
        expect(socketClientServiceStub.send).toHaveBeenCalledWith('messageText', { text: 'Hello, world!', code: 'mockmatchId' });
        expect(component.messageText).toBe('');
    });

    it('should change focus on focus and blur', () => {
        component.onFocus();
        expect(component['isFocus']).toBeTrue();
        component.onBlur();
        expect(component['isFocus']).toBeFalse();
    });

    it('should stop propagation on keydown', () => {
        const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const stopPropagationSpy = spyOn(event, 'stopPropagation');
        component.onFocus();
        component.onChatBoxKeyDown(event);
        expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should add messageText on messageText event', () => {
        const message = { author: 'author', text: 'text', color: 'color', time: 'time' };
        const messageText = message.time + ' - ' + message.author + ' - ' + message.text;
        const messageColor = message.color;
        const messageTextSpy = spyOn(component.messageTexts, 'push').and.callThrough();
        socketClientServiceStub.on = (event: string, callback: (val: any) => void) => {
            if (event === 'messageText') {
                callback(message);
            }
        };
        component.ngOnInit();
        expect(messageTextSpy).toHaveBeenCalledWith({ text: messageText, color: messageColor });
    });

    it('should format message if a word is too long', () => {
        const message = 'helloWorldhelloWorldhelloWorld';
        const formattedMessage = 'helloWorldhelloWorldhello World';
        expect(component.formatMessage(message)).toBe(formattedMessage);
    });

    it('should emit message when player is muted', () => {
        const message = "Vous n'avez plus le droit de parole";
        const messageColor = 'red';
        const messageTextSpy = spyOn(component.messageTexts, 'push').and.callThrough();
        socketClientServiceStub.on = (event: string, callback: (val: any) => void) => {
            if (event === 'playerMuted') {
                callback(message);
            }
        };
        component.ngOnInit();
        expect(messageTextSpy).toHaveBeenCalledWith({ text: message, color: messageColor });
    });

    it('should emit message when player is unmuted', () => {
        const message = 'Vous avez le droit de parole';
        const messageColor = 'red';
        const messageTextSpy = spyOn(component.messageTexts, 'push').and.callThrough();
        socketClientServiceStub.on = (event: string, callback: (val: any) => void) => {
            if (event === 'playerUnmuted') {
                callback(message);
            }
        };
        component.ngOnInit();
        expect(messageTextSpy).toHaveBeenCalledWith({ text: message, color: messageColor });
    });
});
