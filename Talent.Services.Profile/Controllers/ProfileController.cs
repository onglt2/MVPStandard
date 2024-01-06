using Talent.Common.Contracts;
using Talent.Common.Models;
using Talent.Common.Security;
using Talent.Services.Profile.Models.Profile;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RawRabbit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using MongoDB.Driver;
using Talent.Services.Profile.Domain.Contracts;
using Talent.Common.Aws;
using Talent.Services.Profile.Models;
using Microsoft.AspNetCore.Server.Kestrel.Internal.System.Collections.Sequences;

namespace Talent.Services.Profile.Controllers
{
    [Route("profile/[controller]")]
    public class ProfileController : Controller
    {
        private readonly IBusClient _busClient;
        private readonly IAuthenticationService _authenticationService;
        private readonly IProfileService _profileService;
        private readonly IFileService _documentService;
        private readonly IUserAppContext _userAppContext;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<UserLanguage> _userLanguageRepository;
        private readonly IRepository<UserDescription> _personDescriptionRespository;
        private readonly IRepository<UserAvailability> _userAvailabilityRepository;
        private readonly IRepository<UserSkill> _userSkillRepository;
        private readonly IRepository<UserExperience> _userExperienceRepository;
        private readonly IRepository<UserEducation> _userEducationRepository;
        private readonly IRepository<UserCertification> _userCertificationRepository;
        private readonly IRepository<UserLocation> _userLocationRepository;
        private readonly IRepository<Employer> _employerRepository;
        private readonly IRepository<UserDocument> _userDocumentRepository;
        private readonly IHostingEnvironment _environment;
        private readonly IRepository<Recruiter> _recruiterRepository;
        private readonly IAwsService _awsService;
        private readonly string _profileImageFolder;

        public ProfileController(IBusClient busClient,
            IProfileService profileService,
            IFileService documentService,
            IRepository<User> userRepository,
            IRepository<UserLanguage> userLanguageRepository,
            IRepository<UserDescription> personDescriptionRepository,
            IRepository<UserAvailability> userAvailabilityRepository,
            IRepository<UserSkill> userSkillRepository,
            IRepository<UserExperience> userExperienceRepository,
            IRepository<UserEducation> userEducationRepository,
            IRepository<UserCertification> userCertificationRepository,
            IRepository<UserLocation> userLocationRepository,
            IRepository<Employer> employerRepository,
            IRepository<UserDocument> userDocumentRepository,
            IRepository<Recruiter> recruiterRepository,
            IHostingEnvironment environment,
            IAwsService awsService,
            IUserAppContext userAppContext)
        {
            _busClient = busClient;
            _profileService = profileService;
            _documentService = documentService;
            _userAppContext = userAppContext;
            _userRepository = userRepository;
            _personDescriptionRespository = personDescriptionRepository;
            _userLanguageRepository = userLanguageRepository;
            _userAvailabilityRepository = userAvailabilityRepository;
            _userSkillRepository = userSkillRepository;
            _userExperienceRepository = userExperienceRepository;
            _userEducationRepository = userEducationRepository;
            _userCertificationRepository = userCertificationRepository;
            _userLocationRepository = userLocationRepository;
            _employerRepository = employerRepository;
            _userDocumentRepository = userDocumentRepository;
            _recruiterRepository = recruiterRepository;
            _environment = environment;
            _profileImageFolder = "images\\";
            _awsService = awsService;
        }

        #region Talent

