import React, { Component } from 'react';
import { AmalgamatedStory } from './AmalgamatedStory';


export class NewsFeed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            storyData: [],
            loading: true,
            filteredStories: [],
            sortMethod: 0,
            sortText: "",
        };
        this.cycleSortMethod = this.cycleSortMethod.bind(this);
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

    cycleSortMethod() {
        const numberOfSortMethods = 2;
        let sortMethod = this.state.sortMethod < numberOfSortMethods ? (this.state.sortMethod) + 1 : 1
        switch (sortMethod) {
            case 1:
                this.setState({ filteredStories: this.sortStoriesByDate(this.state.filteredStories), sortText: "Sorting by Date" });
                break;
            case 2:
                this.setState({
                    filteredStories: this.sortStoriesByChildCount(this.state.filteredStories), sortText: "Sorting by Number of Similiar Stories"});
                break;
            default:
                break;
        }
        this.setState({ sortMethod: sortMethod } )
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
                <h2>{this.state.sortText}</h2>
                <button onClick={this.cycleSortMethod}>Change sort method</button>
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
        this.setState({ loading: false, filteredStories: filteredStories }, () =>
            this.cycleSortMethod()
        );

    }

    sortStoriesByDate(stories) {
        let sortedStories = stories.sort((firstStory, secondStory) => {
            return new Date(Date.parse(secondStory.mainStory.date)) - new Date(Date.parse(firstStory.mainStory.date))
        })
        return sortedStories;
    }

    sortStoriesByChildCount(stories) {
        let sortedStories = stories.sort((firstStory, secondStory) => {
            return secondStory.childStories.length - firstStory.childStories.length;
        })
        return sortedStories;
    }
}
