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
            if (!String.IsNullOrEmpty(item.LocationId) && item.Location != null) {
                return BadRequest("LocationId and Location cannot both be non-null");
            }

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
        [Authorize(Roles= "write,admin")]
        public async Task<IActionResult> Update(ItemUpdate update) {
            if (!String.IsNullOrEmpty(update.LocationId) && update.Location != null) {
                return BadRequest("LocationId and Location cannot both be non-null");
            }

            Item item;
            try {
                item = await _context.Items.FirstAsync(i => i.Id == update.Id);
            } catch (InvalidOperationException) {
                return BadRequest();
            }

            if (update.Location != null && String.IsNullOrEmpty(update.Location.Id)) {
                _context.Locations.Add(update.Location);
            }

            item.Name = update.Name;
            item.Description = update.Description;
            item.Type = update.Type;
            item.LocationId = update.LocationId;
            item.Location = update.Location;
            item.Quantity = update.Quantity;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("{id}")]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> AddImages(string id, [FromForm] IFormFileCollection images) {
            Item item;
            try {
                item = await _context.Items.Include(i => i.Images).FirstAsync(i => i.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            List<Image> addedImages = new List<Image>();
            if (images != null) {
                addedImages.AddRange(await _imageService.SaveImages(images));
                item.Images.AddRange(addedImages);
            }

            await _context.SaveChangesAsync();

            return new JsonResult(addedImages.Select(i => i.Id));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> Delete(string id) {
            Item item;
            try {
                item = await _context.Items.Include(i => i.Images).FirstAsync(i => i.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            _context.Items.Remove(item);

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> CreateRecord(Record record) {
            Record newRecord = new Record {
                ItemId = record.ItemId,
                Type = record.Type,
                Description = record.Description,
                Date = record.Date,
                UserId = User.FindFirstValue(ClaimTypes.Name)
            };

            try {
                _context.Records.Add(newRecord);
                await _context.SaveChangesAsync();
            } catch (Exception) {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error creating record");
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

            return new JsonResult(new { results = results, count = totalItems });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetItem(string id) {
            Item item;
            try {
                item = await _context.Items
                    .AsNoTracking()
                    .Include(i => i.Location)
                    .Include(i => i.Creator)
                    .Include(i => i.Images)
                    .Include(i => i.Records)
                        .ThenInclude(r => r.User)
                    .FirstAsync(i => i.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            return new JsonResult(new ItemDetails {
                Name = item.Name,
                Type = item.Type,
                Description = item.Description,
                LocationId = item.Location.Id,
                LocationName = item.Location.Name,
                Quantity = item.Quantity,
                CreatorName = item.Creator.Username,
                Created = item.Created,
                ImageIds = item.Images.Select(i => i.Id).ToList(),
                Records = item.Records.Select(r => new ItemDetailsRecord {
                    Id = r.Id,
                    Username = r.User != null ? r.User.Username : "(Unknown)",
                    Description = r.Description,
                    Type = r.Type,
                    Date = r.Date
                }).OrderByDescending(r => r.Date).ToList()
            });
        }

        public class SearchParams {
            public string Name { get; set; }
            public int Type { get; set; }
            public string LocationId { get; set; }
            public int pageNum { get; set; }
        }
    }
}