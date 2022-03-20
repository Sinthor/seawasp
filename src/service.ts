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
  //  public serverChannels = new Array<RTCDataChannel>();

  public registerConnection(name: string): Connection {
    const server = new RTCPeerConnection();
    const remote = new RTCPeerConnection();
    const connect = new Connection();
    const sendChannel = server.createDataChannel(name);
    connect.sendChannel = remote.createDataChannel(name);
    connect.connection = remote;
    this.addIceCandidate(server, remote);
    server.ondatachannel = (event: RTCDataChannelEvent) => {
      const channel = event.channel;
      channel.onmessage = (event: any) => {
        console.log('DATA: ', event);
        const receiverLabel = JSON.parse(event.data).receiver;
        const receiver = window.serverChannels.find(
          (c) => c.label === receiverLabel
        );
        console.log(window.serverChannels);
        if (receiver) {
          receiver.send(event.data);
        }
      };
    };
    this.createOffer(server, remote);
    window.serverChannels.push(sendChannel);
    this.remoteConnections.push(remote);
    this.serverConnections.push(server);
    return connect;
  }

  public addIceCandidate(server: RTCPeerConnection, remote: RTCPeerConnection) {
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

  public createOffer(server: RTCPeerConnection, remote: RTCPeerConnection) {
    // Now create an offer to connect; this starts the process
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

  public handleAddCandidateError() {
    console.log('Oh noes! addICECandidate failed!');
  }
  public handleCreateDescriptionError(error: any) {
    console.log('Unable to create an offer: ' + error.toString());
  }
}
