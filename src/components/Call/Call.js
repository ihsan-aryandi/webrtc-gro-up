import React, { Component } from 'react'
import { GroChatVoipContext } from '../../GroChatVoipProvider'
import Config from '../../config/config'

export default class Call extends Component {
    static contextType = GroChatVoipContext

    render() {
        const groChatVoipContext = this.context

        if (!groChatVoipContext.currentCall) {
            return null
        }

        return (
            <div>
                { 
                    groChatVoipContext.currentCall.callFrom === Config.clientId
                        ? <Calling /> 
                        : <IncomingCall />
                }
            </div>
        )
    }
}

class IncomingCall extends Component {
    static contextType = GroChatVoipContext

    render() {
        const groChatVoipContext = this.context

        return (
            <div>
                
            </div>
        )
    }
}

class Calling extends Component {
    static contextType = GroChatVoipContext

    render() {
        const groChatVoipContext = this.context

        return (
            <div>
                <h2>{groChatVoipContext.isOnCall ? toTime(groChatVoipContext.duration) : 'Calling...'}</h2>
            </div>
        )
    }
}

function toTime(currentSeconds) {
    var sec_num = parseInt(currentSeconds, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
  
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours + ':' + minutes + ':' + seconds;
  }