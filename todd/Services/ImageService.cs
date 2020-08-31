using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using todd.Data;
using todd.Models;
using todd.Utils;

namespace todd.Services {
    public class ImageService : IImageService {
        private readonly ToddContext _context;
        private readonly IImageUtils _imageUtils;

        public ImageService(ToddContext context, IImageUtils imageUtils) {
            _context = context;
            _imageUtils = imageUtils;
        }

        public async Task<List<Image>> SaveImages(IFormFileCollection images) {
            List<Image> newImages = new List<Image>();
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

                    newImages.Add(newImage);
                }
            }

            return newImages;
        }
    }

    public interface IImageService {
        Task<List<Image>> SaveImages(IFormFileCollection images);
    }
}