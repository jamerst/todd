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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivationUsername(string id) {
            UserActivation activation;
            try {
                activation = await _context.UserActivations.Include(ua => ua.User).FirstAsync(ua => ua.Id == id);
            } catch (InvalidOperationException) {
                return NotFound("Activation ID not found");
            }

            return new JsonResult(activation.User.Username);
        }

        [HttpPost]
        public async Task<IActionResult> Activate(ActivationDetails details) {
            UserActivation activation;
            try {
                activation = await _context.UserActivations.Include(ua => ua.User).FirstAsync(ua => ua.Id == details.ActivationId);
            } catch (InvalidOperationException) {
                return NotFound("Activation ID not found");
            }

            byte[] salt = _authUtils.GenerateSalt();
            string newHash = _authUtils.Hash(details.Password, salt, _options.HashIter, _options.HashSize);

            activation.User.Salt = Convert.ToBase64String(salt);
            activation.User.Password = newHash;
            activation.User.HashIterations = _options.HashIter;
            activation.User.HashSize = _options.HashSize;
            activation.User.SaltSize = _options.SaltSize;
            activation.User.Active = true;

            RefreshToken token = new RefreshToken { Token = _authUtils.GenerateRefresh(activation.User), User = activation.User };

            _context.RefreshTokens.Add(token);

            _context.UserActivations.Remove(activation);
            await _context.SaveChangesAsync();

            return new JsonResult(new TokenPair { access = _authUtils.GenerateJWT(activation.User), refresh = token.Token });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResetStatus(string id) {
            PasswordReset reset;
            try {
                reset = await _context.PasswordResets.FirstAsync(r => r.Id == id);
            } catch (InvalidOperationException) {
                return NotFound();
            }

            if (reset.Generated.AddSeconds(_options.ResetExpiry) <= DateTime.Now) {
                _context.PasswordResets.Remove(reset);
                await _context.SaveChangesAsync();
                return Forbid();
            }

            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetDetails details) {
            PasswordReset reset;
            try {
                reset = await _context.PasswordResets.Include(ua => ua.User).FirstAsync(ua => ua.Id == details.ResetId);
            } catch (InvalidOperationException) {
                return NotFound("Reset ID not found");
            }

            byte[] salt = _authUtils.GenerateSalt();
            string newHash = _authUtils.Hash(details.Password, salt, _options.HashIter, _options.HashSize);

            reset.User.Salt = Convert.ToBase64String(salt);
            reset.User.Password = newHash;
            reset.User.HashIterations = _options.HashIter;
            reset.User.HashSize = _options.HashSize;
            reset.User.SaltSize = _options.SaltSize;
            reset.User.Active = true;

            _context.PasswordResets.Remove(reset);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }

    public class Passwords {
        public string oldPass { get; set; }
        public string newPass { get; set; }
    }

    public class ActivationDetails {
        public string ActivationId { get; set; }
        public string Password { get; set; }
    }

    public class ResetDetails {
        public string ResetId { get; set; }
        public string Password { get; set; }
    }
}