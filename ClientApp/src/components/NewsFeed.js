import React, { Component } from 'react';
import { AmalgamatedStory } from './AmalgamatedStory';


export class NewsFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storyData: [],
            loading: true,
            filteredStories: [],
        };
    }

    componentDidMount() {
        this.fetchStories();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.preferredProvider !== this.props.preferredProvider ||
            prevProps.providers !== this.props.providers) {
            this.applyProviderPreference()
        }

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

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : NewsFeed.renderStories(this.state.filteredStories);
        return (
            <div>
                <h1>News Amalgamator</h1>
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
                let providers = Object.values(this.props.providers)
                providers.forEach(provider => {
                    if (provider.id === story.provider) {
                        displayStory = provider.display;
                    }
                })
                return displayStory;
            });
            let storiesAvailable = chosenProviders.length > 0;
            chosenProviders.forEach(story => {
                if (story.provider === this.props.preferredProvider) {
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
        this.setState({ loading: false, filteredStories: this.sortStoriesbyDate(filteredStories) });
    }
    sortStoriesbyDate(stories) {
        let sortedStories = stories.sort((firstStory, secondStory) => {
            return new Date(Date.parse(secondStory.mainStory.date)) - new Date(Date.parse(firstStory.mainStory.date))
        })
        return sortedStories;
    }
}
