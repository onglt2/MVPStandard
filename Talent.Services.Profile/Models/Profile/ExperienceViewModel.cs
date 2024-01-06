using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;

namespace Talent.Services.Profile.Models.Profile
{

    public class ExperiencePersonListViewModel
    {
        public string PersonExperienceId { get; set; }
        public String Company { get; set; }
        public String Position { get; set; }
        public String Responsibilities { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
    public class AddExperienceViewModel
    {
        public String Id { get; set; }
        public String Company { get; set; }
        public String Position { get; set; }
        public String Responsibilities { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}
