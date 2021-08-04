import React, { Component } from 'react';
import { AmalgamatedStory } from './AmalgamatedStory';

export class FetchData extends Component {
    static displayName = FetchData.name;
    static Provider = {
        THE_GUARDIAN: { id: 1, name: "The Guardian" },
        BBC_NEWS: { id: 2, name: "BBC News" },
        DAILY_MAIL: { id: 3, name: "Daily Mail Online" },
        THE_TELEGRAPH: { id: 4, name: "The Telegraph" }
    };
    constructor(props) {
        super(props);
        this.state = {
            storyData: [],
            loading: true,
            provider: FetchData.Provider.THE_GUARDIAN.id,
            bannedProviders: [],
            filteredStories: []

        };
        this.changeProviderPreference = this.changeProviderPreference.bind(this);
    }

    componentDidMount() {
        this.populateWeatherData();
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


    changeProviderPreference(e) {
        this.setState({ provider: parseInt(e.target.value) },
            this.applyProviderPreference
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : FetchData.renderStories(this.state.filteredStories);
        let providers = Object.values(FetchData.Provider)

        return (
            <div>
                <h1>Weather forecast</h1>
                <select value={this.state.provider} onChange={this.changeProviderPreference}>
                    {providers.map(provider =>
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                    )}
                </select>
                {contents}
            </div>
        );
    }

    async populateWeatherData() {
        const response = await fetch('stories');
        const data = await response.json();
        this.setState({ storyData: data },
            this.applyProviderPreference
        );
            
    }


    applyProviderPreference() {
        this.setState({loading: true})
        let filteredStories = [];
        this.state.storyData.map(amalgamatedStory => {
            let mainStory;
            let childStories = [];
            let chosenProviders = amalgamatedStory.stories.filter(story => !this.state.bannedProviders.includes(story.provider));
            let storiesAvailable = chosenProviders.length > 0;
            chosenProviders.map(story => {
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
