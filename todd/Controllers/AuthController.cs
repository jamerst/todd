using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using todd.Data;
using todd.Models;
using todd.Utils;

namespace todd.Controllers {
    [ApiController]
    [Route("api/auth/[action]")]
    public class AuthController : ControllerBase {
        private readonly ToddContext _context;
        private readonly IAuthUtils _authUtils;
        private readonly IConfiguration _config;

        public AuthController(ToddContext context, IAuthUtils authUtils, IConfiguration config) {
            _context = context;
            _authUtils = authUtils;
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginDetails login) {
            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Username == login.username);
            } catch (InvalidOperationException) {
                return Unauthorized();
            }

            string hashed = _authUtils.Hash(login.password, Convert.FromBase64String(user.Salt), user.HashIterations, user.HashSize);

            if (user.Password != hashed) return Unauthorized();

            // if user security config is outdated, update it
            if (user.HashIterations != Int32.Parse(_config["Security:HashIter"])
            || user.HashSize != Int32.Parse(_config["Security:HashSize"])
            || user.SaltSize != Int32.Parse(_config["Security:SaltSize"])) {
                byte[] salt = _authUtils.GenerateSalt();
                string hash = _authUtils.Hash(login.password, salt, user.HashIterations, user.HashSize);

                user.Salt = Convert.ToBase64String(salt);
                user.Password = hash;
                user.HashIterations = Int32.Parse(_config["Security:HashIter"]);
                user.HashSize = Int32.Parse(_config["Security:HashSize"]);
                user.SaltSize = Int32.Parse(_config["Security:SaltSize"]);

                await _context.SaveChangesAsync();
            }

            RefreshToken token = new RefreshToken { Token = _authUtils.GenerateRefresh(), User = user };

            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();

            return new JsonResult(new TokenPair { access = _authUtils.GenerateJWT(user), refresh = token.Token });
        }

        [HttpPost]
        public async Task<IActionResult> LoginReadonly(LoginDetails login) {
            if (login.password == (await _context.Settings.FirstOrDefaultAsync(s => s.Key == "SitePassword")).Value) {
                return new JsonResult(new TokenPair { access = _authUtils.GenerateJWT() });
            } else {
                return Unauthorized();
            }
        }

        [HttpPost]
        public async Task<IActionResult> Refresh(TokenPair tokens) {
            string user = _authUtils.GetTokenUser(tokens.access);

            RefreshToken rToken;
            try {
                rToken = await _context.RefreshTokens.Include(rt => rt.User).FirstAsync(rt => rt.Token == tokens.refresh);
            } catch (InvalidOperationException) {
                return BadRequest("Invalid refresh token");
            }

            if (rToken.User.Id != user)
                return BadRequest("Invalid refresh token");

            TokenPair newTokens = new TokenPair();
            newTokens.access = _authUtils.GenerateJWT(rToken.User);

            if (rToken.Generated.AddSeconds(Int32.Parse(_config["Security:RefreshTokExpiry"])) <= DateTime.Now) {
                newTokens.refresh = _authUtils.GenerateRefresh();

                _context.RefreshTokens.Add(new RefreshToken { Token = newTokens.refresh, User = rToken.User });
                _context.RefreshTokens.Remove(rToken);
                await _context.SaveChangesAsync();
            }

            return new JsonResult(newTokens);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Logout(RefreshToken token) {
            try {
                _context.RefreshTokens.Remove(token);
                await _context.SaveChangesAsync();
            } catch {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error revoking refresh token");
            }

            return Ok();
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task Create(string username, string password, string email, bool admin) {
            byte[] salt = _authUtils.GenerateSalt();
            string hash = _authUtils.Hash(password, salt, Int32.Parse(_config["Security:HashIter"]), Int32.Parse(_config["Security:HashSize"]));

            User user = new User {
                Username = username,
                Email = email,
                Password = hash,
                Salt = Convert.ToBase64String(salt),
                HashIterations = Int32.Parse(_config["Security:HashIter"]),
                HashSize = Int32.Parse(_config["Security:HashSize"]),
                SaltSize = Int32.Parse(_config["Security:SaltSize"]),
                Admin = admin
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();
        }

        public class TokenPair {
            public string access { get; set; }
            public string refresh { get; set; }
        }

        public class LoginDetails {
            public string username { get; set; }
            public string password { get; set; }
        }
    }
}