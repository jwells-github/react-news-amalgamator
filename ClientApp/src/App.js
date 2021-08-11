import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './components/NavMenu';
import { NewsFeed } from './components/NewsFeed';
import { Options } from './components/Options';
import { OptionsTab } from './components/OptionsTab';
import { CookieManager } from './CookieManager';
import './custom.css'

export default class App extends Component {

    static defaultProviders = {
        THE_GUARDIAN: { id: 1, name: "The Guardian", display: true },
        BBC_NEWS: { id: 2, name: "BBC News", display: true },
        DAILY_MAIL: { id: 3, name: "Daily Mail Online", display: true },
        THE_TELEGRAPH: { id: 4, name: "The Telegraph", display: true }
    }
    constructor(props) {
        super(props);
        this.state = {
            preferredProvider: CookieManager.getPreferredProviderFromCookie(),
            providers: CookieManager.getProvidersFromCookie(App.defaultProviders),
            displayOptions: false,
            darkModeEnabled: CookieManager.getDarkModeFromCookie(),
        };
        this.changeProviderPreference = this.changeProviderPreference.bind(this);
        this.toggleDisplayedProviders = this.toggleDisplayedProviders.bind(this);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.toggleOptionsDisplay = this.toggleOptionsDisplay.bind(this);
        this.setDarkMode(this.state.darkModeEnabled);
    }

    changeProviderPreference(e) {
        let provider = parseInt(e.target.value);
        document.cookie = CookieManager.preferredProviderCookieName + '=' + provider
        this.setState({ preferredProvider: provider });
    }

    toggleDisplayedProviders(e) {
        const target = e.target;
        const checked = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        // Create a deep copy, otherwise the state will also be updated
        // Updating state directly will prevent child components from being updated
        let providers = JSON.parse(JSON.stringify(this.state.providers));
        providers[name].display = checked;
        document.cookie = name + "=" + checked;
        this.setState({ providers: providers })
    }

    toggleDarkMode(e) {
        const target = e.target;
        const checked = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({ darkModeEnabled: checked });
        document.cookie = CookieManager.darkModeCookieName + "=" + checked;
        this.setDarkMode(checked);
    }

    setDarkMode(bool) {
        document.body.className = bool ? "dark" : "";
    }

    toggleOptionsDisplay() {
        this.setState({displayOptions:!this.state.displayOptions})
    }

  render () {
    return (
        <div>
            <NavMenu toggleOptionsDisplay={this.toggleOptionsDisplay}/>
            <Container>
                <NewsFeed
                    preferredProvider={this.state.preferredProvider}
                    providers={this.state.providers}
                    displayOptions={this.state.displayOptions}/>
            </Container>
            <OptionsTab displayOptions={this.state.displayOptions}  toggleOptionsDisplay={this.toggleOptionsDisplay}>
                <Options
                    preferredProvider={this.state.preferredProvider}
                    providers={this.state.providers}
                    darkModeEnabled={this.state.darkModeEnabled}
                    changeProviderPreference={this.changeProviderPreference}
                    toggleDisplayedProviders={this.toggleDisplayedProviders}
                    toggleDarkMode={this.toggleDarkMode}
                    />
            </OptionsTab>
        </div>
    );
  }
}
