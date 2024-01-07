/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect from the server', () => {
        spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(service.socket.disconnect).toHaveBeenCalled();
    });

    it('should send a message to the server', () => {
        spyOn(service.socket, 'emit');
        service.send('test', 'hello');
        expect(service.socket.emit).toHaveBeenCalledWith('test', 'hello');
    });

    it('should receive a message from the server', () => {
        const data = { message: 'hello' };
        spyOn(service.socket, 'on');
        service.on('test', (receivedData) => {
            expect(receivedData).toEqual(data);
        });
        service.socket.emit('test', data);
        expect(service.socket.on).toHaveBeenCalledWith('test', jasmine.any(Function));
    });

    it('should send event to serveur without data', () => {
        spyOn(service.socket, 'emit');
        service.send('test');
        expect(service.socket.emit).toHaveBeenCalledWith('test');
    });

    it('should send event to serveur with data', () => {
        spyOn(service.socket, 'emit');
        service.send('test', 'hello');
        expect(service.socket.emit).toHaveBeenCalledWith('test', 'hello');
    });

    it('should send event to server with data when receiving datatosend', () => {
        spyOn(service.socket, 'emit');
        service.on('test', () => {}, 'hello');
        expect(service.socket.emit).toHaveBeenCalledWith('test', 'hello');
    });

    it('should receive data from the server', () => {
        const data = { message: 'hello' };
        spyOn(service.socket, 'on');
        service.on(
            'test',
            (receivedData) => {
                expect(receivedData).toEqual(data);
            },
            data,
        );
        expect(service.socket.on).toHaveBeenCalledWith('test', jasmine.any(Function));
    });

    it('should remove listeners related to event when removeAllListeners(event) is called', () => {
        spyOn(service.socket, 'removeAllListeners').and.callThrough();

        service.on('testEvent', () => {});
        service.on('testEvent', () => {});
        service.on('testEvent', () => {});
        service.on('testEvent2', () => {});
        service.on('testEvent2', () => {});

        expect(service.socket.listeners('testEvent').length).toEqual(3);
        expect(service.socket.listeners('testEvent2').length).toEqual(2);

        service.removeAllListeners('testEvent');
        expect(service.socket.removeAllListeners).toHaveBeenCalledWith('testEvent');

        expect(service.socket.listeners('testEvent').length).toEqual(0);
        expect(service.socket.listeners('testEvent2').length).toEqual(2);
    });

    it('should remove all existing listeners from socket when method called without event param', () => {
        spyOn(service.socket, 'removeAllListeners').and.callThrough();

        service.on('testEvent', () => {});
        service.on('testEvent', () => {});
        service.on('testEvent', () => {});
        service.on('testEvent2', () => {});
        service.on('testEvent2', () => {});

        expect(service.socket.listeners('testEvent').length).toEqual(3);
        expect(service.socket.listeners('testEvent2').length).toEqual(2);

        service.removeAllListeners();
        expect(service.socket.removeAllListeners).toHaveBeenCalled();

        expect(service.socket.listeners('testEvent').length).toEqual(0);
        expect(service.socket.listeners('testEvent2').length).toEqual(0);
    });
});
