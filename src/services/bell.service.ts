import { Canal } from '../models/canal';
declare global {
  interface Window {
    serverChannels: Array<RTCDataChannel>;
  }
}
window.serverChannels = window.serverChannels || [];
export class Bell {
  get registeredTentacles() {
    return window.serverChannels;
  }

  public registerTentacle(name: string): Canal {
    // Create the neccessary objects
    const bellCanal = new RTCPeerConnection();
    const tentacle = new RTCPeerConnection();
    const connection = new Canal();

    // Create a DataChannel for the server
    const serverChannel = bellCanal.createDataChannel(name);
    // Create a DataChannel for the tentacle and assign it to the connection object
    connection.sendChannel = tentacle.createDataChannel(name);
    connection.connection = tentacle;

    // ice-candidates
    this.addIceCandidate(bellCanal, tentacle);

    bellCanal.ondatachannel = (event: RTCDataChannelEvent) =>
      this.onDataChannel(event);
    // create the offers
    this.createOffer(bellCanal, tentacle);
    // save the serverChannel to the window to be accessible from all components
    window.serverChannels.push(serverChannel);
    return connection;
  }

  // Receive a message from a tentacle and forward it to the receiver-tentacle
  private onDataChannel(event: RTCDataChannelEvent): void {
    const channel = event.channel;
    channel.onmessage = (event: any) => {
      try {
        const receiverLabel = JSON.parse(event.data).receiver;
        const receiver = window.serverChannels.find(
          (c) => c.label === receiverLabel
        );
        if (receiver) {
          receiver.send(event.data);
        } else {
          console.log(
            'No matching receiver found. Make sure that the specified receiver is correct and registered.'
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    channel.onerror = (event: any) => console.log('OnError: ', event);
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
    console.log('AddICECandidate failed!');
  }
  private handleCreateDescriptionError(error: any): void {
    console.log('Unable to create an offer: ' + error.toString());
  }
}
