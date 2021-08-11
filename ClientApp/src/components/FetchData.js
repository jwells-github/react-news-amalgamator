import React, { Component } from 'react';
import { AmalgamatedStory } from './AmalgamatedStory';
import { Options } from './Options';
import { OptionsTab } from './OptionsTab';

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
        this.toggleDarkMode = this.toggleDarkMode.bind(this);

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
        Object.keys(this.state.providers).forEach(key => {
            let cookieExistsForProvider = document.cookie.split(';').some((item) => item.trim().startsWith(key + '='))
            if (cookieExistsForProvider) {
                providers[key].display = document.cookie.split(';').some((item) => item.includes(key + '=true'))
            }
        })
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


        return (
            <div>
                <h1>News Amalgamator</h1>
                <button onClick={() => this.setState({ displayOptions: !this.state.displayOptions})}>Toggle Options</button>
                <OptionsTab displayOptions={this.state.displayOptions}>
                    <Options
                        preferredProvider={this.state.preferredProvider}
                        changeProviderPreference={this.changeProviderPreference}
                        providers={this.state.providers}
                        toggleDisplayedProviders={this.toggleDisplayedProviders}
                        darkModeEnabled={this.state.darkModeEnabled}
                        toggleDarkMode={this.toggleDarkMode}
                    />
                </OptionsTab>

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
