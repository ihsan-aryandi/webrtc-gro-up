import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Config from './config/config'
import { v4 as uuidv4 } from 'uuid'

const CallType = {
    callId: '',
    callFrom: '',
    callTo: '',
    callStatus: '',
    callFromName: '',
    callFromPhone: '',
    image: '',
    code: ''
}

export const GroChatVoipContext = React.createContext({
    /**
     * @description Calls user by Client ID. It will ask for microphone permission
     * @param {string} clientId 
     */
    call: (clientId) => {},

    /**
     * @description Answers call
     */
    answer: () => {},

    /**
     * @description Hang up call
     */
    hangUp: () => {},

    /**
     * @type {React.RefObject}
     */
    remoteAudioRef: undefined,

    /**
     * @type {CallType|null}
     */
    currentCall: null,

    /**
     * @type {boolean}
     */
    isOnCall: false
})

/**
 * @extends {React.Component<GroChatVoipProvider.propTypes>}
 */
class GroChatVoipProvider extends Component {
    constructor(props) {
        super(props)

        this.remoteAudioRef = React.createRef()
        this.state = {
            /**
             * @type {RTCPeerConnection|null}
             */
            localPeer: null,

            /**
             * @type {MediaStream|null}
             */
            stream: null,

            /**
             * @type {CallType|null}
             */
            currentCall: null,

            /**
             * @type {boolean}
             */
            isOnCall: false
        }
    }

    /**
     * @param {{ ws: WebSocket }} props 
     */
    componentDidUpdate(props) {
        if (props.ws !== this.props.ws) {
            this.initiateListener()
        }
    }

    /**
     * @description Calls user by Client ID. It will ask for microphone permission
     * @param {string} clientId
     */
    call = async (clientId) => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const peer = new RTCPeerConnection()
        const callId = uuidv4()

        peer.ontrack = this.playRemoteStream
        peer.onicecandidate = (e) => this.sendIceCandidate(e, clientId, callId, Config.clientId, clientId)

        stream.getAudioTracks().forEach(track => peer.addTrack(track, stream))

        const offer = await peer.createOffer()
        peer.setLocalDescription(offer)

        this.setState({
            localPeer: peer,
            stream,
        })

