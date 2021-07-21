using System;

namespace react_news_app
{
    public class NewsStory
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string StoryUrl { get; set; }
        public DateTime Date { get; set; }
        public string ImageUrl { get; set; }
        public Provider Provider { get; set; }

        public string ProviderName { get; set; }

        public static Provider getProviderFromFeed(string feed)
        {

            switch (feed)
            {
                case NewsFeeds.THE_GUARDIAN_FEED:
                    return Provider.THE_GUARDIAN;
                case NewsFeeds.BBC_NEWS_FEED:
                    return Provider.BBC_NEWS;
                case NewsFeeds.DAILY_MAIL_FEED:
                    return Provider.DAILY_MAIL;
                case NewsFeeds.THE_TELEGRAPH_FEED:
                    return Provider.THE_TELEGRAPH;
                default:
                    return Provider.NOT_SET;

            }
        }
        public static string getProviderName(Provider provider)
        {
            switch (provider)
            {
                case Provider.THE_GUARDIAN:
                    return "The Guardian";
                case Provider.BBC_NEWS:
                    return "BBC News";
                case Provider.DAILY_MAIL:
                    return "Daily Mail Online";
                case Provider.THE_TELEGRAPH:
                    return "The Telegraph";
                default:
                    return "";
            }
        }
    }   



    public enum Provider
    {
        NOT_SET = 0,
        THE_GUARDIAN = 1,
        BBC_NEWS = 2,
        DAILY_MAIL = 3,
        THE_TELEGRAPH = 4
    }
}
