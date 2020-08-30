using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

using todd.Data;

namespace todd.Controllers {
    [ApiController]
    [Route("api/location/[action]")]
    public class LocationController : ControllerBase {
        private readonly ToddContext _context;

        public LocationController(ToddContext context) {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetLocations() {
            return new JsonResult(await _context.Locations.ToListAsync());
        }
    }
}