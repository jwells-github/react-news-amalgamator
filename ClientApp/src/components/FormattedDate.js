import React, { Component } from 'react';

export class FormattedDate extends Component {
    render() {
        return (
            <span>{new Date(Date.parse(this.props.date)).toString().substr(0, 21)}</span>
        );
    }
}
