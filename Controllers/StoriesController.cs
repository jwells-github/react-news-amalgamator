using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml;

namespace react_news_app.Controllers
{
    [Route("[controller]")]
    public class StoriesController : ControllerBase
    {

        [HttpGet]
        public IEnumerable<AmalgamatedStory> Get()
        {
            List<NewsStory> guardianNewsList = getStories("https://www.theguardian.com/world/rss");
            List<NewsStory> bbcNewsList = getStories("http://feeds.bbci.co.uk/news/rss.xml");
            List<NewsStory> dailyMailList = getStories("https://www.dailymail.co.uk/news/index.rss");
            List<AmalgamatedStory> amalgamatedStories = new List<AmalgamatedStory>();

            amalgamatedStories = amalgamateStories(amalgamatedStories, bbcNewsList);
            amalgamatedStories = amalgamateStories(amalgamatedStories, guardianNewsList);
            amalgamatedStories = amalgamateStories(amalgamatedStories, dailyMailList);
            return amalgamatedStories.ToArray();
        }

        public List<NewsStory> getStories(string Url)
        {
            XmlDocument doc = new XmlDocument();
            doc.Load(Url);
            XmlNodeList rssNodes = doc.SelectNodes("rss/channel/item");
            List<NewsStory> newsList = new List<NewsStory>();
            foreach (XmlNode node in rssNodes)
            {
                NewsStory story = new NewsStory
                {
                    Title = node.SelectSingleNode("title").InnerText,
                    Description = node.SelectSingleNode("description").InnerText,
                    Date = DateTime.Now,
                    StoryUrl = node.SelectSingleNode("link").InnerText,
                    ImageUrl = "image url",
                };
                newsList.Add(story);
            }
            return newsList;
        }

        public List<AmalgamatedStory> amalgamateStories(List<AmalgamatedStory> alreadyAmalgamatedStories, List<NewsStory> storiesToAmalgamate)
        {
            char[] charactersToTrim = new char[] { '"', '\'', '-', '?', '!', '`', };
            List<AmalgamatedStory> amalgamatedStories = alreadyAmalgamatedStories;
            foreach (NewsStory story in storiesToAmalgamate)
            {
                int highestMatchScore = 0;
                AmalgamatedStory highestMatchingStory = null;
                foreach (AmalgamatedStory amalgamatedStory in amalgamatedStories)
                {
                    string[] storyTitle = story.Title.Split(" ");   
                    string[] storyDescription = story.Description.Split(" ");
                    string[] amalgamatedTitle = amalgamatedStory.MasterTitle.Split(" ");
                    string[] missing = storyTitle.Except(amalgamatedTitle).Concat(amalgamatedTitle.Except(storyTitle)).ToArray();
                    int matchScore = 0;

                    foreach (string word in amalgamatedTitle)
                    {
                        if(word.Length < 4)
                        {
                            continue;
                        }
                        int indexTitleCaseSensitive = -1; // No match by default
                        int indexTitleLowercase = Array.FindIndex(storyTitle, x => x.ToLower().Trim(charactersToTrim) == word.ToLower().Trim(charactersToTrim));
                        int indexDescription = Array.FindIndex(storyDescription, x => x.ToLower().Trim(charactersToTrim) == word.ToLower().Trim(charactersToTrim));
                        bool wordContainsCapitals = word.Any(char.IsUpper);
                        if (wordContainsCapitals)
                        {
                            indexTitleCaseSensitive = Array.FindIndex(storyTitle, x => x == word);
                        }
                        // The word exists in the title
                        if (indexTitleLowercase > -1)
                        {
                                matchScore += indexTitleCaseSensitive > -1 ? word.Length : (word.Length / 2 );
                        }
                        // The word exists in the description
                        else if(indexDescription > -1)
                        {
                            matchScore += word.Length / 2;
                        }
                        else
                        {
                            matchScore -= wordContainsCapitals ? word.Length : 1;
                        }
                    }
                    int divisor = 4;
                    int defaultMatchMin = 3;
                    int matchMinimum = (storyTitle.Count() / divisor) >= defaultMatchMin ? storyTitle.Count() / divisor : defaultMatchMin;
                    if (matchScore >= matchMinimum && matchScore > highestMatchScore) 
                    {
                        highestMatchingStory = amalgamatedStory;
                        highestMatchScore = matchScore;
                    }
                }
                if(highestMatchingStory != null)
                {
                    highestMatchingStory.Stories.Add(story);
                    highestMatchingStory.numberOfStories = highestMatchingStory.Stories.Count();
                }
                else
                {
                    AmalgamatedStory newAmalgamatedStory = new AmalgamatedStory
                    {
                        MasterDescription = story.Description,
                        MasterTitle = story.Title,
                        MasterStoryUrl = story.StoryUrl
                    };
                    amalgamatedStories.Add(newAmalgamatedStory);
                }
            }
            return amalgamatedStories;
        }
    }
}

