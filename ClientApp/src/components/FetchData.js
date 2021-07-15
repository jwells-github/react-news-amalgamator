import React, { Component } from 'react';

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { forecasts: [], loading: true };
  }

  componentDidMount() {
    this.populateWeatherData();
    }


  static renderForecastsTable(forecasts) {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Title</th>
            <th>Descrption</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
             <tr key={forecast.date}>
                <td><a href={forecast.masterStoryUrl}>{forecast.masterTitle}</a></td>
                <td>{forecast.masterDescription}</td>
                <td>{forecast.numberOfStories}</td>
                {forecast.stories.map(story =>
                    <td><a href={story.storyUrl}>{story.title}</a></td>
                )}
            </tr>
          )}
        </tbody>
      </table>
    );
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
                                    <a href={amalgamatedStory.masterStoryUrl}>{amalgamatedStory.masterTitle}</a>
                                </h2>
                                <p dangerouslySetInnerHTML={{ __html: amalgamatedStory.masterDescription }}></p>
                            </div>
                        </div>
                        <div>
                            {amalgamatedStory.stories.map(story =>
                                
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
        : FetchData.renderStories(this.state.forecasts);
        
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
    this.setState({ forecasts: data, loading: false });
    console.log(data);
  }
}
