import { Connection } from './models/Connection';
declare global {
  interface Window {
    serverChannels: Array<RTCDataChannel>;
  }
}
window.serverChannels = window.serverChannels || [];

export class ICEService {
  public remoteConnections = new Array<RTCPeerConnection>();
  public serverConnections = new Array<RTCPeerConnection>();

  constructor() {}
  public registerConnection(name: string): Connection {
    const server = new RTCPeerConnection();
    const remote = new RTCPeerConnection();
    const connect = new Connection();

    const serverChannel = server.createDataChannel(name);
    connect.sendChannel = remote.createDataChannel(name);
    connect.connection = remote;

    this.addIceCandidate(server, remote);

    server.ondatachannel = (event: RTCDataChannelEvent) => {
      const channel = event.channel;
      channel.onmessage = (event: any) => {
        const receiverLabel = JSON.parse(event.data).receiver;
        const receiver = window.serverChannels.find(
          (c) => c.label === receiverLabel
        );
        if (receiver) {
          receiver.send(event.data);
        }
      };
    };

    this.createOffer(server, remote);
    window.serverChannels.push(serverChannel);
    this.remoteConnections.push(remote);
    this.serverConnections.push(server);
    return connect;
  }

  private addIceCandidate(
    server: RTCPeerConnection,
    remote: RTCPeerConnection
  ): void {
    remote.onicecandidate = (e: any) => {
      if (e.candidate) {
        server.addIceCandidate(e.candidate).catch(this.handleAddCandidateError);
      }
    };
    server.onicecandidate = (e: any) => {
      if (e.candidate) {
        remote.addIceCandidate(e.candidate).catch(this.handleAddCandidateError);
      }
    };
  }

  private createOffer(
    server: RTCPeerConnection,
    remote: RTCPeerConnection
  ): void {
    remote
      .createOffer()
      .then((offer: any) => remote.setLocalDescription(offer))
      .then(() =>
        server.setRemoteDescription(
          remote.localDescription as RTCSessionDescription
        )
      )
      .then(() => server.createAnswer())
      .then((answer: any) => server.setLocalDescription(answer))
      .then(() =>
        remote.setRemoteDescription(
          server.localDescription as RTCSessionDescription
        )
      )
      .catch(this.handleCreateDescriptionError);
  }

  private handleAddCandidateError(): void {
    console.log('Oh noes! addICECandidate failed!');
  }
  private handleCreateDescriptionError(error: any): void {
    console.log('Unable to create an offer: ' + error.toString());
  }
}
