using Talent.Common.Contracts;
using Talent.Common.Models;
using Talent.Services.Profile.Domain.Contracts;
using Talent.Services.Profile.Models.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Bson;
using Talent.Services.Profile.Models;
using Microsoft.AspNetCore.Http;
using System.IO;
using Talent.Common.Security;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Server.Kestrel.Internal.System.Collections.Sequences;

namespace Talent.Services.Profile.Domain.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IUserAppContext _userAppContext;
        IRepository<UserLanguage> _userLanguageRepository;
        IRepository<User> _userRepository;
        IRepository<Employer> _employerRepository;
        IRepository<Job> _jobRepository;
        IRepository<Recruiter> _recruiterRepository;
        IFileService _fileService;


        public ProfileService(IUserAppContext userAppContext,
                              IRepository<UserLanguage> userLanguageRepository,
                              IRepository<User> userRepository,
                              IRepository<Employer> employerRepository,
                              IRepository<Job> jobRepository,
                              IRepository<Recruiter> recruiterRepository,
                              IFileService fileService)
        {
            _userAppContext = userAppContext;
            _userLanguageRepository = userLanguageRepository;
            _userRepository = userRepository;
            _employerRepository = employerRepository;
            _jobRepository = jobRepository;
            _recruiterRepository = recruiterRepository;
            _fileService = fileService;
        }

        public bool AddNewLanguage(AddLanguageViewModel language)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<TalentProfileViewModel> GetTalentProfile(string Id)
        {
            //Your code here;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(Id));

            var videoUrl = "";

            if (profile != null)
            {
                videoUrl = string.IsNullOrWhiteSpace(profile.VideoName)
                          ? ""
                          : await _fileService.GetFileURL(profile.VideoName, FileType.UserVideo);

                var skills = profile.Skills.Select(x => ViewModelFromSkill(x)).ToList();
                var languages = profile.Languages.Select(x => ViewModelFromLanguage(x)).ToList();
                var education = profile.Education.Select(x => ViewModelFromEducation(x)).ToList();
                var certifications = profile.Certifications.Select(x => ViewModelFromCertification(x)).ToList();
                var experience = profile.Experience.Select(x => ViewModelFromExperience(x)).ToList();
                
                var result = new TalentProfileViewModel
                {
                    Id = profile.Id,
                    LinkedAccounts = profile.LinkedAccounts,
                    FirstName = profile.FirstName,
                    LastName = profile.LastName,    
                    Email = profile.Email,
                    Phone = profile.Phone,
                    Address = profile.Address,
                    Nationality = profile.Nationality,
                    //Languages = profile.Languages,
                    VisaStatus = profile.VisaStatus,
                    VisaExpiryDate = profile.VisaExpiryDate,

                    ProfilePhoto = profile.ProfilePhoto,
                    ProfilePhotoUrl = profile.ProfilePhotoUrl,
                    VideoName = profile.VideoName,
                    VideoUrl = videoUrl,
                    CvName = profile.CvName,
                    Summary = profile.Summary,
                    Description = profile.Description,

                    JobSeekingStatus = profile.JobSeekingStatus,

                    Skills = skills,
                    Languages = languages,
                    Education = education,
                    Certifications = certifications,
                    Experience = experience

                };
                return result;
            }
            //return null;
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateTalentProfile(TalentProfileViewModel model, string updaterId)
        {
            //Your code here;
            try
            {
                if (model.Id != null)
                {
                    User existingTalent = (await _userRepository.GetByIdAsync(model.Id));
                    existingTalent.LinkedAccounts = model.LinkedAccounts;
                    existingTalent.FirstName = model.FirstName;
                    existingTalent.LastName = model.LastName;
                    existingTalent.Email = model.Email;
                    existingTalent.Phone = model.Phone;
                    existingTalent.Address = model.Address;
                    existingTalent.Nationality = model.Nationality;
                    //existingTalent.Languages = model.Languages;
                    existingTalent.VisaStatus = model.VisaStatus;
                    existingTalent.VisaExpiryDate = model.VisaExpiryDate;

                    existingTalent.ProfilePhoto = model.ProfilePhoto;
                    existingTalent.ProfilePhotoUrl = model.ProfilePhotoUrl;
                    existingTalent.Summary = model.Summary;
                    existingTalent.Description = model.Description;

                    existingTalent.JobSeekingStatus = model.JobSeekingStatus;

                    existingTalent.UpdatedBy = updaterId;
                    existingTalent.UpdatedOn = DateTime.Now;

                    if (model.Skills != null)
                    {
                        var newSkills = new List<UserSkill>();
                        foreach (var item in model.Skills)
                        {
                            //var skill = existingTalent.Skills.SingleOrDefault(x => x.Id == item.Id);
                            //if (skill == null)
                            //{
                                var skill = new UserSkill
                                {
                                    //Id = ObjectId.GenerateNewId().ToString(),
                                    //IsDeleted = false
                                    Id = item.Id,
                                    UserId = existingTalent.Id,
                                    ExperienceLevel = item.Level,
                                    Skill = item.Name
                                };
                            
                            UpdateSkillFromView(item, skill);
                            newSkills.Add(skill);
                        }
                        existingTalent.Skills = newSkills;
                    }
                    
                    if (model.Languages != null)
                    {
                        var newLanguages = new List<UserLanguage>();
                        foreach (var item in model.Languages)
                        {
                        //var language = existingTalent.Languages.SingleOrDefault(x => x.Id == item.Id);
                        //if (language == null)
                        //{
                            var language = new UserLanguage
                            {
                                //Id = ObjectId.GenerateNewId().ToString(),
                                //IsDeleted = false
                                Id = item.Id,
                                UserId = existingTalent.Id,
                                LanguageLevel = item.Level,
                                Language = item.Name
                            };
                            UpdateLanguageFromView(item, language);
                            newLanguages.Add(language);
                        }
                            existingTalent.Languages = newLanguages;
                    }

                    if (model.Experience != null)
                    {
                        var newExperience = new List<UserExperience>();
                        foreach (var item in model.Experience)
                        {
                            //var skill = existingTalent.Skills.SingleOrDefault(x => x.Id == item.Id);
                            //if (skill == null)
                            //{
                            var experience = new UserExperience
                            {
                                //Id = ObjectId.GenerateNewId().ToString(),
                                //IsDeleted = false
                                Id = item.Id,
                                UserId = existingTalent.Id,                      
                                Company = item.Company,
                                Position = item.Position,
                                Responsibilities = item.Responsibilities,
                                Start = item.Start,
                                End = item.End,
                            };

                            UpdateExperienceFromView(item, experience);
                            newExperience.Add(experience);
                        }
                        existingTalent.Experience = newExperience;
                    }

                    await _userRepository.Update(existingTalent);
                    return true;
                }
                return false;
            }
            catch (MongoException e)
            {
                return false;
            }

        //}
        //ReturnDocument false;
            //throw new NotImplementedException();
        }

        public async Task<EmployerProfileViewModel> GetEmployerProfile(string Id, string role)
        {

            Employer profile = null;
            switch (role)
            {
                case "employer":
                    profile = (await _employerRepository.GetByIdAsync(Id));
                    break;
                case "recruiter":
                    profile = (await _recruiterRepository.GetByIdAsync(Id));
                    break;
            }

            var videoUrl = "";

            if (profile != null)
            {
                videoUrl = string.IsNullOrWhiteSpace(profile.VideoName)
                          ? ""
                          : await _fileService.GetFileURL(profile.VideoName, FileType.UserVideo);

                var skills = profile.Skills.Select(x => ViewModelFromSkill(x)).ToList();

                var result = new EmployerProfileViewModel
                {
                    Id = profile.Id,
                    CompanyContact = profile.CompanyContact,
                    PrimaryContact = profile.PrimaryContact,
                    Skills = skills,
                    ProfilePhoto = profile.ProfilePhoto,
                    ProfilePhotoUrl = profile.ProfilePhotoUrl,
                    VideoName = profile.VideoName,
                    VideoUrl = videoUrl,
                    DisplayProfile = profile.DisplayProfile,
                };
                return result;
            }

            return null;
        }

        public async Task<bool> UpdateEmployerProfile(EmployerProfileViewModel employer, string updaterId, string role)
        {
            try
            {
                if (employer.Id != null)
                {
                    switch (role)
                    {
                        case "employer":
                            Employer existingEmployer = (await _employerRepository.GetByIdAsync(employer.Id));
                            existingEmployer.CompanyContact = employer.CompanyContact;
                            existingEmployer.PrimaryContact = employer.PrimaryContact;
                            existingEmployer.ProfilePhoto = employer.ProfilePhoto;
                            existingEmployer.ProfilePhotoUrl = employer.ProfilePhotoUrl;
                            existingEmployer.DisplayProfile = employer.DisplayProfile;
                            existingEmployer.UpdatedBy = updaterId;
                            existingEmployer.UpdatedOn = DateTime.Now;

                            var newSkills = new List<UserSkill>();
                            foreach (var item in employer.Skills)
                            {
                                var skill = existingEmployer.Skills.SingleOrDefault(x => x.Id == item.Id);
                                if (skill == null)
                                {
                                    skill = new UserSkill
                                    {
                                        Id = ObjectId.GenerateNewId().ToString(),
                                        IsDeleted = false
                                    };
                                }
                                UpdateSkillFromView(item, skill);
                                newSkills.Add(skill);
                            }
                            existingEmployer.Skills = newSkills;

                            await _employerRepository.Update(existingEmployer);
                            break;

                        case "recruiter":
                            Recruiter existingRecruiter = (await _recruiterRepository.GetByIdAsync(employer.Id));
                            existingRecruiter.CompanyContact = employer.CompanyContact;
                            existingRecruiter.PrimaryContact = employer.PrimaryContact;
                            existingRecruiter.ProfilePhoto = employer.ProfilePhoto;
                            existingRecruiter.ProfilePhotoUrl = employer.ProfilePhotoUrl;
                            existingRecruiter.DisplayProfile = employer.DisplayProfile;
                            existingRecruiter.UpdatedBy = updaterId;
                            existingRecruiter.UpdatedOn = DateTime.Now;

                            var newRSkills = new List<UserSkill>();
                            foreach (var item in employer.Skills)
                            {
                                var skill = existingRecruiter.Skills.SingleOrDefault(x => x.Id == item.Id);
                                if (skill == null)
                                {
                                    skill = new UserSkill
                                    {
                                        Id = ObjectId.GenerateNewId().ToString(),
                                        IsDeleted = false
                                    };
                                }
                                UpdateSkillFromView(item, skill);
                                newRSkills.Add(skill);
                            }
                            existingRecruiter.Skills = newRSkills;
                            await _recruiterRepository.Update(existingRecruiter);

                            break;
                    }
                    return true;
                }
                return false;
            }
            catch (MongoException e)
            {
                return false;
            }
        }

        public async Task<bool> UpdateEmployerPhoto(string employerId, IFormFile file)
        {
            var fileExtension = Path.GetExtension(file.FileName);
            List<string> acceptedExtensions = new List<string> { ".jpg", ".png", ".gif", ".jpeg" };

            if (fileExtension != null && !acceptedExtensions.Contains(fileExtension.ToLower()))
            {
                return false;
            }

            var profile = (await _employerRepository.Get(x => x.Id == employerId)).SingleOrDefault();

            if (profile == null)
            {
                return false;
            }

            var newFileName = await _fileService.SaveFile(file, FileType.ProfilePhoto);

            if (!string.IsNullOrWhiteSpace(newFileName))
            {
                var oldFileName = profile.ProfilePhoto;

                if (!string.IsNullOrWhiteSpace(oldFileName))
                {
                    await _fileService.DeleteFile(oldFileName, FileType.ProfilePhoto);
                }

                profile.ProfilePhoto = newFileName;
                profile.ProfilePhotoUrl = await _fileService.GetFileURL(newFileName, FileType.ProfilePhoto);

                await _employerRepository.Update(profile);
                return true;
            }

            return false;

        }

        public async Task<bool> AddEmployerVideo(string employerId, IFormFile file)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateTalentPhoto(string talentId, IFormFile file)
        {
            var fileExtension = Path.GetExtension(file.FileName);
            List<string> acceptedExtensions = new List<string> { ".jpg", ".png", ".gif", ".jpeg" };

            if (fileExtension != null && !acceptedExtensions.Contains(fileExtension.ToLower()))
            {
                return false;
            }

            var profile = (await _userRepository.Get(x => x.Id == talentId)).SingleOrDefault();

            if (profile == null)
            {
                return false;
            }

            var newFileName = await _fileService.SaveFile(file, FileType.ProfilePhoto);

            if (!string.IsNullOrWhiteSpace(newFileName))
            {
                var oldFileName = profile.ProfilePhoto;

                if (!string.IsNullOrWhiteSpace(oldFileName))
                {
                    await _fileService.DeleteFile(oldFileName, FileType.ProfilePhoto);
                }

                profile.ProfilePhoto = newFileName;
                profile.ProfilePhotoUrl = await _fileService.GetFileURL(newFileName, FileType.ProfilePhoto);

                await _userRepository.Update(profile);
                return true;
            }

            return false;

            //var newPhoto = await _fileService.SaveFile(file, FileType.ProfilePhoto);

            //if (!string.IsNullOrWhiteSpace(newPhoto))
            //{
            //    User existingUser = (await _userRepository.GetByIdAsync(talentId));
            //    var oldPhoto = existingUser.ProfilePhoto;

            //    if (!string.IsNullOrWhiteSpace(oldPhoto))
            //    {
            //        await _fileService.DeleteFile(oldPhoto, FileType.ProfilePhoto);
            //    }


            //    existingUser.ProfilePhoto = newPhoto;
            //    existingUser.ProfilePhotoUrl = await _fileService.GetFileURL(newPhoto, FileType.ProfilePhoto);

            //    await _userRepository.Update(existingUser);
            //    return true;
            //}

            //return false;

        }

        //public async Task<bool> UpdateTalentPhoto(string talentId, IFormFile file)
        //{
        //    {
        //        var fileExtension = Path.GetExtension(file.FileName);
        //        List<string> acceptedExtensions = new List<string> { ".jpg", ".png", ".gif", ".jpeg" };

        //        if (fileExtension != null && !acceptedExtensions.Contains(fileExtension.ToLower()))
        //        {
        //            return false;
        //        }

        //        var profile = (await _userRepository.Get(x => x.Id == talentId)).SingleOrDefault();

        //        if (profile == null)
        //        {
        //            return false;
        //        }

        //        var newFileName = await _fileService.SaveFile(file, FileType.ProfilePhoto);

        //        if (!string.IsNullOrWhiteSpace(newFileName))
        //        {
        //            var oldFileName = profile.ProfilePhoto;
        //            if (!string.IsNullOrWhiteSpace(oldFileName))
        //            {
        //                await _fileService.DeleteFile(oldFileName, FileType.ProfilePhoto);
        //            }

        //            profile.ProfilePhoto = newFileName;
        //            profile.ProfilePhotoUrl = await _fileService.GetFileURL(newFileName, FileType.ProfilePhoto);

        //            await _userRepository.Update(profile);
        //            return true;
        //        }

        //        return false;
        //    }

        //    //Your code here;
        //    //throw new NotImplementedException();
        //}

        public async Task<bool> AddTalentVideo(string talentId, IFormFile file)
        {
            //Your code here;
            throw new NotImplementedException();

        }

        public async Task<bool> RemoveTalentVideo(string talentId, string videoName)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateTalentCV(string talentId, IFormFile file)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<string>> GetTalentSuggestionIds(string employerOrJobId, bool forJob, int position, int increment)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<TalentSnapshotViewModel>> GetTalentSnapshotList(string employerOrJobId, bool forJob, int position, int increment)
        {
            //Your code here;
            //throw new NotImplementedException();
            try
            {
                if (!forJob)
                {
                    var employerId = employerOrJobId;
                    var profile = await _employerRepository.GetByIdAsync(employerId);
                    var users = _userRepository.Collection.Skip(position).Take(increment).AsEnumerable();
                    if (profile != null)
                    {
                        var result = new List<TalentSnapshotViewModel>();

                        foreach (var user in users)
                        {
                            var skills = new List<string>();
                            foreach (var skill in user.Skills)
                            {
                                skills.Add(skill.Skill);
                            }

                            var newSnapshot = new TalentSnapshotViewModel();
                            newSnapshot.Id = user.Id;
                            newSnapshot.Name = user.FirstName + " " + user.LastName;
                            newSnapshot.PhotoId = user.ProfilePhotoUrl;
                            newSnapshot.VideoUrl = user.VideoName;
                            newSnapshot.CVUrl = user.CvName;
                            newSnapshot.Summary = user.Summary;
                            if (user.Experience.Count > 0)
                            {
                                newSnapshot.CurrentEmployment = user.Experience[0].Company;
                                newSnapshot.Level = user.Experience[0].Position;
                            }
                            newSnapshot.Visa = user.VisaStatus;
                            newSnapshot.Skills = skills;

                            result.Add(newSnapshot);
                        }
                        return result;
                    }
                    return null;
                }
                else
                {
                    throw new NotImplementedException();
                }
            }
            catch (Exception e)
            {
                return null;
            }
        }

        public async Task<IEnumerable<TalentSnapshotViewModel>> GetTalentSnapshotList(IEnumerable<string> ids)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        #region TalentMatching

        public async Task<IEnumerable<TalentSuggestionViewModel>> GetFullTalentList()
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public IEnumerable<TalentMatchingEmployerViewModel> GetEmployerList()
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<TalentMatchingEmployerViewModel>> GetEmployerListByFilterAsync(SearchCompanyModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<TalentSuggestionViewModel>> GetTalentListByFilterAsync(SearchTalentModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<TalentSuggestion>> GetSuggestionList(string employerOrJobId, bool forJob, string recruiterId)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<bool> AddTalentSuggestions(AddTalentSuggestionList selectedTalents)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        #endregion

        #region Conversion Methods

        #region Update from View

        protected void UpdateSkillFromView(AddSkillViewModel model, UserSkill original)
        {
            original.ExperienceLevel = model.Level;
            original.Skill = model.Name;
        }

        protected void UpdateLanguageFromView(AddLanguageViewModel model, UserLanguage original)
        {
            //original.UserId = model.CurrentUserId;
            //original.Language = model.Name;
            //original.LanguageLevel = model.Level;
            original.UserId = model.CurrentUserId;
            original.Language = model.Name;
            original.LanguageLevel = model.Level;
        }

        protected void UpdateExperienceFromView(AddExperienceViewModel model, UserExperience original)
            
        {
            //original.UserId = model.CurrentUserId;
            //original.Language = model.Name;
            //original.LanguageLevel = model.Level;
            //original.UserId = model.CurrentUserId;
            original.Company = model.Company;
            original.Position = model.Position;
            original.Responsibilities = model.Responsibilities;
            original.Start = model.Start;
            original.End = model.End;         
                                 
        }

        #endregion

        #region Build Views from Model

        protected AddSkillViewModel ViewModelFromSkill(UserSkill skill)
        {
            return new AddSkillViewModel
            {
                Id = skill.Id,
                Level = skill.ExperienceLevel,
                Name = skill.Skill
            };
        }

        protected AddLanguageViewModel ViewModelFromLanguage(UserLanguage language)
        {
            return new AddLanguageViewModel
            {
                Name = language.Language,
                Level = language.LanguageLevel,
                Id = language.Id,
                CurrentUserId = language.UserId
            };
        }

        protected AddEducationViewModel ViewModelFromEducation(UserEducation education)
        {
            return new AddEducationViewModel
            {
                Country = education.Country,
                InstituteName = education.InstituteName,
                Title = education.Title,
                Degree = education.Degree,
                YearOfGraduation = education.YearOfGraduation,
                Id = education.Id
            };
        }

        protected AddCertificationViewModel ViewModelFromCertification(UserCertification certification)
        {
            return new AddCertificationViewModel
            {
                Id = certification.Id,
                CertificationName = certification.CertificationName,
                CertificationFrom = certification.CertificationFrom,
                CertificationYear = certification.CertificationYear
            };
        }

        protected AddExperienceViewModel ViewModelFromExperience(UserExperience experience)
        {
            return new AddExperienceViewModel
            {
                Id = experience.Id,
                Company = experience.Company,
                Position = experience.Position,
                Responsibilities = experience.Responsibilities,
                Start = experience.Start,
                End = experience.End
            };
        }
        #endregion

        #endregion

        #region ManageClients

        public async Task<IEnumerable<ClientViewModel>> GetClientListAsync(string recruiterId)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        public async Task<ClientViewModel> ConvertToClientsViewAsync(Client client, string recruiterId)
        {
            //Your code here;
            throw new NotImplementedException();
        }
         
        public async Task<int> GetTotalTalentsForClient(string clientId, string recruiterId)
        {
            //Your code here;
            throw new NotImplementedException();

        }

        public async Task<Employer> GetEmployer(string employerId)
        {
            return await _employerRepository.GetByIdAsync(employerId);
        }
        #endregion

    }
}
