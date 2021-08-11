import React, { Component } from 'react';

export class Options extends Component {

    render() {
        let providerList = [];
        for (const [key, provider] of Object.entries(this.props.providers)) {
            providerList.push(
                <div className="providerSelection" key={provider.id}>
                    <label htmlFor={provider.name}>{provider.name}</label>
                    <input
                        name={key}
                        type="checkbox" id={provider.name}
                        checked={provider.display}
                        onChange={this.props.toggleDisplayedProviders} />

                </div>)
        }
        return (
            <div>
                <h3>Preferred news provider</h3>
                <select value={this.props.preferredProvider} onChange={this.props.changeProviderPreference}>
                    <option key={0} value={0}>No preference</option>
                    {Object.values(this.props.providers).map(provider =>
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                    )}
                </select>
                <div>
                    <h3>News providers to display</h3>
                    {providerList}
                </div>
                <div>
                    <h3>Dark Mode</h3>
                    <div className="providerSelection">
                        <label htmlFor="toggleDarkMode">Enable dark mode</label>
                        <input
                            name="toggleDarkMode"
                            type="checkbox" id="toggleDarkMode"
                            checked={this.props.darkModeEnabled}
                            onChange={this.props.toggleDarkMode} />
                    </div>
                </div>
            </div>
        );
    }
}
