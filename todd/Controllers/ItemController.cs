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
using todd.Models;

namespace todd.Controllers {
    [ApiController]
    [Route("api/item/[action]")]
    public class ItemController : ControllerBase {
        private readonly ToddContext _context;

        public ItemController(ToddContext context) {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> Create(Item item) {
            Item newItem = new Item {
                Name = item.Name,
                Type = item.Type,
                Description = item.Description,
                LocationId = item.LocationId,
                Quantity = item.Quantity,
                CreatorId = User.FindFirstValue(ClaimTypes.Name),
                Created = DateTime.Now,
                Images = item.Images,
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
    }
}