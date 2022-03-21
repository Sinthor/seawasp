import { Message } from './message';
export class Canal {
  private _connection!: RTCPeerConnection;
  private _sendChannel!: RTCDataChannel;
  private _receiveChannel!: RTCDataChannel;

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
        !!this.onMessage && this.onMessage(event);
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
  public send(data: Message): void {
    this._sendChannel.send(JSON.stringify(data));
  }
  public close(): void {
    this._sendChannel.close();
    this._receiveChannel.close();
    this._connection.close();
  }
}
