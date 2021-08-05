import React, { Component } from 'react';
import { AmalgamatedStory } from './AmalgamatedStory';

export class FetchData extends Component {
    static displayName = FetchData.name;

    constructor(props) {
        super(props);
        this.state = {
            storyData: [],
            loading: true,
            provider: 0,
            filteredStories: [],
            providers: {
                THE_GUARDIAN: { id: 1, name: "The Guardian", display: true },
                BBC_NEWS: { id: 2, name: "BBC News", display: true },
                DAILY_MAIL: { id: 3, name: "Daily Mail Online", display: true },
                THE_TELEGRAPH: { id: 4, name: "The Telegraph", display: true }
            }
        };
        this.changeProviderPreference = this.changeProviderPreference.bind(this);
        this.toggleDisplayedProviders = this.toggleDisplayedProviders.bind(this);
    }

    componentDidMount() {
        this.fetchStories();
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
                        storyDate={amalgamatedStory.mainStory.date }
                        childStories={amalgamatedStory.childStories}/>
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
        this.setState({ providers: providers },
            this.applyProviderPreference
        )
    }
    changeProviderPreference(e) {
        console.log('why')
        this.setState({ provider: parseInt(e.target.value) },
            this.applyProviderPreference
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : FetchData.renderStories(this.state.filteredStories);
        let providerList = [];
        for (const [key, provider] of Object.entries(this.state.providers)) {
            providerList.push(
                <div key={provider.id}>
                    <input
                        name={key}
                        type="checkbox" id={provider.name}
                        checked={provider.display}
                        onChange={this.toggleDisplayedProviders} />
                    <label htmlFor={provider.name}>{provider.name}</label>
                </div>)
        }

        return (
            <div>
                <h1>News Amalgamator</h1>
                <h2>Preferred news provider</h2>
                <select value={this.state.provider} onChange={this.changeProviderPreference}>
                    <option key={0} value={0}>No preference</option>
                    {Object.values(this.state.providers).map(provider =>
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                    )}
                </select>
                <div>
                    <h2>News providers to display</h2>
                    {providerList}
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
        this.setState({loading: true})
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
                if (story.provider === this.state.provider) {
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
