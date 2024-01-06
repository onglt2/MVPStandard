using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Talent.Common.Aws;
using Talent.Common.Contracts;

namespace Talent.Common.Services
{
    public class FileService : IFileService
    {
        private readonly IHostingEnvironment _environment;
        private readonly string _tempFolder;
        private IAwsService _awsService;

        public FileService(IHostingEnvironment environment, 
            IAwsService awsService)
        {
            _environment = environment;
            _tempFolder = "images\\";
            _awsService = awsService;
        }

        //public async Task<string> GetFileURL(string id, FileType type)
        public async Task<string> GetFileURL(string fileName, FileType type)
        {
            //Your code here;
            //throw new NotImplementedException();
            if (!string.IsNullOrWhiteSpace(fileName) && type == FileType.ProfilePhoto)
            {
                string bucketName = "talent-photo";
                string profilePhotoUrl = await _awsService.GetStaticUrl(fileName, bucketName);
                return profilePhotoUrl;
            }

            return null;
        }

        public async Task<string> SaveFile(IFormFile file, FileType type)
        {
            //Your code here;
            //throw new NotImplementedException();
            if (file != null && type == FileType.ProfilePhoto)
            {
                var uniqueFileName = $@"{DateTime.Now.Ticks}_" + file.FileName;
                string bucketName = "talent-photo";
                var stream = file.OpenReadStream();
                if (await _awsService.PutFileToS3(uniqueFileName, stream, bucketName, true))
                {
                    return uniqueFileName;
                };
            }

            return null;
        }

        //public async Task<bool> DeleteFile(string id, FileType type)
        public async Task<bool> DeleteFile(string fileName, FileType type)
        {
            //Your code here;
            //throw new NotImplementedException();
            if (!string.IsNullOrWhiteSpace(fileName) && type == FileType.ProfilePhoto)
            {
                string bucketName = "talent-photo";
                if (await _awsService.RemoveFileFromS3(fileName, bucketName))
                {
                    return true;
                }
            }

            return false;
        }


        #region Document Save Methods

        private async Task<string> SaveFileGeneral(IFormFile file, string bucket, string folder, bool isPublic)
        {
            //Your code here;
            throw new NotImplementedException();
        }
        
        private async Task<bool> DeleteFileGeneral(string id, string bucket)
        {
            //Your code here;
            throw new NotImplementedException();
        }
        #endregion
    }
}
