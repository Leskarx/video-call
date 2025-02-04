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
            {
              urls: "turn:relay1.expressturn.com:3478",
              username: "efAK9PB8AM5TTK57NC",
              credential: "WbYci3w1MuEAGsW4",
            },
          ],
        });
  
        this.pendingCandidates = []; // Store ICE candidates received before remote description
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
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
      }
    }
  
    async setRemoteDescription(remoteSDP) {
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(remoteSDP));
        console.log("Remote description set.");
  
        // Add stored ICE candidates
        this.pendingCandidates.forEach(async (candidate) => {
          try {
            await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Stored ICE candidate added:", candidate);
          } catch (err) {
            console.error("Error adding stored ICE candidate:", err);
          }
        });
        this.pendingCandidates = []; // Clear the stored candidates after applying them
      }
    }
  
    async addIceCandidate(candidate) {
      if (this.peer.remoteDescription) {
        try {
          await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        console.warn("Remote description not set, storing ICE candidate for later.");
        this.pendingCandidates.push(candidate);
      }
    }
  }
  
  export default new PeerServices();
  