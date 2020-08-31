using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using todd.Data;
using todd.DTO;
using todd.Models;
using todd.Services;

namespace todd.Controllers {
    [ApiController]
    [Route("api/item/[action]")]
    public class ItemController : ControllerBase {
        private readonly ToddContext _context;
        private readonly IImageService _imageService;

        public ItemController(ToddContext context, IImageService imageService) {
            _context = context;
            _imageService = imageService;
        }

        [HttpPost]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> Create([FromForm] NewItem item) {
            List<Image> savedImages = new List<Image>();
            if (item.Images != null) {
                savedImages.AddRange(await _imageService.SaveImages(item.Images));
            }

            Item newItem = new Item {
                Name = item.Name,
                Type = item.Type,
                Description = item.Description,
                LocationId = item.LocationId,
                Location = item.Location,
                Quantity = item.Quantity,
                CreatorId = User.FindFirstValue(ClaimTypes.Name),
                Created = DateTime.Now,
                Images = savedImages,
                Records = new List<Record>()
            };

            try {
                _context.Items.Add(newItem);
                await _context.SaveChangesAsync();
            } catch (InvalidOperationException) {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error creating item");
            }

            return Ok();
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> SearchItems(SearchParams search) {
            search.pageNum = search.pageNum < 1 ? 1 : search.pageNum;

            var query = _context.Items.AsNoTracking()
                .Include(i => i.Location).Include(i => i.Images).Where(i => true);

            if (!String.IsNullOrEmpty(search.Name)) {
                query = query.Where(i => EF.Functions.Like(i.Name.ToLower(), $"%{search.Name.ToLower()}%"));
            }

            if (search.Type > -1) {
                query = query.Where(i => i.Type == (ItemType) search.Type);
            }

            if (!String.IsNullOrEmpty(search.LocationId)) {
                query = query.Where(i => i.LocationId == search.LocationId);
            }

            List<ItemResult> results = await query
                .OrderBy(i => i.Name)
                .Skip((search.pageNum - 1) * 25)
                .Take(25)
                .Select(i => new ItemResult {
                    Id = i.Id,
                    Name = i.Name,
                    Type = i.Type,
                    Description = i.Description,
                    LocationName = i.Location.Name,
                    ImageId = i.Images.Count > 0 ? i.Images[0].Id : ""
                })
                .ToListAsync();

            int totalItems = await query.CountAsync();

            return new JsonResult( new { results = results, count = totalItems } );
        }

        public class SearchParams {
            public string Name { get; set; }
            public int Type { get; set; }
            public string LocationId { get; set; }
            public int pageNum { get; set; }
        }
    }
}