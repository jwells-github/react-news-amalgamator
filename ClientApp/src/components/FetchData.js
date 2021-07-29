import React, { Component } from 'react';

export class FetchData extends Component {
    static displayName = FetchData.name;
    static Provider = {
        NOT_SET: {id:0, name: ""},
        THE_GUARDIAN: { id: 1, name: "The Guardian" },
        BBC_NEWS: { id: 2, name: "BBC News" },
        DAILY_MAIL: { id: 3, name: "Daily Mail Online" },
        THE_TELEGRAPH: { id: 4, name: "The Telegraph" }
    };
    constructor(props) {
        super(props);
        this.state = { forecasts: [], loading: true, provider: 1, filteredStories:[] };
    }

    componentDidMount() {
        this.populateWeatherData();
    }

    static renderStories(amalgamatedStories) {
        function toggleChildStories(e) {
            let button = e.target;
            let childStoriesDiv = e.target.nextElementSibling;
            if (childStoriesDiv.classList.contains("hidden")) {
                button.innerHtml = "Click to hide similiar Stories"
                childStoriesDiv.classList.remove("hidden");
            }
            else {
                button.innerHtml = "Click to view similiar Stories"
                childStoriesDiv.classList.add("hidden");
            }
        }
        function toggleCompactStory(e) {
            let button = e.target;
            let storyDetails = e.target.parentElement.nextElementSibling;
            if (storyDetails.classList.contains("hidden")) {
                button.innerHtml = "-"
                storyDetails.classList.remove("hidden");
            }
            else {
                button.innerHtml = "+"
                storyDetails.classList.add("hidden");
            }
        }
        return (
            <div>
                {amalgamatedStories.map(amalgamatedStory =>
                    <div className="story">
                        <div className="story-header">
                            <button onClick={toggleCompactStory}>-</button>
                            <h2>
                                <a href={amalgamatedStory.mainStory.storyUrl}>{amalgamatedStory.mainStory.title}</a>
                            </h2>
                        </div>
                        <div className="story-details">
                            <div>
                                <p>Story from {amalgamatedStory.mainStory.providerName}</p>
                                <p dangerouslySetInnerHTML={{ __html: amalgamatedStory.mainStory.description }}></p>
                            </div>
                            <div>
                                {amalgamatedStory.childStories.length > 0 ? <button onClick={toggleChildStories}>Click to view similiar stories</button> : '' }
                                <div className="hidden">
                                    {amalgamatedStory.childStories.map(story =>
                                        <span> {story.providerName} -  <a href={story.storyUrl}>{story.title}</a> - {story.highestMatchScore}<br></br></span>

                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    )}
            </div>
        )
    }

  render() {
    let contents = this.state.loading
        ? <p><em>Loading...</em></p>
        : FetchData.renderStories(this.state.filteredStories);
        
      return (
        <div>
            <h1>Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            {contents}
        </div>
    );
  }

    async populateWeatherData() {
        const response = await fetch('stories');
        const data = await response.json();
        this.setState({ forecasts: data });
        this.applyProviderPreference(data)     
    }

    applyProviderPreference(data) {
        let filteredStories = [];
        data.map(amalgamatedStory => {
            let mainStory;
            let childStories = [];
            amalgamatedStory.stories.map(story => {
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
            filteredStories.push({ mainStory: mainStory, childStories: childStories });
        })
        this.setState({ forecasts: data, loading: false, filteredStories: filteredStories });
    }
}
