using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Xml;

namespace react_news_app.Controllers
{
    [Route("[controller]")]
    public class StoriesController : ControllerBase
    {
        
        private const string dateTimeFormat = "ddd, dd MMM yyyy HH:mm:ss";
        private const string StoriesCacheKey = "CACHED_STORIES";
        private TimeSpan CacheExpiryTime = TimeSpan.FromMinutes(3);
        private IMemoryCache _cache;

        public StoriesController(IMemoryCache memoryCache)
        {
            _cache = memoryCache;
        }

        [HttpGet]
        public IEnumerable<AmalgamatedStory> Get()
        {
            if (_cache.TryGetValue(StoriesCacheKey, out IEnumerable<AmalgamatedStory> cachedAmalgamatedStories))
            {
                return cachedAmalgamatedStories;
            }
            IEnumerable<AmalgamatedStory> amalgamtedStories = getAmalgamtedStories();
            _cache.Set(StoriesCacheKey, amalgamtedStories, CacheExpiryTime);
            return amalgamtedStories;
        }


        public IEnumerable<AmalgamatedStory> getAmalgamtedStories()
        {
            List<NewsStory> guardianNewsList = getStoriesFromFeed(NewsFeeds.THE_GUARDIAN_FEED);
            List<NewsStory> bbcNewsList = getStoriesFromFeed(NewsFeeds.BBC_NEWS_FEED);
            List<NewsStory> dailyMailList = getStoriesFromFeed(NewsFeeds.DAILY_MAIL_FEED);
            List<NewsStory> telegraphList = getStoriesFromFeed(NewsFeeds.THE_TELEGRAPH_FEED);
            List<AmalgamatedStory> amalgamatedStories = new List<AmalgamatedStory>();
            amalgamatedStories = amalgamateStories(amalgamatedStories, bbcNewsList);
            amalgamatedStories = amalgamateStories(amalgamatedStories, guardianNewsList);
            amalgamatedStories = amalgamateStories(amalgamatedStories, dailyMailList);
            amalgamatedStories = amalgamateStories(amalgamatedStories, telegraphList);
            amalgamatedStories = amalgamatedStories.OrderByDescending(x => x.numberOfStories).ToList();
            return amalgamatedStories.ToArray();
        }

        public List<NewsStory> getStoriesFromFeed(string Url)
        {
            List<NewsStory> newsList = new List<NewsStory>();
            try
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(Url);
                XmlNodeList rssNodes = doc.SelectNodes("rss/channel/item");

                foreach (XmlNode node in rssNodes)
                {
                    string title = node.SelectSingleNode("title") == null ? null : node.SelectSingleNode("title").InnerText;
                    string description = node.SelectSingleNode("description") == null ? "" : node.SelectSingleNode("description").InnerText;
                    string storyUrl = node.SelectSingleNode("link") == null ? null : node.SelectSingleNode("link").InnerText;
                    string pubDate = node.SelectSingleNode("pubDate") == null ? null : node.SelectSingleNode("pubDate").InnerText;
                    Provider provider = NewsStory.getProviderFromFeed(Url);
                    if (title == null || storyUrl == null)
                    {
                        continue;
                    }
                    NewsStory story = new NewsStory
                    {
                        Title = title,
                        Description = description,
                        Date = pubDate == null ? DateTime.Now : DateTime.ParseExact(pubDate.Substring(0, pubDate.Length - 4), dateTimeFormat, null),
                        StoryUrl = storyUrl,
                        ImageUrl = "image url",
                        Provider = provider,
                        ProviderName = NewsStory.getProviderName(provider)
                    };
                    newsList.Add(story);
                }
            }
            catch(Exception e)
            {
                Console.WriteLine("Failed to load stories for {0}", Url);
            }
            return newsList;
        }
        public List<AmalgamatedStory> amalgamateStories(List<AmalgamatedStory> alreadyAmalgamatedStories, List<NewsStory> storiesToAmalgamate)
        {
            char[] charactersToTrim = new char[] { '"', '\'', '-', '?', '!', '`', ',', '.' };
            List<AmalgamatedStory> amalgamatedStories = alreadyAmalgamatedStories;
            foreach(NewsStory story in storiesToAmalgamate)
            {
                int highestMatchScore = 0;
                AmalgamatedStory highestMatchingStory = null;
                foreach (AmalgamatedStory amalgamatedStory in amalgamatedStories)
                {
                    string[] storyTitle = story.Title.Trim(charactersToTrim).Split(" ");
                    bool previousWordWasCapitalAndMatched = false;
                    int matchScore = 0;
                    int divisor = 4;
                    int defaultMatchMin = 4;
                    int matchMinimum = (storyTitle.Count() / divisor) >= defaultMatchMin ? storyTitle.Count() / divisor : defaultMatchMin;
                    
                    foreach (string word in storyTitle)
                    {
                        bool wordContainsCapitals = word.Any(char.IsUpper);
                        if (word.Length < 4 && !wordContainsCapitals)
                        {
                            continue;
                        }
                        bool directMatch = amalgamatedStory.amalgamtedTitleWords.Contains(word);
                        bool lowerMatch = amalgamatedStory.amalgamtedTitleWords.Contains(word, StringComparer.OrdinalIgnoreCase);
                        
                        if (lowerMatch)
                        {
                            int score = 2;
                            if (directMatch)
                            {
                                score *= matchMinimum;
                                score *= previousWordWasCapitalAndMatched ? 2 : 1;
                                previousWordWasCapitalAndMatched = true;
                            }
                            else
                            {
                                previousWordWasCapitalAndMatched = false;
                            }
                            matchScore += score;
                        }
                        else
                        {
                            previousWordWasCapitalAndMatched = false;
                            matchScore -= wordContainsCapitals ? matchMinimum -1: 1;
                        }
                    }
                    if(matchScore >= matchMinimum && matchScore > highestMatchScore)
                    {
                        highestMatchingStory = amalgamatedStory;
                        highestMatchScore = matchScore;
                    }
                }
                story.highestMatchScore = highestMatchScore;
                if(highestMatchingStory != null)
                {
                    highestMatchingStory.Stories.Add(story);
                    highestMatchingStory.numberOfStories = highestMatchingStory.Stories.Count();
                    highestMatchingStory.amalgamtedTitleWords.Union(story.Title.Trim(charactersToTrim).Split(" ").ToList());
                }
                else
                {
                    AmalgamatedStory newAmalgamatedStory = new AmalgamatedStory
                    {
                        amalgamtedTitleWords = story.Title.Trim(charactersToTrim).Split(" ").ToList()
                    };
                    newAmalgamatedStory.Stories.Add(story);
                    amalgamatedStories.Add(newAmalgamatedStory);
                }
            }
            return amalgamatedStories;
        }

