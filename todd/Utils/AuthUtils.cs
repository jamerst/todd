using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

using todd.Models;

namespace todd.Utils {
    public class AuthUtils : IAuthUtils {
        private readonly IConfiguration _config;
        public AuthUtils(IConfiguration config) {
            _config = config;
        }

        public string Hash(string password, byte[] salt, int iterations, int size) {
            return Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password,
                salt,
                KeyDerivationPrf.HMACSHA1,
                iterations,
                size / 8
            ));
        }

        public byte[] GenerateSalt() {
            byte[] salt = new byte[Int32.Parse(_config["Security:SaltSize"]) / 8];

            using (var RNG = RandomNumberGenerator.Create()) {
                RNG.GetBytes(salt);
            }

            return salt;
        }

        public string GenerateJWT() {
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor {
                Expires = DateTime.UtcNow.AddSeconds(Int32.Parse(_config["Security:AccessTokExpiry"])),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("TODD_JWT_KEY"))), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
        }

        public string GenerateJWT(User user) {
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(new Claim[] {
                    new Claim(ClaimTypes.Name, user.Id),
                    new Claim(ClaimTypes.Role, user.Admin ? "admin" : "write")
                }),
                Expires = DateTime.UtcNow.AddSeconds(Int32.Parse(_config["Security:AccessTokExpiry"])),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("TODD_JWT_KEY"))), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
        }

        public string GenerateRefresh() {
            byte[] token = new byte[Int32.Parse(_config["Security:RefreshTokSize"]) / 8];

            using (var RNG = RandomNumberGenerator.Create()) {
                RNG.GetBytes(token);
            }

            return Convert.ToBase64String(token);
        }

        public string GetTokenUser(string token) {
            var handler = new JwtSecurityTokenHandler();
            SecurityToken sToken;

            var principal = handler.ValidateToken(
                token,
                new TokenValidationParameters {
                    ValidateAudience = false,
                    ValidateIssuer = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(System.Environment.GetEnvironmentVariable("TODD_JWT_KEY")))
                },
                out sToken
            );

            JwtSecurityToken jToken = sToken as JwtSecurityToken;

            if (jToken == null
            || !jToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal.Identity.Name;
        }
    }

    public interface IAuthUtils {
        string Hash(string password, byte[] salt, int iterations, int size);
        byte[] GenerateSalt();
        string GenerateJWT();
        string GenerateJWT(User user);
        string GenerateRefresh();
        string GetTokenUser(string token);
    }
}