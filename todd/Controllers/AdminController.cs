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
    [Route("api/admin/[action]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase {
        private readonly ToddContext _context;

        public AdminController(ToddContext context) {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSitePassword() {
            Setting password;
            try {
                password = await _context.Settings.AsNoTracking().FirstAsync(s => s.Key == "SitePassword");
            } catch (InvalidOperationException) {
                return NotFound();
            }

            return new JsonResult(password.Value);
        }

        [HttpPost]
        public async Task<IActionResult> SetSitePassword([FromBody] string password) {
            if (String.IsNullOrEmpty(password)) return BadRequest();

            Setting setting;
            try {
                setting = await _context.Settings.FirstAsync(s => s.Key == "SitePassword");
            } catch (InvalidOperationException) {
                return NotFound();
            }

            setting.Value = password;
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}