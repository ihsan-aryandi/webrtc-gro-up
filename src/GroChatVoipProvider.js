import React, { Component } from 'react'
import PropTypes from 'prop-types'

const GroChatVoipContext = React.createContext()

/**
 * @description
 * @extends {React.Component<GroChatVoipProvider.propTypes>}
 */
class GroChatVoipProvider extends Component {
    constructor(props) {
        super(props)

        this.localAudioRef = React.createRef()
        this.remoteAudioRef = React.createRef()
        this.state = {
            call: null
        }
    }

    /**
     * @param {{ ws: WebSocket }} props 
     */
    componentDidUpdate(props) {
        if (props.ws !== this.props.ws) {
            this.handleMessage()
        }
    }

    handleMessage = () => {
        const ws = this.props.ws
        
    }

    render() {
        return (
            <GroChatVoipContext.Provider value={{}}>
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