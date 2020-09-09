using System;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using todd.Configuration;
using todd.Data;
using todd.Models;
using todd.Utils;

namespace todd.Controllers {
    [ApiController]
    [Route("api/user/[action]")]
    public class UserController : ControllerBase {
        private readonly ToddContext _context;
        private readonly IAuthUtils _authUtils;
        private readonly SecurityOptions _options;

        public UserController(ToddContext context, IAuthUtils authUtils, IOptions<SecurityOptions> options) {
            _context = context;
            _authUtils = authUtils;
            _options = options.Value;
        }

        [HttpPost]
        [Authorize(Roles = "write,admin")]
        public async Task<IActionResult> ChangePassword(Passwords passwords) {
            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Id == User.FindFirstValue(ClaimTypes.Name));
            } catch (InvalidOperationException) {
                return Unauthorized("User not found");
            }

            string oldHash = _authUtils.Hash(passwords.oldPass, Convert.FromBase64String(user.Salt), user.HashIterations, user.HashSize);

            if (oldHash != user.Password) {
                return Unauthorized("Current password incorrect");
            }

            byte[] salt = _authUtils.GenerateSalt();
            string newHash = _authUtils.Hash(passwords.newPass, salt, _options.HashIter, _options.HashSize);

            user.Salt = Convert.ToBase64String(salt);
            user.Password = newHash;
            user.HashIterations = _options.HashIter;
            user.HashSize = _options.HashSize;
            user.SaltSize = _options.SaltSize;

            await _context.SaveChangesAsync();

            return Ok();
        }
    }

    public class Passwords {
        public string oldPass { get; set; }
        public string newPass { get; set; }
    }
}