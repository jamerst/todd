using System;
using System.IO;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SkiaSharp;

using todd.Configuration;

namespace todd.Utils {
    public class ImageUtils : IImageUtils {
        private readonly ImageOptions _options;
        private const int ImageMinimumBytes = 512;

        public ImageUtils(IOptions<ImageOptions> options) {
            _options = options.Value;
        }

        public bool IsImage(IFormFile postedFile) {
            //-------------------------------------------
            //  Check the image mime types
            //-------------------------------------------
            if (postedFile.ContentType.ToLower() != "image/jpg" &&
                        postedFile.ContentType.ToLower() != "image/jpeg" &&
                        postedFile.ContentType.ToLower() != "image/pjpeg" &&
                        postedFile.ContentType.ToLower() != "image/gif" &&
                        postedFile.ContentType.ToLower() != "image/x-png" &&
                        postedFile.ContentType.ToLower() != "image/png") {
                throw new ArgumentException("Invalid MIME type");
            }

            //-------------------------------------------
            //  Check the image extension
            //-------------------------------------------
            if (Path.GetExtension(postedFile.FileName).ToLower() != ".jpg"
                && Path.GetExtension(postedFile.FileName).ToLower() != ".png"
                && Path.GetExtension(postedFile.FileName).ToLower() != ".gif"
                && Path.GetExtension(postedFile.FileName).ToLower() != ".jpeg") {
                throw new ArgumentException("Invalid file extension");
            }

            //-------------------------------------------
            //  Attempt to read the file and check the first bytes
            //-------------------------------------------
            try {
                if (!postedFile.OpenReadStream().CanRead) {
                    throw new ArgumentException("File not readable");
                }
                //------------------------------------------
                //check whether the image size exceeding the limit or not
                //------------------------------------------
                if (postedFile.Length < ImageMinimumBytes) {
                    throw new ArgumentException("File too small");
                }

                byte[] buffer = new byte[ImageMinimumBytes];
                postedFile.OpenReadStream().Read(buffer, 0, ImageMinimumBytes);
                string content = System.Text.Encoding.UTF8.GetString(buffer);
                if (Regex.IsMatch(content, @"<script|<html|<head|<title|<body|<pre|<table|<a\s+href|<img|<plaintext|<cross\-domain\-policy",
                    RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Multiline)) {
                    throw new ArgumentException("Invalid file contents");
                }
            } catch (Exception) {
                throw new ArgumentException("Failed to verify file");
            }

            //-------------------------------------------
            //  Try to decode, invalid if exception thrown or value is null
            //-------------------------------------------

            try {
                using (var bitmap = SKBitmap.Decode(postedFile.OpenReadStream())) {
                    if (bitmap == null) throw new ArgumentException("Failed to decode file");
                }
            } catch (Exception) {
                throw new ArgumentException("Failed to decode file");
            } finally {
                postedFile.OpenReadStream().Position = 0;
            }

            return true;
        }

        public string SaveAsJpeg(IFormFile file) {
            string path = Path.Combine(_options.SaveDir, Path.GetRandomFileName());

            using (var fileStream = file.OpenReadStream()) {
                using (var orig = SKBitmap.Decode(fileStream)) {
                    SKBitmap result;

                    if (orig.Width > _options.Size || orig.Height > _options.Size) {
                        int width, height;

                        if (orig.Width > orig.Height) {
                            width = _options.Size;
                            height = orig.Height * _options.Size / orig.Width;
                        } else {
                            width = orig.Width * _options.Size / orig.Height;
                            height = _options.Size;
                        }

                        result = new SKBitmap(width, height);
                        orig.ScalePixels(result, SKFilterQuality.High);
                    } else {
                        result = new SKBitmap();
                        orig.CopyTo(result);
                    }

                    using (var output = File.OpenWrite(path)) {
                        result.Encode(SKEncodedImageFormat.Jpeg, _options.JpegQuality).SaveTo(output);
                    }
                }
            }

            return path;
        }
    }

    public interface IImageUtils {
        bool IsImage(IFormFile postedFile);
        string SaveAsJpeg(IFormFile file);
    }
}