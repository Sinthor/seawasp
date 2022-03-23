import { ConfirmMessage, Message } from './message';
export class Canal {
  private _connection!: RTCPeerConnection;
  private _sendChannel!: RTCDataChannel;
  private _receiveChannel!: RTCDataChannel;
  private _sendPromiseResolve!: any;
  public onOpen!: ((event: Event) => any) | null;
  public onMessage!: ((event: Event) => any) | null;
  public onError!: ((event: Event) => any) | null;
  public onClose!: ((event: Event) => any) | null;

  get connection() {
    return this._connection;
  }
  set connection(con: RTCPeerConnection) {
    this._connection = con;
    this._connection.ondatachannel = (event: RTCDataChannelEvent) => {
      this._receiveChannel = event.channel;
      this._receiveChannel.onmessage = (event: Event) =>
        this.handleMessage(event);
      this._receiveChannel.onopen = (event: Event) =>
        !!this.onOpen && this.onOpen(event);
      this._receiveChannel.onerror = (event: Event) =>
        !!this.onError && this.onError(event);
      this._receiveChannel.onclose = (event: Event) =>
        !!this.onClose && this.onClose(event);
    };
  }

  set sendChannel(channel: RTCDataChannel) {
    if (!this._sendChannel) {
      this._sendChannel = channel;
    }
  }
  private handleMessage(event: any): void {
    let originalMessage: ConfirmMessage | null = null;
    let confirmMessage: ConfirmMessage | null = null;
    try {
      originalMessage = JSON.parse(event.data);
    } catch (error) {
      console.log(error);
    }
    // If the message has no "received" prop it means it is not a confirm-message
    if (originalMessage && originalMessage.received === undefined) {
      !!this.onMessage && this.onMessage(event);
      // Send a new message back to the sender to confirm the receive
      confirmMessage = {
        receiver: originalMessage.sender,
        sender: originalMessage.receiver,
        payload: originalMessage.payload,
        received: !!this.onMessage,
      };
      try {
        this._sendChannel.send(JSON.stringify(confirmMessage));
      } catch (error) {
        console.log(error);
      }
    } else if (originalMessage) {
      this._sendPromiseResolve(originalMessage.received);
    }
  }
  /**
   *
   * @param data Object with receiver and sender indentification string and payload.
   * @returns A Promise which returns a boolean to indicate the success of the sending.
   */
  public send(data: Message): Promise<boolean> {
    return new Promise((res, rej) => {
      try {
        // Save resolve to confirm the successful sending
        this._sendPromiseResolve = res;
        this._sendChannel.send(JSON.stringify(data));
      } catch (error) {
        console.log(error);
      }
    });
  }
  public close(): void {
    this._sendChannel.close();
    this._receiveChannel.close();
    this._connection.close();
  }
}