        [HttpGet("getProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _userAppContext.CurrentUserId;
            var user = await _userRepository.GetByIdAsync(userId);
            return Json(new { Username = user.FirstName });
        }

        [HttpGet("getProfileById")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetProfileById(string uid)
        {
            var userId = uid;
            var user = await _userRepository.GetByIdAsync(userId);
            return Json(new { userName = user.FirstName, createdOn = user.CreatedOn });
        }

        [HttpGet("isUserAuthenticated")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> IsUserAuthenticated()
        {
            if (_userAppContext.CurrentUserId == null)
            {
                return Json(new { IsAuthenticated = false });
            }
            else
            {
                var person = await _userRepository.GetByIdAsync(_userAppContext.CurrentUserId);
                if (person != null)
                {
                    return Json(new { IsAuthenticated = true, Username = person.FirstName, Type = "talent" });
                }
                var employer = await _employerRepository.GetByIdAsync(_userAppContext.CurrentUserId);
                if (employer != null)
                {
                    return Json(new { IsAuthenticated = true, Username = employer.CompanyContact.Name, Type = "employer" });
                }
                var recruiter = await _recruiterRepository.GetByIdAsync(_userAppContext.CurrentUserId);
                if (recruiter != null)
                {
                    return Json(new { IsAuthenticated = true, Username = recruiter.CompanyContact.Name, Type = "recruiter" });
                }
                return Json(new { IsAuthenticated = false, Type = "" });
            }
        }

        [HttpGet("getLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetLanguages()
        {
            //Your code here;
            //throw new NotImplementedException();
            var userId = _userAppContext.CurrentUserId;
            var languages = await _userLanguageRepository.Get(x => x.UserId == userId);


            List<AddLanguageViewModel> listView = new List<AddLanguageViewModel>();
            if (languages != null)
            {
                foreach (var item in languages)
                {
                    AddLanguageViewModel myLang = new AddLanguageViewModel
                    {
                        Id = item.Id,
                        Level = item.LanguageLevel,
                        Name = item.Language
                    };
                    listView.Add(myLang);
                }
            }
            return Json(new { Success = true, data = listView });
        }

        [HttpPost("addLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult AddLanguage([FromBody] AddLanguageViewModel language)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {

                var newLanguage = new UserLanguage
                {
                    UserId = _userAppContext.CurrentUserId,
                    Id = ObjectId.GenerateNewId().ToString(),
                    LanguageLevel = language.Level,
                    Language = language.Name
                };
                _userLanguageRepository.Add(newLanguage);



                return Json(new { Success = true, Message = "language added succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while adding language" });
            }
        }

        [HttpPost("updateLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> UpdateLanguage([FromBody] AddLanguageViewModel language)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var myLanguage = await _userLanguageRepository.GetByIdAsync(language.Id);


            if (myLanguage != null)
            {

                myLanguage.LanguageLevel = language.Level;
                myLanguage.Language = language.Name;
                myLanguage.Id = language.Id;
                myLanguage.IsDeleted = false;
            }
            else
            {
                return Json(new { Success = false, Message = "could not update" });
            }

            await _userLanguageRepository.Update(myLanguage);


            return Json(new { Success = true, Message = "language updated succesfully" });
        }
            catch
            {
                return Json(new { Success = false, Message = "Error while updating language" });
            }
        }

        [HttpPost("deleteLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> DeleteLanguage([FromBody] AddLanguageViewModel language)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                // var userId = _userAppContext.CurrentUserId;
                //var languages = await _userLanguageRepository.Get(x => x.Id == userId);
                // User existingUser = (await _userRepository.GetByIdAsync(userId));
                var myLanguage = await _userLanguageRepository.GetByIdAsync(language.Id);
                myLanguage.IsDeleted = true;
                await _userLanguageRepository.Delete(myLanguage);
                return Json(new { Success = true, Message = "language deleted succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while deleting language" });
            }

        }

        [HttpGet("getSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetSkills()
        {
            //Your code here;
            //throw new NotImplementedException();
            var userId = _userAppContext.CurrentUserId;
            var skills = await _userSkillRepository.Get(x => x.UserId == userId);
            List<AddSkillViewModel> listView = new List<AddSkillViewModel>();
            if (skills != null)
            {
                foreach (var item in skills)
                {
                    AddSkillViewModel mySkill = new AddSkillViewModel
                    {
                        Id = item.Id,
                        Level = item.ExperienceLevel,
                        Name = item.Skill
                    };
                    listView.Add(mySkill);
                }
            }
            return Json(new { Success = true, data = listView });
        }

        [HttpPost("addSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult AddSkill([FromBody]AddSkillViewModel skill)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var newSkill = new UserSkill
                {
                    UserId = _userAppContext.CurrentUserId,
                    Id = ObjectId.GenerateNewId().ToString(),
                    ExperienceLevel = skill.Level,
                    Skill = skill.Name
                };
                _userSkillRepository.Add(newSkill);



                return Json(new { Success = true, Message = "skill added succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while adding skill" });
            }
        }

        [HttpPost("updateSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateSkill([FromBody]AddSkillViewModel skill)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var mySkill = await _userSkillRepository.GetByIdAsync(skill.Id);
                if (mySkill != null)
                {
                    mySkill.ExperienceLevel = skill.Level;
                    mySkill.Skill = skill.Name;
                    mySkill.Id = skill.Id;
                    mySkill.IsDeleted = false;
                }
                else
                {
                    return Json(new { Success = false, Message = "could not update" });
                }
                await _userSkillRepository.Update(mySkill);
                return Json(new { Success = true, Message = "skill updated succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while updating skill" });
            }
        }

        [HttpPost("deleteSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteSkill([FromBody]AddSkillViewModel skill)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var mySkill = await _userSkillRepository.GetByIdAsync(skill.Id);
                mySkill.IsDeleted = true;
                await _userSkillRepository.Delete(mySkill);
                return Json(new { Success = true, Message = "skill deleted succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while deleting skill" });
            }
        }

        [HttpGet("getExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> getExperience()
        {
            //Your code here;
            //throw new NotImplementedException();
            var userId = _userAppContext.CurrentUserId;
            var experience = await _userExperienceRepository.Get(x => x.UserId == userId);
            List<AddExperienceViewModel> listView = new List<AddExperienceViewModel>();
            if (experience != null)
            {
                foreach (var item in experience)
                {
                    AddExperienceViewModel myExperience = new AddExperienceViewModel
                    {
                        Id = item.Id,
                        Company = item.Company,
                        Position = item.Position,
                        Responsibilities = item.Responsibilities,
                        Start = item.Start,
                        End = item.End,
                    };
                    listView.Add(myExperience);
                }
            }
            return Json(new { Success = true, data = listView });
        }

        [HttpPost("addExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult addExperience([FromBody] AddExperienceViewModel experience)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var newExperience = new UserExperience
                {
                    UserId = _userAppContext.CurrentUserId,
                    Id = ObjectId.GenerateNewId().ToString(),
                    Company = experience.Company,
                    Position = experience.Position,
                    Responsibilities = experience.Responsibilities,
                    Start = experience.Start,
                    End = experience.End,
                };
                _userExperienceRepository.Add(newExperience);



                return Json(new { Success = true, Message = "Experience added succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while adding experience" });
            }
        }

        [HttpPost("updateExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateExperience([FromBody] AddExperienceViewModel experience)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var myExperience = await _userExperienceRepository.GetByIdAsync(experience.Id);
                if (myExperience != null)
                {                                        
                    myExperience.Id = experience.Id;
                    myExperience.IsDeleted = false;
                    myExperience.Company = experience.Company;
                    myExperience.Position = experience.Position;
                    myExperience.Responsibilities = experience.Responsibilities;
                    myExperience.Start = experience.Start;
                    myExperience.End = experience.End;
                }
                else
                {
                    return Json(new { Success = false, Message = "could not update" });
                }
                await _userExperienceRepository.Update(myExperience);
                return Json(new { Success = true, Message = "Experience updated succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while updating experience" });
            }
        }

        [HttpPost("deleteExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteExperience ([FromBody] AddExperienceViewModel experience)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                var myExperience = await _userExperienceRepository.GetByIdAsync(experience.Id);
                myExperience.IsDeleted = true;
                await _userExperienceRepository.Delete(myExperience);
                return Json(new { Success = true, Message = "Experience deleted succesfully" });
            }
            catch
            {
                return Json(new { Success = false, Message = "Error while deleting experience" });
            }
        }

        [HttpGet("getCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> getCertification()
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("addCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult addCertification([FromBody] AddCertificationViewModel certificate)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateCertification([FromBody] AddCertificationViewModel certificate)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("deleteCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteCertification([FromBody] AddCertificationViewModel certificate)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        //[HttpGet("getProfileImage")]
        //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        //public ActionResult getProfileImage(string Id)
        //{
        //    var profileUrl = _documentService.GetFileURL(Id, FileType.ProfilePhoto);
        //    //Please do logic for no image available - maybe placeholder would be fine
        //    return Json(new { profilePath = profileUrl });
        //}

        [HttpGet("getProfileImage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public ActionResult getProfileImage(string Id)
        {
            var profileUrl = _documentService.GetFileURL(Id, FileType.ProfilePhoto);
            //Please do logic for no image available - maybe placeholder would be fine
            return Json(new { profilePath = profileUrl });
        }
        //public ActionResult getProfileImage(string Id = "")
        //{
        //    String talentId = String.IsNullOrWhiteSpace(Id) ? _userAppContext.CurrentUserId : Id;
        //    var profileUrl = _documentService.GetFileURL(talentId, FileType.ProfilePhoto);
        //    //Please do logic for no image available - maybe placeholder would be fine
        //    if (profileUrl == null)
        //        return Json(new { Success = false, message = "No Image available" });
        //    return Json(new { profilePath = profileUrl });

        //}

        [HttpPost("updateProfilePhoto")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        //public async Task<ActionResult> UpdateProfilePhoto(IFormFile file)
        //{
        //    if (file != null)
        //    {
        //        try
        //        {
        //            await _profileService.UpdateTalentPhoto(_userAppContext.CurrentUserId, file);
        //            return Json(new { Success = true });
        //        }
        //        catch (Exception e)
        //        {
        //            return Json(new { Success = false });
        //        }
        //    }
        //    return Json(new { Success = false });
        //    //Your code here;
        //    //throw new NotImplementedException();
        //}

        public async Task<ActionResult> UpdateProfilePhoto()
        {
            IFormFile file = Request.Form.Files[0];

            if (await _profileService.UpdateTalentPhoto(_userAppContext.CurrentUserId, file))
            {
                return Json(new { Success = true });
            }

            return Json(new { Success = false });

            //IFormFile file = Request.Form.Files[0];
            //var fileExtension = Path.GetExtension(file.FileName);
            //List<string> acceptedExtensions = new List<string> { ".jpg", ".png", ".gif", ".jpeg" };

            //if (fileExtension != null && !acceptedExtensions.Contains(fileExtension.ToLower()))
            //{
            //    return Json(new { Success = false, message = "Image type not supported" });

            //}
            //String UserId = _userAppContext.CurrentUserId;
            //var status = await _profileService.UpdateTalentPhoto(UserId, file);
            //if (status)
            //    return Json(new { Success = false, message = "Image updated succesfully" });
            //else return Json(new { Success = false, message = "Image not updated" });

        }

        [HttpPost("updateTalentCV")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> UpdateTalentCV()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateTalentVideo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateTalentVideo()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getInfo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetInfo()
        {
            //Your code here;
            throw new NotImplementedException();
        }


        [HttpPost("addInfo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> AddInfo([FromBody] DescriptionViewModel pValue)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetEducation()
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("addEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public IActionResult AddEducation([FromBody]AddEducationViewModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateEducation([FromBody]AddEducationViewModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("deleteEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteEducation([FromBody] AddEducationViewModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

     
        #endregion

        #region EmployerOrRecruiter

        [HttpGet("getEmployerProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<IActionResult> GetEmployerProfile(String id = "", String role = "")
        {
            try
            {
                string userId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                string userRole = String.IsNullOrWhiteSpace(role) ? _userAppContext.CurrentRole : role;

                var employerResult = await _profileService.GetEmployerProfile(userId, userRole);

                return Json(new { Success = true, employer = employerResult });
            }
            catch (Exception e)
            {
                return Json(new { Success = false, message = e });
            }
        }

        [HttpPost("saveEmployerProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<IActionResult> SaveEmployerProfile([FromBody] EmployerProfileViewModel employer)
        {
            if (ModelState.IsValid)
            {
                if (await _profileService.UpdateEmployerProfile(employer, _userAppContext.CurrentUserId, _userAppContext.CurrentRole))
                {
                    return Json(new { Success = true });
                }
            }
            return Json(new { Success = false });
        }

        [HttpPost("saveClientProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> SaveClientProfile([FromBody] EmployerProfileViewModel employer)
        {
            if (ModelState.IsValid)
            {
                //check if employer is client 5be40d789b9e1231cc0dc51b
                var recruiterClients =(await _recruiterRepository.GetByIdAsync(_userAppContext.CurrentUserId)).Clients;

                if (recruiterClients.Select(x => x.EmployerId == employer.Id).FirstOrDefault())
                {
                    if (await _profileService.UpdateEmployerProfile(employer, _userAppContext.CurrentUserId, "employer"))
                    {
                        return Json(new { Success = true });
                    }
                }
            }
            return Json(new { Success = false });
        }

        [HttpPost("updateEmployerPhoto")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<ActionResult> UpdateEmployerPhoto()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateEmployerVideo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<IActionResult> UpdateEmployerVideo()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getEmployerProfileImage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<ActionResult> GetWorkSample(string Id)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getEmployerProfileImages")]
        public ActionResult GetWorkSampleImage(string Id)
        {
            //Your code here;
            throw new NotImplementedException();
        }
        
        #endregion

        #region TalentFeed

        [HttpGet("getTalentProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent, employer, recruiter")]
        public async Task<IActionResult> GetTalentProfile(String id = "")
        {
            try
            {
                String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                var userProfile = await _profileService.GetTalentProfile(talentId);

                return Json(new { Success = true, data = userProfile });
            }
            catch (Exception e) 
            {
                return Json (new { Success = false, message = e });
            }
        }

        [HttpPost("updateTalentProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateTalentProfile([FromBody]TalentProfileViewModel profile)
        {
            if (ModelState.IsValid)
            {
                if (await _profileService.UpdateTalentProfile(profile, _userAppContext.CurrentUserId))
                {
                    return Json(new { Success = true });
                }
            }
            return Json(new { Success = false });
        }

        [HttpGet("getTalent")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter, employer")]
        public async Task<IActionResult> GetTalentSnapshots(FeedIncrementModel feed)
        {
            try
            {
                var result = (await _profileService.GetTalentSnapshotList(_userAppContext.CurrentUserId, false, feed.Position, feed.Number)).ToList();

                // Dummy talent to fill out the list once we run out of data
                if (result.Count == 0)
                {
                    result.Add(
                            new Models.TalentSnapshotViewModel
                            {
                                CurrentEmployment = "Software Developer at XYZ",
                                Level = "Junior",
                                Name = "Dummy User...",
                                PhotoId = "",
                                Skills = new List<string> { "C#", ".Net Core", "Javascript", "ReactJS", "PreactJS" },
                                Summary = "Veronika Ossi is a set designer living in New York who enjoys kittens, music, and partying.",
                                Visa = "Citizen"
                            }
                        );
                }
                return Json(new { Success = true, Data = result });
            }
            catch (Exception e)
            {
                return Json(new { Success = false, e.Message });
            }
        }
        #endregion

        #region TalentMatching

        [HttpGet("getTalentList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> GetTalentListAsync()
        {
            try
            {
                var result = await _profileService.GetFullTalentList();
                return Json(new { Success = true, Data = result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpGet("getEmployerList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public IActionResult GetEmployerList()
        {
            try
            {
                var result = _profileService.GetEmployerList();
                return Json(new { Success = true, Data = result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpPost("getEmployerListFilter")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public IActionResult GetEmployerListFilter([FromBody]SearchCompanyModel model)
        {
            try
            {
                var result = _profileService.GetEmployerListByFilterAsync(model);//change to filters
                if (result.IsCompletedSuccessfully)
                    return Json(new { Success = true, Data = result.Result });
                else
                    return Json(new { Success = false, Message = "No Results found" });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpPost("getTalentListFilter")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public IActionResult GetTalentListFilter([FromBody] SearchTalentModel model)
        {
            try
            {
                var result = _profileService.GetTalentListByFilterAsync(model);//change to filters
                return Json(new { Success = true, Data = result.Result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpGet("getSuggestionList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public IActionResult GetSuggestionList(string employerOrJobId, bool forJob)
        {
            try
            {
                var result = _profileService.GetSuggestionList(employerOrJobId, forJob, _userAppContext.CurrentUserId);
                return Json(new { Success = true, Data = result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpPost("addTalentSuggestions")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> AddTalentSuggestions([FromBody] AddTalentSuggestionList talentSuggestions)
        {
            try
            {
                if (await _profileService.AddTalentSuggestions(talentSuggestions))
                {
                    return Json(new { Success = true });
                }

            }
            catch (Exception e)
            {
                return Json(new { Success = false, e.Message });
            }
            return Json(new { Success = false });
        }

        #endregion


        #region ManageClients

        [HttpGet("getClientList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> GetClientList()
        {
            try
            {
                var result=await _profileService.GetClientListAsync(_userAppContext.CurrentUserId);

                return Json(new { Success = true, result });
            }
            catch(Exception e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        //[HttpGet("getClientDetailsToSendMail")]
        //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        //public async Task<IActionResult> GetClientDetailsToSendMail(string clientId)
        //{
        //    try
        //    {
        //            var client = await _profileService.GetEmployer(clientId);

        //            string emailId = client.Login.Username;
        //            string companyName = client.CompanyContact.Name;

        //            return Json(new { Success = true, emailId, companyName });
        //    }
        //    catch (Exception e)
        //    {
        //        return Json(new { Success = false, Message = e.Message });
        //    }
        //}

        #endregion

        public IActionResult Get() => Content("Test");

    }
}
