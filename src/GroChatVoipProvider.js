import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Config from './config/config'
import { v4 as uuidv4 } from 'uuid'
import ringingAudio from './ringing.mp3'
import incomingCallAudio from './ringtone.wav'

const CallType = {
    callId: '',
    callFrom: '',
    callTo: '',
    callStatus: '',
    callFromName: '',
    callFromPhone: '',
    callFromPhotoUser: '',
    code: '',
    type: '',
    duration: 0
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
     * @type {React.RefObject<HTMLAudioElement>}
     */
    remoteAudioRef: undefined,

    /**
     * @type {CallType|null}
     */
    currentCall: null,
    
    /**
     * @type {boolean}
     */
    isOnCall: false,

    /**
     * @type {number}
     */
    duration: 0
})

/**
 * @extends {React.Component<GroChatVoipProvider.propTypes>}
 */
class GroChatVoipProvider extends Component {
    constructor(props) {
        super(props)

        /**
         * @type {React.RefObject<HTMLAudioElement>}
         */
        this.ringingAudioRef = React.createRef()

        /**
         * @type {React.RefObject<HTMLAudioElement>}
         */
        this.incomingCallAudioRef = React.createRef()

        /**
         * @type {React.RefObject<HTMLAudioElement>}
         */
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
            isRinging: false,

            /**
             * @type {boolean}
             */
            isOnCall: false,

            /**
             * @type {number}
             */
            duration: 0,

            /**
             * @type {MediaRecorder}
             */
            mediaRecorder: null
        }
    }

    /**
     * @param {{ ws: WebSocket }} props 
     */
    componentDidUpdate(props) {
        if (props.ws !== this.props.ws && this.props.ws) {
            this.initiateListener()
        }
    }

    /**
     * @description Calls user by Client ID. It will ask for microphone permission
     * @param {string} clientId
     */
    call = async (clientId) => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const peer = new RTCPeerConnection(Config.iceServers)
        const callId = uuidv4()

        peer.ontrack = this.playRemoteStream
        peer.onicecandidate = (e) => this.sendIceCandidate(e, clientId, callId, Config.clientId, clientId)

        stream.getAudioTracks().forEach(track => peer.addTrack(track, stream))

        const offer = await peer.createOffer()
        peer.setLocalDescription(offer)

        this.setState({
            localPeer: peer,
            stream
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
                        call_from_photo_user: Config.profile.image,
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
        const peer = new RTCPeerConnection(Config.iceServers)

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
                        call_from_photo_user: currentCall.callFromPhotoUser,
                        code: JSON.stringify(answer)
                    }
                }
            }
        })

        console.log("ANSWERING", JSON.parse(data))
        this.props.ws.send(data)
    }

    hangUp = () => {
        const currentCall = this.state.currentCall
        if (!currentCall) {
            return
        }

        console.log("HANGUP CURRENT CALL", currentCall)

        const data = {
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
                        call_status: 'end',
                        start_call: 0,
                        end_call: 0,
                        duration: 0,
                        is_reject: 0,
                        call_from_name: currentCall.callFromName,
                        call_from_phone: currentCall.callFromPhone,
                        call_from_photo_user: currentCall.callFromPhotoUser,
                    }
                }
            }
        }

        if (currentCall.type === 'offer' && !this.state.isOnCall) {
            data.message.message_detail.message_model.call_status = 'reject'
        }

        console.log("HANGUP DATA", data)

        this.props.ws.send(JSON.stringify(data))
    }

    /**
     * @param {RTCTrackEvent} e 
     */
    playRemoteStream = (e) => {
        this.setCallDuration()
        this.embedRemoteAudio(e.streams[0])
        this.stopRingingSound()
        this.recordAudio(e.streams[0])

        this.setState({
            isOnCall: true
        })
    }

    /**
     * 
     * @param {MediaStream} remoteStream 
     */
    embedRemoteAudio = (remoteStream) => {
        this.remoteAudioRef.current.srcObject = remoteStream
        this.remoteAudioRef.current.play()
    }
    
    setCallDuration = () => {
        const start = Math.floor(new Date().getTime() / 1000)

        const interval = setInterval(() => {
            if (!this.state.isOnCall) {
                return clearInterval(interval)
            }

            const end = Math.floor(new Date().getTime() / 1000)
            this.setState({
                duration: end - start
            })
        }, 1000)
    }

    recordAudio = (stream) => {

    }

    stopRingingSound = () => {
        this.setState({
            isRinging: false
        })
    }

    stopStream = () => {
        this.state.stream?.getAudioTracks().forEach(track => track.stop())
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
                        call_from_photo_user: "",
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
        
        let sdp

        try {
            sdp = JSON.parse(messageModel.code)
        } catch {}

        console.log("MESSAGE", data, callStatus)

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
            /*
                Ringing
            */
            case "ringing" :
                this.handleRingingCall()
                break
            /*
                Call Rejected
            */
            case "reject" :
                this.handleCallRejected()
                break
            /*
                Call Ended
            */
            case "end" : 
                this.handleCallEnded()
                break
            default :
                return
        }
    }

    playRingtone = () => {
        try {
            this.incomingCallAudioRef.current.currentTime = 0
            this.incomingCallAudioRef.current.loop = true
            this.incomingCallAudioRef.current.play()
        } catch(e) {
            console.log(e)
        }
    }

    handleOffer = (messageModel) => {
        if (messageModel.call_from !== Config.clientId) {
            this.playRingtone()
        }

        this.setState({
            currentCall: {
                callId: messageModel.call_id,
                callFrom: messageModel.call_from,
                callTo: messageModel.call_to,
                callStatus: messageModel.call_status,
                callFromName: messageModel.call_from_name,
                callFromPhone: messageModel.call_from_phone,
                callFromPhotoUser: messageModel.call_from_photo_user,
                code: messageModel.code,
                type: 'offer',
                duration: 0
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

        this.state.localPeer.addIceCandidate(candidate)
    }

    handleRingingCall = async () => {
        if (this.state.isRinging) {
            return
        }

        await this.setState({
            isRinging: true
        })

        this.ringingAudioRef.current.currentTime = 0
        this.ringingAudioRef.current.play()

        const interval = setInterval(() => {
            if (!this.state.isRinging) {
                this.ringingAudioRef.current.pause()
                return clearInterval(interval)
            }

            this.ringingAudioRef.current.currentTime = 0
            this.ringingAudioRef.current.play()
        }, 3000)
    }

    handleCallRejected = () => {
        this.stopRingingSound()

        this.remoteAudioRef.current?.pause()
        this.remoteAudioRef.current.srcObject = null
        this.state.localPeer?.close()
        this.stopStream()

        this.setState({
            localPeer: null,
            stream: null,
            isOnCall: false,
            currentCall: null
        })
    }

    handleCallEnded = () => {
        this.stopRingingSound()

        this.remoteAudioRef.current?.pause()
        this.remoteAudioRef.current.srcObject = null
        this.state.localPeer?.close()
        this.stopStream()

        const currentCall = this.state.currentCall
        currentCall.duration = this.state.duration

        this.setState({
            localPeer: null,
            stream: null,
            isOnCall: false,
            currentCall: null
        })
    }

    render() {
        const value = {
            call:           this.call,
            answer:         this.answer,
            hangUp:         this.hangUp,
            remoteAudioRef: this.remoteAudioRef,
            currentCall:    this.state.currentCall,
            isOnCall:       this.state.isOnCall,
            duration:       this.state.duration
        }
        
        return (
            <GroChatVoipContext.Provider value={value}>
                <audio controls ref={this.ringingAudioRef} src={ringingAudio}></audio>
                <audio controls ref={this.incomingCallAudioRef} src={incomingCallAudio}></audio>
                { this.props.children }
            </GroChatVoipContext.Provider>
        )
    }
}

GroChatVoipProvider.propTypes = {
    /**
     * @type {WebSocket}
     */
    ws: PropTypes.object,

    /**
     * @type {Function}
     */
    onCallEnded: PropTypes.func
}

export default GroChatVoipProvider