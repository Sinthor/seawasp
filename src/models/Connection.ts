import { Subject } from 'rxjs';
import { Message } from './Message';

export class Connection {
  private _connection!: RTCPeerConnection;
  private _sendChannel!: RTCDataChannel;
  private _receiveChannel!: RTCDataChannel;

  public onOpen: Subject<MessageEvent> = new Subject<MessageEvent>();
  public onMessage: Subject<MessageEvent> = new Subject<MessageEvent>();
  public onError: Subject<MessageEvent> = new Subject<MessageEvent>();
  public onClose: Subject<MessageEvent> = new Subject<MessageEvent>();

  get connection() {
    return this._connection;
  }
  set connection(con: RTCPeerConnection) {
    this._connection = con;
    this._connection.ondatachannel = (event: RTCDataChannelEvent) => {
      this._receiveChannel = event.channel;
      this._receiveChannel.onopen = (event: Event): any =>
        this.onOpen.next(event as MessageEvent);
      this._receiveChannel.onmessage = (event: Event) =>
        this.onMessage.next(event as MessageEvent);
      this._receiveChannel.onerror = (event: Event) =>
        this.onError.next(event as MessageEvent);
      this._receiveChannel.onclose = (event: Event) =>
        this.onClose.next(event as MessageEvent);
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
