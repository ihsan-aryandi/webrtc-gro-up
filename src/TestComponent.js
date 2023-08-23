import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * @extends {React.Component<TestComponent.propTypes>}
 */
export default class TestComponent extends Component {
    static propTypes = {
        mamank: PropTypes.string.isRequired,
        test: ""
    }

    render() {
        return (
            <div>TestComponent</div>
        )
    }
}
