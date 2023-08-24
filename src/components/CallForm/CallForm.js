import React, { useContext, useEffect, useState } from 'react'
import { GroChatVoipContext } from '../../GroChatVoipProvider'

export default function CallForm() {
    const groChatVoipContext = useContext(GroChatVoipContext)
    const [input, setInput] = useState({
        clientId: '4d3c0a2713374301a72271e9eeac633b'
    })

    const handleSubmit = e => {
        e.preventDefault()
        groChatVoipContext.call(input.clientId)
    }

    const handleChange = e => {
        setInput(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <form onSubmit={handleSubmit}>
            <audio ref={groChatVoipContext.remoteAudioRef}></audio>
            <div>
                <label htmlFor="clientId">Client ID</label>
                <input type="text" id='clientId' name='clientId' onChange={handleChange} value={input.clientId} />
            </div>
            <button type='submit'>Call</button>
            <button type='button' onClick={() => groChatVoipContext.hangUp()}>Hang Up</button>
        </form>
    )
}
