using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace react_news_app
{
    public class AmalgamatedStory
    {
        public AmalgamatedStory()
        {
            this.Stories = new List<NewsStory>();
            this.amalgamtedTitleWords = new List<String>();
        }
        public List<NewsStory> Stories { get; set; }
        public int numberOfStories { get; set; }

        public List<String> amalgamtedTitleWords { get; set; }
    }
}
