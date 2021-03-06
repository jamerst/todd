using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using todd.Configuration;
using todd.Data;
using todd.DTO;
using todd.Models;
using todd.Utils;

namespace todd.Controllers {
    [ApiController]
    [Route("api/auth/[action]")]
    public class AuthController : ControllerBase {
        private readonly ToddContext _context;
        private readonly IAuthUtils _authUtils;
        private readonly SecurityOptions _options;

        public AuthController(ToddContext context, IAuthUtils authUtils, IOptions<SecurityOptions> options) {
            _context = context;
            _authUtils = authUtils;
            _options = options.Value;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginDetails login) {
            User user;
            try {
                user = await _context.Users.FirstAsync(u => u.Username == login.username && u.Active);
            } catch (InvalidOperationException) {
                return Unauthorized();
            }

            string hashed = _authUtils.Hash(login.password, Convert.FromBase64String(user.Salt), user.HashIterations, user.HashSize);

            if (user.Password != hashed) return Unauthorized();

            // if user security config is outdated, update it
            if (user.HashIterations != _options.HashIter
            || user.HashSize != _options.HashSize
            || user.SaltSize != _options.SaltSize) {
                byte[] salt = _authUtils.GenerateSalt();
                string hash = _authUtils.Hash(login.password, salt, _options.HashIter, _options.HashSize);

                user.Salt = Convert.ToBase64String(salt);
                user.Password = hash;
                user.HashIterations = _options.HashIter;
                user.HashSize = _options.HashSize;
                user.SaltSize = _options.SaltSize;

                await _context.SaveChangesAsync();
            }

            RefreshToken token = new RefreshToken { Token = _authUtils.GenerateRefresh(user), User = user };

            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();

            return new JsonResult(new TokenPair { access = _authUtils.GenerateJWT(user), refresh = token.Token });
        }

        [HttpPost]
        public async Task<IActionResult> LoginReadonly(LoginDetails login) {
            if (login.password == (await _context.Settings.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Key == "SitePassword")).Value) {
                return new JsonResult(new TokenPair { access = _authUtils.GenerateJWT() });
            } else {
                return Unauthorized();
            }
        }

        [HttpPost]
        public async Task<IActionResult> Refresh(TokenPair tokens) {
            string accessUser, refreshUser;
            try {
                accessUser = _authUtils.GetTokenUser(tokens.access);
                refreshUser = _authUtils.GetTokenUser(tokens.refresh);
            } catch (Exception) {
                return Unauthorized("Invalid token pair");
            }

            if (accessUser != refreshUser) {
                return Unauthorized("Invalid token pair");
            }

            bool valid, expired = false;
            try {
                valid = _authUtils.ValidateRefresh(tokens.refresh);
            } catch (SecurityTokenExpiredException) {
                expired = true;
            }

            RefreshToken rToken;
            try {
                rToken = await _context.RefreshTokens.Include(rt => rt.User).FirstAsync(rt => rt.Token == tokens.refresh);
            } catch (InvalidOperationException) {
                return Unauthorized("Invalid refresh token");
            }

            if (rToken.User.Id != accessUser)
                return Unauthorized("Invalid refresh token");

            if (!rToken.User.Active)
                return Unauthorized("User disabled");

            TokenPair newTokens = new TokenPair();
            newTokens.access = _authUtils.GenerateJWT(rToken.User);

            if (rToken.Generated.AddSeconds(_options.RefreshTokExpiry) <= DateTime.Now && expired) {
                newTokens.refresh = _authUtils.GenerateRefresh(rToken.User);

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

        public class LoginDetails {
            public string username { get; set; }
            public string password { get; set; }
        }
    }
}