        /*
         * 
         * old Version
         * 
        public List<AmalgamatedStory> amalgamateStories(List<AmalgamatedStory> alreadyAmalgamatedStories, List<NewsStory> storiesToAmalgamate)
        {
            char[] charactersToTrim = new char[] { '"', '\'', '-', '?', '!', '`', ',', '.' };
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
                    bool previousWordWasCapitalAndMatched = false;
                    int matchScore = 0;
                    int divisor = 4;
                    int defaultMatchMin = 4;
                    int matchMinimum = (storyTitle.Count() / divisor) >= defaultMatchMin ? storyTitle.Count() / divisor : defaultMatchMin;
                    foreach (string word in amalgamatedTitle)   
                    {
                        bool wordContainsCapitals = word.Any(char.IsUpper);
                        if (word.Length < 4 && !wordContainsCapitals)
                        {
                            continue;
                        }
                        int indexTitleCaseSensitive = -1; // No match by default
                        int indexTitleLowercase = Array.FindIndex(storyTitle, x => x.ToLower().Trim(charactersToTrim) == word.ToLower().Trim(charactersToTrim));
                        int indexDescription = Array.FindIndex(storyDescription, x => x.ToLower().Trim(charactersToTrim) == word.ToLower().Trim(charactersToTrim));

                        if (wordContainsCapitals)
                        {
                            indexTitleCaseSensitive = Array.FindIndex(storyTitle, x => x == word);
                        }
                        // The word exists in the title
                        if (indexTitleLowercase > -1)
                        {
                            int score = matchMinimum / divisor;
                            score *= indexTitleCaseSensitive > -1 ? 2 : 1;
                            score *= previousWordWasCapitalAndMatched ? 2 : 1;
                            matchScore += score;
                            previousWordWasCapitalAndMatched = true;
                        }
                        // The word exists in the description
                        else if(indexDescription > -1)
                        {
                            matchScore += matchMinimum / divisor;
                        }
                        else
                        {
                            matchScore -= wordContainsCapitals ? matchMinimum / 2: matchMinimum / divisor;
                        }
                    }
                    if (matchScore >= matchMinimum && matchScore > highestMatchScore) 
                    {
                        highestMatchingStory = amalgamatedStory;
                        highestMatchScore = matchScore;
                    }
                }
                story.highestMatchScore = highestMatchScore;
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
                        MasterStoryUrl = story.StoryUrl,
                    };
                    newAmalgamatedStory.Stories.Add(story);
                   
                    amalgamatedStories.Add(newAmalgamatedStory);
                }
            }
            return amalgamatedStories;
        }

        */
    }
}

