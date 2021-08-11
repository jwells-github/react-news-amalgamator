import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './components/NavMenu';
import { NewsFeed } from './components/NewsFeed';
import { Options } from './components/Options';
import { OptionsTab } from './components/OptionsTab';
import './custom.css'

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            preferredProvider: 0,
            providers: {
                THE_GUARDIAN: { id: 1, name: "The Guardian", display: true },
                BBC_NEWS: { id: 2, name: "BBC News", display: true },
                DAILY_MAIL: { id: 3, name: "Daily Mail Online", display: true },
                THE_TELEGRAPH: { id: 4, name: "The Telegraph", display: true }
            },
            displayOptions: false,
            darkModeEnabled: false,
        };
        this.changeProviderPreference = this.changeProviderPreference.bind(this);
        this.getPreferencesFromCookies();
        this.toggleDisplayedProviders = this.toggleDisplayedProviders.bind(this);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.toggleOptionsDisplay = this.toggleOptionsDisplay.bind(this);
        this.setDarkMode(this.state.darkModeEnabled);
    }

    getPreferencesFromCookies() {
        // state.preferredProvider setting
        let preferedProviderCookieExists = document.cookie.split(';').some((item) => item.trim().startsWith(NewsFeed.preferredProviderCookieName + '='))
        this.state.preferredProvider = preferedProviderCookieExists ? document.cookie.split('; ').find(row => row.startsWith(NewsFeed.preferredProviderCookieName + '=')).split('=')[1] : 0;

        // state.providers display settings
        let providers = this.state.providers;
        Object.keys(this.state.providers).forEach(key => {
            let cookieExistsForProvider = document.cookie.split(';').some((item) => item.trim().startsWith(key + '='))
            if (cookieExistsForProvider) {
                providers[key].display = document.cookie.split(';').some((item) => item.includes(key + '=true'))
            }
        })
        this.state.providers = providers;

        // state.darkModeEnabled setting
        this.state.darkModeEnabled = document.cookie.split(';').some((item) => item.includes(NewsFeed.darkModeCookieName + '=true'))
    }

    changeProviderPreference(e) {
        let provider = parseInt(e.target.value);
        document.cookie = NewsFeed.preferredProviderCookieName + '=' + provider
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
        document.cookie = NewsFeed.darkModeCookieName + "=" + checked;
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
