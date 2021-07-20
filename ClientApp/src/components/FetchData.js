import React, { Component } from 'react';

export class FetchData extends Component {
    static displayName = FetchData.name;
    static Provider = {
        NOT_SET: 0,
        THE_GUARDIAN: 1,
        BBC_NEWS: 2,
        DAILY_MAIL: 3,
        THE_TELEGRAPH: 4
    };
  constructor(props) {
    super(props);
      this.state = { forecasts: [], loading: true, provider: 1, filteredStories:[] };
  }

  componentDidMount() {
    this.populateWeatherData();
    }   
    static renderStories(amalgamatedStories) {
        return (
            <div>
                {amalgamatedStories.map(amalgamatedStory =>
                    <div>
                        <div>
                            <div>
                                <img/>
                            </div>
                            <div>
                                <h2>
                                    <a href={amalgamatedStory.mainStory.storyUrl}>{amalgamatedStory.mainStory.title}</a>
                                </h2>
                                <p dangerouslySetInnerHTML={{ __html: amalgamatedStory.mainStory.description }}></p>
                            </div>
                        </div>
                        <div>
                            {amalgamatedStory.childStories.map(story =>
                                <a href={story.storyUrl}>{story.title}<br></br></a>
                            )}
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
