import React, { useContext, useEffect, useState } from 'react'
import { VoipContext } from '../../VoipProvider'

export default function CallForm() {
    return <h1>Call</h1>
    // const { callUser, remoteAudioRef, recordingAudioRef } = useContext(VoipContext)
    // const [input, setInput] = useState({
    //     clientId: '4d3c0a2713374301a72271e9eeac633b'
    // })

    // const handleSubmit = e => {
    //     e.preventDefault()
    //     callUser(input.clientId)
    // }

    // const handleChange = e => {
    //     setInput(prev => ({
    //         ...prev,
    //         [e.target.name]: e.target.value
    //     }))
    // }

    // return (
    //     <form onSubmit={handleSubmit}>
    //         {/* <audio ref={testAudioRef} src={audioTest}></audio> */}
    //         <audio ref={recordingAudioRef}></audio>
    //         <audio ref={remoteAudioRef} controls></audio>
    //         {/* <button type='button' onClick={() => record()}>Record</button> */}
    //         <div>
    //             <label htmlFor="clientId">Client ID</label>
    //             <input type="text" id='clientId' name='clientId' onChange={handleChange} value={input.clientId} />
    //         </div>
    //         <button type='submit'>Call</button>
    //     </form>
    // )
}
