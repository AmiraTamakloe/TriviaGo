/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable no-unused-vars */
type CallbackSignature = (params: unknown) => {};

export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();

    constructor() {
        this.disconnect();
    }

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)?.push(callback);
    }

    emit(event: string): void {
        return;
    }

    send(event: string): void {
        return;
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: unknown) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }

    removeAllListeners(event?: string): void {
        return;
    }
}