        this.sendOffer(callId, offer, clientId)
    }

    /**
     * @param {string} callId
     * @param {RTCOfferOptions} offer
     * @param {string} clientId 
     */
    sendOffer = (callId, offer, clientId) => {
        const data = JSON.stringify({
            type: 'webrtc',
            message: {
                is_group: false,
                source_id: Config.clientId,
                destination_id: clientId,
                identity: {
                    client_id: Config.clientId,
                    sign: Config.sign
                },
                message_detail: {
                    message_model: {
                        call_id: callId,
                        call_from: Config.clientId,
                        call_to: clientId,
                        call_status: 'offer',
                        start_call: 0,
                        end_call: 0,
                        duration: 0,
                        is_reject: 0,
                        call_from_name: Config.profile.name,
                        call_from_phone: Config.profile.phone,
                        image: '',
                        code: JSON.stringify(offer)
                    }
                }
            }
        })

        console.log("CALLING", JSON.parse(data))
        this.props.ws.send(data)
    }

    /**
     * @description Answers call 
     */
    answer = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const currentCall = this.state.currentCall
        const peer = new RTCPeerConnection()

        peer.ontrack = this.playRemoteStream
        peer.onicecandidate = (e) => this.sendIceCandidate(e, currentCall.callFrom, currentCall.callId, currentCall.callFrom, currentCall.callTo)

        stream.getAudioTracks().forEach(track => peer.addTrack(track, stream))

        const answer = await peer.createAnswer()
        peer.setLocalDescription(answer)

        this.setState({
            localPeer: peer,
            stream,
        })

        this.sendAnswer(answer)
    }

    /**
     * @param {RTCAnswerOptions} answer
     */
    sendAnswer = (answer) => {
        const currentCall = this.state.currentCall
        const data = JSON.stringify({
            type: 'webrtc',
            message: {
                is_group: false,
                source_id: Config.clientId,
                destination_id: currentCall.callFrom,
                identity: {
                    client_id: Config.clientId,
                    sign: Config.sign
                },
                message_detail: {
                    message_model: {
                        call_id: currentCall.callId,
                        call_from: currentCall.callFrom,
                        call_to: currentCall.callTo,
                        call_status: 'answer',
                        start_call: 0,
                        end_call: 0,
                        duration: 0,
                        is_reject: 0,
                        call_from_name: currentCall.callFromName,
                        call_from_phone: currentCall.callFromPhone,
                        image: currentCall.image,
                        code: JSON.stringify(answer)
                    }
                }
            }
        })

        console.log("ANSWERING", JSON.parse(data))
        this.props.ws.send(data)
    }

    hangUp = () => {
        this.setState({
            isOnCall: false
        })
    }

    /**
     * @param {RTCTrackEvent} e 
     */
    playRemoteStream = (e) => {
        const remoteStream = e.streams[0]

        /**
         * @todo RECORD AUDIO
         */
        this.remoteAudioRef.current.srcObject = remoteStream
        this.remoteAudioRef.current.play()

        this.setState({
            isOnCall: true
        })
    }

    /**
     * @param {RTCPeerConnectionIceEvent} e 
     * @param {string} destinationId
     * @param {string} callId 
     * @param {string} callFrom 
     * @param {string} callTo 
     */
    sendIceCandidate = (e, destinationId, callId, callFrom, callTo) => {
        if (!e.candidate) {
            return
        }
        
        const candidate = e.candidate
        const code = JSON.stringify({
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdp: candidate.candidate
        })
        
        const data = JSON.stringify({
            type: "webrtc",
            message: {
                is_group: false,
                source_id: Config.clientId,
                destination_id: destinationId,
                identity: {
                    client_id: Config.clientId,
                    sign: Config.sign
                },
                message_detail: {
                    message_model: {
                        call_id: callId,
                        call_from: callFrom,
                        call_to: callTo,
                        call_status: "candidate",
                        start_call: 0,
                        end_call: 0,
                        duration: 0,
                        is_reject: 0,
                        name: "",
                        phone: "",
                        image: "",
                        code: code,
                    }
                }
            }
        })

        this.props.ws.send(data)
    }

    initiateListener = () => {
        const ws = this.props.ws
        
        ws.addEventListener('message', this.handleMessage)
    }

    handleMessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.type === "error") {
            return alert(data.message)
        } 
        
        if (data.type !== "webrtc") {
            return
        }

        this.handleWebRTCMessage(data)
    }

    /**
     * @param {object} data 
     */
    handleWebRTCMessage = (data) => {
        const messageModel = data.message.message_detail.message_model
        const callStatus = messageModel.call_status
        const sdp = JSON.parse(messageModel.code)

        switch(callStatus) {
            /*
                Receive Call
            */
            case "offer" :
                this.handleOffer(messageModel)
                break
            /*
                Call Answered
            */
            case "answer" :
                this.handleAnswer(sdp)
                break
            /*
                Receive Ice Candidate
            */
            case "candidate" :
                this.handleCandidate(sdp)
                break
            default :
                return
        }
    }

    handleOffer = (messageModel) => {
        this.setState({
            currentCall: {
                callId: messageModel.call_id,
                callFrom: messageModel.call_from,
                callTo: messageModel.call_to,
                callStatus: messageModel.call_status,
                callFromName: messageModel.call_from_name,
                callFromPhone: messageModel.call_from_phone,
                image: messageModel.image,
                code: messageModel.code
            }
        })
    }

    handleAnswer = (sdp) => {
        if (!this.state.localPeer) {
            return
        }

        sdp.type = 'answer'
        this.state.localPeer.setRemoteDescription(new RTCSessionDescription(sdp))
    }

    handleCandidate = (sdp) => {
        if (!this.state.localPeer || !this.state.localPeer.remoteDescription) {
            return
        }

        const candidate = new RTCIceCandidate({
            sdpMid: sdp.sdpMid,
            sdpMLineIndex: sdp.sdpMLineIndex,
            candidate: sdp.sdp
        })

        console.log("CANDIDATE", candidate, this.state.localPeer)

        this.state.localPeer.addIceCandidate(candidate)
    }

    render() {
        const value = {
            call:           this.call,
            answer:         this.answer,
            hangUp:         this.hangUp,
            remoteAudioRef: this.remoteAudioRef,
            currentCall:    this.state.currentCall,
            isOnCall:       this.state.isOnCall,
        }

        return (
            <GroChatVoipContext.Provider value={value}>
                { this.props.children }
            </GroChatVoipContext.Provider>
        )
    }
}

GroChatVoipProvider.propTypes = {
    /**
     * @type {WebSocket}
     */
    ws: PropTypes.object
}

export default GroChatVoipProvider