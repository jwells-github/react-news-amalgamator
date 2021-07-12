using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace react_news_app.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StoriesController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<AmalgamatedStory> Get()
        {
            XmlDocument doc = new XmlDocument();
            doc.Load("https://www.theguardian.com/world/rss");
            XmlNodeList rssNodes = doc.SelectNodes("rss/channel/item");
            List<NewsStory> guardianNewsList = new List<NewsStory>();
            foreach(XmlNode node in rssNodes)
            {
                NewsStory story = new NewsStory { 
                    Title = node.SelectSingleNode("title").InnerText,
                    Description = node.SelectSingleNode("description").InnerText,
                    Date = DateTime.Now,
                    StoryUrl = node.SelectSingleNode("link").InnerText,
                    ImageUrl = "image url",
                };
                guardianNewsList.Add(story);
            }

            XmlDocument bbcdoc = new XmlDocument();
            doc.Load("http://feeds.bbci.co.uk/news/rss.xml");
            XmlNodeList bbcrssNodes = doc.SelectNodes("rss/channel/item");
            List<NewsStory> bbcNewsList = new List<NewsStory>();
            Console.WriteLine(bbcrssNodes.Count);
            foreach (XmlNode node in bbcrssNodes)
            {
                NewsStory story = new NewsStory
                {
                    Title = node.SelectSingleNode("title").InnerText,
                    Description = node.SelectSingleNode("description").InnerText,
                    Date = DateTime.Now,
                    StoryUrl = node.SelectSingleNode("link").InnerText,
                    ImageUrl = "image url",
                };
                bbcNewsList.Add(story);
            }

            List<AmalgamatedStory> amalgamatedStories = new List<AmalgamatedStory>();
            foreach(NewsStory story in bbcNewsList)
            {
                AmalgamatedStory amalgamatedStory = new AmalgamatedStory
                {
                    MasterDescription = story.Description,
                    MasterTitle = story.Title,
                    MasterStoryUrl = story.StoryUrl
                };
                amalgamatedStories.Add(amalgamatedStory);
            }

            foreach(NewsStory story in guardianNewsList)
            {
                bool addNewStory = false;
                foreach(AmalgamatedStory amalgamatedStory in amalgamatedStories)
                {
                    string[] storyTitle = story.Title.Split(" ");
                    string[] amalgamatedTitle = amalgamatedStory.MasterTitle.Split(" ");
                    
                    int titleMatches = 0;
                    foreach(string word in amalgamatedTitle)
                    {
                        int indexNormal = Array.FindIndex(storyTitle, x => x == word);
                        int indexLower = Array.FindIndex(storyTitle, x => x.ToLower() == word.ToLower());
                        if (word.Any(char.IsUpper)){

                        }
                        // The word exists in the array
                        if (indexNormal > -1 || indexLower > -1)
                        {
                            if(word.Length >= 4)
                            {

                                titleMatches++;
                            }
                        }
                    }
                    if (titleMatches >= 2)
                    {
                        amalgamatedStory.Stories.Add(story);
                        amalgamatedStory.numberOfStories = amalgamatedStory.Stories.Count();
                        addNewStory = false;
                        break;
                    }
                    else
                    {
                        addNewStory = true;
                    }
                }
                if (addNewStory)
                {
                    AmalgamatedStory newAmalgamatedStory = new AmalgamatedStory
                    {
                        MasterDescription = story.Description,
                        MasterTitle = story.Title,
                        MasterStoryUrl = story.StoryUrl
                    };
                    amalgamatedStories.Add(newAmalgamatedStory);
                    addNewStory = false;
                }
            }
            Console.WriteLine(amalgamatedStories);
            return amalgamatedStories.ToArray();
        }
    }
}
