import React, { Component } from 'react';
import { AmalgamatedStory } from './AmalgamatedStory';

export class FetchData extends Component {
    static displayName = FetchData.name;
    static darkModeCookieName = "darkmode"
    static preferredProviderCookieName = "preferedProvider"

    constructor(props) {
        super(props);
        this.state = {
            storyData: [],
            loading: true,
            preferredProvider: 0,
            filteredStories: [],
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
        this.toggleDisplayedProviders = this.toggleDisplayedProviders.bind(this);
        this.toggleOptionsTab = this.toggleOptionsTab.bind(this);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.optionsTab = React.createRef()

        this.getPreferencesFromCookies();
        this.setDarkMode(this.state.darkModeEnabled);
    }

    componentDidMount() {
        this.fetchStories();
    }

    getPreferencesFromCookies() {
        // state.preferredProvider setting
        let preferedProviderCookieExists = document.cookie.split(';').some((item) => item.trim().startsWith(FetchData.preferredProviderCookieName + '='))
        this.state.preferredProvider = preferedProviderCookieExists ? document.cookie.split('; ').find(row => row.startsWith(FetchData.preferredProviderCookieName + '=')).split('=')[1] : 0;

        // state.providers display settings
        let providers = this.state.providers;
        Object.keys(this.state.providers).forEach(key =>
            providers[key].display = document.cookie.split(';').some((item) => item.includes(key + '=true'))
        )
        this.state.providers = providers;

        // state.darkModeEnabled setting
        this.state.darkModeEnabled = document.cookie.split(';').some((item) => item.includes(FetchData.darkModeCookieName + '=true'))
    }

    static renderStories(amalgamatedStories) {
        return (
            <div>
                {amalgamatedStories.map((amalgamatedStory, index) =>
                    <AmalgamatedStory key={index}
                        storyUrl={amalgamatedStory.mainStory.storyUrl}
                        title={amalgamatedStory.mainStory.title}
                        providerName={amalgamatedStory.mainStory.providerName}
                        description={amalgamatedStory.mainStory.description}
                        storyDate={amalgamatedStory.mainStory.date}
                        childStories={amalgamatedStory.childStories} />
                )}
            </div>
        )
    }

    toggleDisplayedProviders(e) {
        const target = e.target;
        const checked = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        let providers = this.state.providers;
        providers[name].display = checked;
        document.cookie = name + "=" + checked;
        this.setState({ providers: providers },
            this.applyProviderPreference
        )
    }
    changeProviderPreference(e) {
        let provider = parseInt(e.target.value);
        document.cookie = FetchData.preferredProviderCookieName + '=' + provider
        this.setState({ preferredProvider: provider },
            this.applyProviderPreference
        );
    }

    toggleOptionsTab() {
        this.optionsTab.current.className = !this.state.displayOptions ? "options-bar show-options" : "options-bar hide-options"
        this.setState({ displayOptions: !this.state.displayOptions });
    }

    toggleDarkMode(e) {
        const target = e.target;
        const checked = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({ darkModeEnabled: checked });
        document.cookie = FetchData.darkModeCookieName + "=" + checked;
        this.setDarkMode(checked);
    }

    setDarkMode(bool) {
        document.body.className = bool ? "dark" : "";
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : FetchData.renderStories(this.state.filteredStories);
        let providerList = [];
        for (const [key, provider] of Object.entries(this.state.providers)) {
            providerList.push(
                <div className="providerSelection" key={provider.id}>
                    <label htmlFor={provider.name}>{provider.name}</label>
                    <input
                        name={key}
                        type="checkbox" id={provider.name}
                        checked={provider.display}
                        onChange={this.toggleDisplayedProviders} />

                </div>)
        }

        return (
            <div>
                <h1>News Amalgamator</h1>
                <button onClick={this.toggleOptionsTab}>Toggle Options</button>
                <div className="hidden" ref={this.optionsTab}>
                    <h2>Options</h2>
                    <h3>Preferred news provider</h3>
                    <select value={this.state.preferredProvider} onChange={this.changeProviderPreference}>
                        <option key={0} value={0}>No preference</option>
                        {Object.values(this.state.providers).map(provider =>
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
                                checked={this.state.darkModeEnabled}
                                onChange={this.toggleDarkMode} />
                        </div>
                    </div>
                </div>
                {contents}
            </div>
        )
    }

    async fetchStories() {
        const response = await fetch('stories');
        const data = await response.json();
        this.setState({ storyData: data },
            this.applyProviderPreference
        );

    }


    applyProviderPreference() {
        this.setState({ loading: true })
        let filteredStories = [];
        this.state.storyData.forEach(amalgamatedStory => {
            let mainStory;
            let childStories = [];
            let chosenProviders = amalgamatedStory.stories.filter(story => {
                let displayStory = true;;
                let providers = Object.values(this.state.providers)
                providers.forEach(provider => {
                    if (provider.id === story.provider) {
                        displayStory = provider.display;
                    }
                })
                return displayStory;
            });
            let storiesAvailable = chosenProviders.length > 0;
            chosenProviders.forEach(story => {
                if (story.provider === this.state.preferredProvider) {
                    mainStory = story
                }
                else {
                    childStories.push(story)
                }
            })
            if (mainStory === undefined) {
                mainStory = childStories[0];
                childStories.shift();
            }
            if (storiesAvailable) {
                filteredStories.push({ mainStory: mainStory, childStories: childStories });
            }

        })
        this.setState({ loading: false, filteredStories: filteredStories });
    }
}
