﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml;

namespace react_news_app.Controllers
{
    [Route("[controller]")]
    public class StoriesController : ControllerBase
    {
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
                    Provider provider = NewsStory.getProviderFromFeed(Url);
                    if (title == null || storyUrl == null)
                    {
                        continue;
                    }
                    NewsStory story = new NewsStory
                    {
                        Title = title,
                        Description = description,
                        Date = DateTime.Now,
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
                    newAmalgamatedStory.Stories.Add(story);
                    amalgamatedStories.Add(newAmalgamatedStory);
                }
            }
            return amalgamatedStories;
        }
    }
}

