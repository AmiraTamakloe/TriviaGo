import { Component, OnInit } from '@angular/core';
import { MessageText } from '@app/interfaces/message-text';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MAX_WORD_LENGTH } from '@common/constants';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
    matchId: string;
    // create an array of messages
    messageTexts: MessageText[] = [];
    serverClock: Date;
    messageText: string;
    text: string;
    private isFocus: boolean;
    constructor(public socketClientService: SocketClientService) {
        this.matchId = socketClientService.matchId;
    }

    async ngOnInit(): Promise<void> {
        this.socketClientService.on('messageText', (val: { author: string; text: string; color: string; time: string }) => {
            const textMessage = this.formatMessage(val.text);
            this.messageTexts.push({ text: val.time + ' - ' + val.author + ' - ' + textMessage, color: val.color });
        });

        this.socketClientService.on('playerMuted', () => {
            this.messageTexts.push({ text: "Vous n'avez plus le droit de parole", color: 'red' });
        });

        this.socketClientService.on('playerUnmuted', () => {
            this.messageTexts.push({ text: 'Vous avez le droit de parole', color: 'red' });
        });
    }

    formatMessage(message: string): string {
        const words = message.split(' ');
        const newMessage = [];
        for (const word of words) {
            if (word.length > MAX_WORD_LENGTH) {
                const newWords = word.match(/.{1,25}/g);
                if (!newWords) return message;
                for (const newWord of newWords) {
                    newMessage.push(newWord);
                }
            } else {
                newMessage.push(word);
            }
        }
        return newMessage.join(' ');
    }

    addMessage() {
        this.socketClientService.send('messageText', { text: this.messageText, code: this.matchId });
        this.messageText = '';
    }

    onFocus() {
        this.isFocus = true;
    }

    onBlur() {
        this.isFocus = false;
    }

    onChatBoxKeyDown(event: KeyboardEvent) {
        if ((event.key === '1' || event.key === '2' || event.key === '3' || event.key === '4' || event.key === 'Enter') && this.isFocus) {
            event.stopPropagation();
        }
    }
}
