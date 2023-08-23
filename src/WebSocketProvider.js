import React, { Component } from 'react'
import Config from './config/config'
import { HandShake } from './model/grochat-ws'

export const WebSocketContext = React.createContext()

export default class WebSocketProvider extends Component {
    constructor(props) {
        super(props)

        this.state = {
            /**
             * @type {WebSocket}
             */
            ws: null,
            isHandshake: false
        }
    }

    componentDidMount() {
        this.connectWebSocket()       
    }

    connectWebSocket = () => {
        console.log("INFO : Connecting")
        const ws = new WebSocket('wss://staging-ngchat.gromart.club/v1/ws')

        ws.addEventListener('open', () => this.handleHandshake(ws)) 
        ws.addEventListener('close', this.handleReconnect)
    }

    /**
     * @param {WebSocket} ws
     */
    handleHandshake = (ws) => {
        if (this.state.isHandshake) {
            return
        }

        const data = new HandShake()

        data.client_id = Config.clientId
        data.sign = Config.sign
        data.token = Config.token

        ws.send(data.toString())
        
        this.setState({ 
            ws,
            isHandshake: true
        })

        console.log("INFO : Connected")
    }

    /**
     * @param {Event} e
     */
    handleReconnect = (e) => {
        console.log("INFO : Reconnecting", e)

        this.setState({
            ws: null,
            isHandshake: false
        })

        this.connectWebSocket()
    }

    render() {
        // if (!this.state.ws) {
        //     return null
        // }

        return (
            <WebSocketContext.Provider value={this.state.ws}>
                { this.props.children }
            </WebSocketContext.Provider>
        )
    }
}
