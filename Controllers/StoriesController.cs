using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

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
            List<AmalgamatedStory> amalgamatedStories = new List<AmalgamatedStory>();

            amalgamatedStories = amalgamateStories(amalgamatedStories, bbcNewsList);
            amalgamatedStories = amalgamateStories(amalgamatedStories, guardianNewsList);
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
            
            List<AmalgamatedStory> amalgamatedStories = alreadyAmalgamatedStories;
            foreach (NewsStory story in storiesToAmalgamate)
            {
                int highestMatches = 0;
                AmalgamatedStory highestMatchingStory = null;    
                foreach (AmalgamatedStory amalgamatedStory in amalgamatedStories)
                {
                    string[] storyTitle = story.Title.Split(" ");
                    string[] amalgamatedTitle = amalgamatedStory.MasterTitle.Split(" ");

                    int titleMatches = 0;
                    foreach (string word in amalgamatedTitle)
                    {
                        int indexNormal = -1;
                        int indexLower = Array.FindIndex(storyTitle, x => x.ToLower().Trim(new char[] {'"', '\'' }) == word.ToLower().Trim(new char[] { '"', '\'' }));
                        if (word.Any(char.IsUpper))
                        {
                            indexNormal = Array.FindIndex(storyTitle, x => x == word);
                        }
                        // The word exists in the array
                        if (indexLower > -1)
                        {
                            if (word.Length >= 4)
                            {
                                titleMatches += indexNormal > -1 ? 3 : 1;
                            }
                        }
                    }
                    if (titleMatches >= 4 && titleMatches > highestMatches) 
                    {
                        Console.WriteLine("old: {0}, new:{1}",highestMatches,titleMatches);
                        highestMatchingStory = amalgamatedStory;
                        highestMatches = titleMatches;
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

