import React, { Component } from 'react';
import { FormattedDate } from './FormattedDate';

export class AmalgamatedStory extends Component {

    constructor(props) {
        super(props);
        this.state = { childStoriesVisible: false, storyCompacted: false };
        this.toggleChildStories = this.toggleChildStories.bind(this);
        this.toggleCompactStory = this.toggleCompactStory.bind(this);
    }

    toggleChildStories(e) {
        let childStoriesDiv = e.target.nextElementSibling;
        this.setState({ childStoriesVisible: childStoriesDiv.classList.contains("hidden")})
    }
    toggleCompactStory(e) {
        let storyDetails = e.target.parentElement.nextElementSibling;
        this.setState({ storyCompacted: !storyDetails.classList.contains("hidden")})
    }

    render() {
        return (
            <div className="story">
                <div className="story-header">
                    <button onClick={this.toggleCompactStory}>{this.state.storyCompacted ? "+" : "-" }</button>
                    <h2>
                        <a target="_blank" href={this.props.storyUrl}>{this.props.title}</a>
                    </h2>
                </div>
                <div className={this.state.storyCompacted ? "hidden" : "story-details"}  >
                    <div>
                        <div class="story-meta">
                            <em>Posted by {this.props.providerName} on <FormattedDate date={this.props.storyDate}/></em>
                        </div>
                        <p className="story-description" dangerouslySetInnerHTML={{ __html: this.props.description }}></p>
                    </div>
                    <div>
                        {this.props.childStories.length > 0 ? <button onClick={this.toggleChildStories}>{this.state.childStoriesVisible ? 'Click to hide similiar stories' : 'Click to view similiar stories'}</button> : ''}
                        <div className={ this.state.childStoriesVisible ? "" : "hidden"}>
                            {this.props.childStories.map((story, index) =>
                                <span key={index}> {story.providerName} -  <a href={story.storyUrl}>{story.title}</a> - <FormattedDate date={story.date} /><br></br></span>

                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
