import React, { useEffect, useRef, useState } from 'react'
import { HandShake } from './model/grochat-ws'
import Config from './config/config'
import { v4 as uuidv4 } from 'uuid'
import MultiStreamsMixer from 'multistreamsmixer'
import audioTest from './audio.mp3'

export const VoipContext = React.createContext()

export default function VoipProvider({ children }) {
    const [localPeer, setLocalPeer] = useState(null)
    const [ws, setWS] = useState(null)
    const [call, setCall] = useState(null)

    const remoteAudioRef = useRef()
    const recordingAudioRef = useRef()
    const testAudioRef = useRef()

    /*
        Connect WS
    */
    useEffect(() => connectWS(setWS), [])

    /*
        Initiate listener
    */
    useEffect(() => initiateListener(ws, localPeer), [ws, localPeer])

    const onIceCandidate = (e, callId, clientId) => {
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

        // console.log("ON ICE CANDIDATE", JSON.parse(data))

        ws.send(data)
    }

    const addTrack = (e, stream) => {
        console.log("ON TRACK", e.streams[0], stream)

        const remoteStream = e.streams[0]

        const multiStreams = new MultiStreamsMixer([stream, remoteStream])
        const streams = new MediaStream(multiStreams.getMixedStream())
        const mediaRecorder = new MediaRecorder(streams)

        mediaRecorder.ondataavailable = (e) => {
            const recordedBlob = new Blob([e.data], { type: 'audio/mpeg' })
            const url = window.URL.createObjectURL(recordedBlob)
            
            recordingAudioRef.current.src = url
            recordingAudioRef.current.play()

            const a = document.createElement('a')

            document.body.appendChild(a);
            
            a.style = 'display: none';
            a.href = url;
            a.download = 'test_audio.mp3';
            a.click();
        }

        mediaRecorder.start()

        setTimeout(() => {
            mediaRecorder.stop()
        }, 10000)
        
        remoteAudioRef.current.srcObject = remoteStream
        remoteAudioRef.current.play()
    }

    /*
        Make a Call
    */
    const callUser = async (clientId) => {
        remoteAudioRef.current.src = audioTest
        // remoteAudioRef.current.volume = 0
        
        let defaultTime = 3598

        remoteAudioRef.current.addEventListener("timeupdate", function(){
            const currentTime = defaultTime + remoteAudioRef.current.currentTime
            // console.log(remoteAudioRef.current.currentTime)
            // myRange.value  = remoteAudioRef.current.currentTime;
            
            var min = Math.floor(currentTime / 60);
            var sec = Math.floor(currentTime - min * 60);
            var hour = Math.floor(min / 60)

            if (min > 59) {
                min = 0
            }

            var displayHour = `0${hour}`.substr(-2)
            var displayMin = `0${min}`.substr(-2)
            var displaySec = `0${sec}`.substr(-2)

            console.log(`${displayHour}:${displayMin}:${displaySec}`);
        });

        remoteAudioRef.current.play()

        // const callId = uuidv4()
        // const stream = await navigator.mediaDevices.getUserMedia({
        //     video: false,
        //     audio: true
        // })

        // const peer = new RTCPeerConnection(Config.iceServers)
        // peer.ontrack = (e) => addTrack(e, stream)
        // peer.onicecandidate = (e) => onIceCandidate(e, callId, clientId)

        // stream.getAudioTracks().forEach(track => {
        //     peer.addTrack(track, stream)
        // })
        
        // const offer = await peer.createOffer()
        // peer.setLocalDescription(offer)

        // setLocalPeer(peer)

        // const call = JSON.stringify({
        //     type: 'webrtc',
        //     message: {
        //         is_group: false,
        //         source_id: Config.clientId,
        //         destination_id: clientId,
        //         identity: {
        //             client_id: Config.clientId,
        //             sign: Config.sign
        //         },
        //         message_detail: {
        //             message_model: {
        //                 call_id: callId,
        //                 call_from: Config.clientId,
        //                 call_to: clientId,
        //                 call_status: 'offer',
        //                 start_call: 0,
        //                 end_call: 0,
        //                 duration: 0,
        //                 is_reject: 0,
        //                 call_from_name: 'CS NexCare 4',
        //                 call_from_phone: '+6289898000004',
        //                 image: '',
        //                 code: JSON.stringify(offer)
        //             }
        //         }
        //     }
        // })

        // console.log("CALLING", JSON.parse(call), ws.readyState)
        // ws.send(call)
    }

    const record = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        })
        // const data = []

        const multiStreams = new MultiStreamsMixer([stream, stream])
        
        const streams = new MediaStream()

        const mediaRecorder = new MediaRecorder(streams)

        mediaRecorder.ondataavailable = e => {
            console.log("ON DATA AVAILABLE", e)

            const recordedBlob = new Blob([e.data], { type: 'audio/mpeg' })
            
            recordingAudioRef.current.src = window.URL.createObjectURL(recordedBlob)
            recordingAudioRef.current.play()
        }
        
        mediaRecorder.start()
        console.log("Recording...")

        setTimeout(() => {
            mediaRecorder.stop()
            console.log("Recording stopped")
        }, 3000)
    }

    return (
        <VoipContext.Provider value={{
            callUser,
            record,
            testAudioRef,
            remoteAudioRef,
            recordingAudioRef
        }}>
            { children }
        </VoipContext.Provider>
    )
}

function connectWS(setWS) {
    const ws = new WebSocket('wss://staging-ngchat.gromart.club/v1/ws')

    setWS(ws)
}

function handshake(ws) {
    const data = new HandShake()

    data.client_id = Config.clientId
    data.sign = Config.sign
    data.token = Config.token

    ws.send(data.toString())
}

function initiateListener(ws, localPeer) {
    if (!ws) {
        return
    }

    ws.addEventListener('open', () => {
        handshake(ws)
        console.log("HANDSHAKE", ws.readyState)
    })

    ws.addEventListener('close', (e) => {
        console.log("ON CLOSE", e)
    })

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type !== 'webrtc') {
            return
        }

        const messageModel = data.message.message_detail.message_model
        const callStatus = messageModel.call_status
        const sdp = JSON.parse(messageModel.code)

        console.log(callStatus, data)

        switch(callStatus) {
            case "answer" :
                sdp.type = callStatus
                
                localPeer.setRemoteDescription(new RTCSessionDescription(sdp))
                break    
            case "candidate" :
                if (localPeer.remoteDescription) {
                    const candidate = new RTCIceCandidate({
                        sdpMid: sdp.sdpMid,
                        sdpMLineIndex: sdp.sdpMLineIndex,
                        candidate: sdp.sdp
                    })
    
                    console.log("CANDIDATE", candidate, localPeer)
    
                    localPeer.addIceCandidate(candidate)
                }
                break
            default :
                return
        }
    }
}