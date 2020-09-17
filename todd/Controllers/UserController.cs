using System;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using todd.Configuration;
using todd.Data;
using todd.DTO;
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

        [HttpGet("{token}")]
        public async Task<IActionResult> GetActivationUsername(string token) {
            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Activation == token);
            } catch (InvalidOperationException) {
                return NotFound("Activation token not found");
            }

            return new JsonResult(user.Username);
        }

        [HttpPost]
        public async Task<IActionResult> Activate(PasswordDetails details) {
            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Activation == details.Token);
            } catch (InvalidOperationException) {
                return NotFound("Activation token not found");
            }

            byte[] salt = _authUtils.GenerateSalt();
            string newHash = _authUtils.Hash(details.Password, salt, _options.HashIter, _options.HashSize);

            user.Salt = Convert.ToBase64String(salt);
            user.Password = newHash;
            user.HashIterations = _options.HashIter;
            user.HashSize = _options.HashSize;
            user.SaltSize = _options.SaltSize;
            user.Active = true;
            user.Activation = null;

            RefreshToken token = new RefreshToken { Token = _authUtils.GenerateRefresh(user), User = user };

            _context.RefreshTokens.Add(token);

            await _context.SaveChangesAsync();

            return new JsonResult(new TokenPair { access = _authUtils.GenerateJWT(user), refresh = token.Token });
        }

        [HttpGet("{token}")]
        public async Task<IActionResult> GetResetStatus(string token) {
            if (String.IsNullOrEmpty(token)) return NotFound("Reset token not found");

            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Reset == token && u.Active == false);
            } catch (InvalidOperationException) {
                return NotFound("Reset token not found");
            }

            if (user.ResetGenerated.AddSeconds(_options.ResetExpiry) <= DateTime.Now) {
                user.Reset = null;
                await _context.SaveChangesAsync();
                return Forbid();
            }

            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword(PasswordDetails details) {
            if (String.IsNullOrEmpty(details.Token)) return NotFound("Reset token not found");

            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Reset == details.Token && u.Active == false);
            } catch (InvalidOperationException) {
                return NotFound("Reset token not found");
            }

            byte[] salt = _authUtils.GenerateSalt();
            string newHash = _authUtils.Hash(details.Password, salt, _options.HashIter, _options.HashSize);

            user.Salt = Convert.ToBase64String(salt);
            user.Password = newHash;
            user.HashIterations = _options.HashIter;
            user.HashSize = _options.HashSize;
            user.SaltSize = _options.SaltSize;
            user.Active = true;
            user.Reset = null;

            await _context.SaveChangesAsync();

            return Ok();
        }
    }

    public class Passwords {
        public string oldPass { get; set; }
        public string newPass { get; set; }
    }

    public class PasswordDetails {
        public string Token { get; set; }
        public string Password { get; set; }
    }
}