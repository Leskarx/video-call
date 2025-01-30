class PeerServices{
    constructor(){
        if(!this.peer){
            this.peer=new RTCPeerConnection({
                iceServers:[
                    {
                        urls:[
                            "stun:stun.l.google.com:19302",
                            "stun:stun1.l.google.com:19302",
                        ]
                       
                    }
                ]
            })
        }
    }

    async createOffer(){
        if(this.peer){
            const offer =await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
            
        }
        
    }
}
export default new PeerServices();