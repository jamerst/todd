using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using todd.Data;
using todd.Models;
using todd.Utils;

namespace todd.Controllers {
    [ApiController]
    [Route("api/image/[action]")]
    public class ImageController : ControllerBase {
        private readonly ToddContext _context;
        private readonly IImageUtils _imageUtils;

        public ImageController(ToddContext context, IImageUtils imageUtils) {
            _context = context;
            _imageUtils = imageUtils;
        }

        [HttpPost]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> Upload([FromForm] List<IFormFile> images) {
            List<string> imageIds = new List<string>();
            foreach (IFormFile image in images) {
                bool isValid = false;
                try {
                    isValid = _imageUtils.IsImage(image);
                } catch (ArgumentException) {
                    continue;
                }

                if (isValid) {
                    string filePath = _imageUtils.SaveAsJpeg(image);

                    Image newImage = new Image { Path = filePath };
                    _context.Images.Add(newImage);
                    await _context.SaveChangesAsync();

                    imageIds.Add(newImage.Id);
                }
            }

            return new JsonResult(imageIds);

        }
    }
}