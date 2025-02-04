class PeerServices {
    constructor() {
      if (!this.peer) {
        this.peer = new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
              ],
            },
          ],
        });
      }
    }
  
    async createOffer() {
      if (this.peer) {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
      }
    }
  
    async createAnswer(offer) {
      if (this.peer) {
        await this.peer.setRemoteDescription(offer);
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
      }
    }
  
    async setRemoteDescription(answer) {
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    }
  }
  
  export default new PeerServices();