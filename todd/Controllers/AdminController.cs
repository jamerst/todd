using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using todd.Configuration;
using todd.Data;
using todd.DTO;
using todd.Models;
using todd.Services;
using todd.Utils;

namespace todd.Controllers {
    [ApiController]
    [Route("api/admin/[action]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase {
        private readonly ToddContext _context;
        private readonly IAuthUtils _authUtils;
        private readonly SecurityOptions _options;

        public AdminController(ToddContext context, IAuthUtils authUtils, IOptions<SecurityOptions> options) {
            _context = context;
            _authUtils = authUtils;
            _options = options.Value;
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

        [HttpPost]
        public async Task<IActionResult> CreateUser(NewUser newUser) {
            if (await _context.Users.Where(u => u.Username == newUser.Username).CountAsync() > 0)
                return BadRequest("Username already in use");

            User user = new User {
                Username = newUser.Username,
                Admin = newUser.Admin,
                Active = false
            };

            UserActivation activation = new UserActivation {
                User = user
            };

            _context.Users.Add(user);
            _context.UserActivations.Add(activation);

            await _context.SaveChangesAsync();

            return new JsonResult(activation.Id);
        }

        public class NewUser {
            public string Username { get; set; }
            public bool Admin { get; set; }
        }
    }
}