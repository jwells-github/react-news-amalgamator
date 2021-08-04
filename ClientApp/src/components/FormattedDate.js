import React, { Component } from 'react';

export class FormattedDate extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <span>{new Date(Date.parse(this.props.date)).toString().substr(0, 21)}</span>
        );
    }
}
