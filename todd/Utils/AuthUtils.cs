using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;

using todd.Configuration;
using todd.Models;

namespace todd.Utils {
    public class AuthUtils : IAuthUtils {
        private readonly SecurityOptions _options;
        public AuthUtils(IOptions<SecurityOptions> options) {
            _options = options.Value;
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
            byte[] salt = new byte[_options.SaltSize / 8];

            using (var RNG = RandomNumberGenerator.Create()) {
                RNG.GetBytes(salt);
            }

            return salt;
        }

        public string GenerateJWT() {
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor {
                Expires = DateTime.UtcNow.AddSeconds(_options.AccessTokExpiry),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("TODD_JWT_KEY"))),
                    SecurityAlgorithms.HmacSha256Signature
                )
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
                Expires = DateTime.UtcNow.AddSeconds(_options.AccessTokExpiry),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("TODD_JWT_KEY"))),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
        }

        public string GenerateRefresh(User user) {
            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor {
                Expires = DateTime.UtcNow.AddSeconds(_options.RefreshTokExpiry),
                Subject = new ClaimsIdentity(new Claim[] {
                    new Claim(ClaimTypes.Name, user.Id)
                }),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("TODD_JWT_REFRESH_KEY"))),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
        }

        public bool ValidateRefresh(string token) {
            var handler = new JwtSecurityTokenHandler();
            SecurityToken sToken;

            try {
                var principal = handler.ValidateToken(
                    token,
                    new TokenValidationParameters {
                        ValidateAudience = false,
                        ValidateIssuer = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(System.Environment.GetEnvironmentVariable("TODD_JWT_REFRESH_KEY")))
                    },
                    out sToken
                );
            } catch (SecurityTokenExpiredException) {
                throw new SecurityTokenExpiredException();
            } catch (Exception) {
                return false;
            }

            JwtSecurityToken jToken = sToken as JwtSecurityToken;

            return jToken != null || !jToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase);
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
        string GenerateRefresh(User user);
        bool ValidateRefresh(string token);
        string GetTokenUser(string token);
    }
}