import React, { Component } from 'react';


export class OptionsTab extends Component {

    constructor(props) {
        super(props);
        this.toggleOptionsTab = this.toggleOptionsTab.bind(this);
        this.optionsTab = React.createRef()
    }

    componentDidUpdate(prevProps) {
        // This ensures hidden class is applied on start to prevent the slide animation from running on page load
        if (prevProps.displayOptions !== this.props.displayOptions) {
            this.toggleOptionsTab();
        }
    }

    toggleOptionsTab() {
        this.optionsTab.current.className = this.props.displayOptions ? "options-bar show-options" : "options-bar hide-options"
    }

    render() {
        return (
            <div className="hidden" ref={this.optionsTab}>
                <div className="options-header">
                    <h2>Options</h2>
                    <button onClick={this.props.toggleOptionsDisplay}>Hide Options</button>
                </div>
                {this.props.children}
            </div>
        );
    }
}
