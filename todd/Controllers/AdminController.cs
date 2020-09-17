using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

using todd.Configuration;
using todd.Data;
using todd.DTO;
using todd.Models;
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

            byte[] random = new byte[_options.ActivationSize / 8];
            using (var RNG = RandomNumberGenerator.Create()) {
                RNG.GetBytes(random);
            }

            User user = new User {
                Username = newUser.Username,
                Admin = newUser.Admin,
                Active = false,
                Activation = WebEncoders.Base64UrlEncode(random)
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return new JsonResult(user.Activation);
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers() {
            List<UserResult> users = await _context.Users
                .AsNoTracking()
                .OrderBy(u => u.Username)
                .Select(u => new UserResult {
                    Id = u.Id,
                    Username = u.Username,
                    Admin = u.Admin,
                    Active = u.Active
                })
                .ToListAsync();

            return new JsonResult(users);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> SetAdmin(string id, [FromBody] bool admin) {
            if (id == User.FindFirstValue(ClaimTypes.Name))
                return BadRequest("Cannot change your own admin status");

            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            user.Admin = admin;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> ResetPassword(string id) {
            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            user.Password = null;
            user.Salt = null;
            user.HashIterations = 0;
            user.HashSize = 0;
            user.SaltSize = 0;
            user.Active = false;

            byte[] random = new byte[_options.ResetSize / 8];
            using (var RNG = RandomNumberGenerator.Create()) {
                RNG.GetBytes(random);
            }

            user.Reset = WebEncoders.Base64UrlEncode(random);
            user.ResetGenerated = DateTime.Now;

            await _context.SaveChangesAsync();

            return new JsonResult(user.Reset);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> DeleteUser(string id) {
            if (id == User.FindFirstValue(ClaimTypes.Name))
                return BadRequest("Cannot delete your own account");

            User user;
            try {
                user = await _context.Users
                    .Include(u => u.RefreshTokens)
                    .Include(u => u.Items)
                    .Include(u => u.Records)
                    .FirstAsync(u => u.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok();
        }

        public class NewUser {
            public string Username { get; set; }
            public bool Admin { get; set; }
        }
    }
}