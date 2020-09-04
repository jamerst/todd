using System;
using System.Collections.Generic;
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

        public ImageController(ToddContext context) {
            _context = context;
        }

        [HttpGet("{id}.{ext?}")]
        public async Task<IActionResult> GetImage(string id) {
            Image image;
            try {
                image = await _context.Images.AsNoTracking().FirstAsync(i => i.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            var imageFile = System.IO.File.OpenRead(image.Path);
            return File(imageFile, "image/jpeg");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> Delete(string id) {
            Image image;
            try {
                image = await _context.Images.FirstAsync(i => i.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            System.IO.File.Delete(image.Path);
            _context.Images.Remove(image);

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}