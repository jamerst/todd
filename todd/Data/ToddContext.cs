using todd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace todd.Data {
    public class ToddContext : DbContext {
        public ToddContext(DbContextOptions options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);

            builder.Entity<Item>()
                .HasMany(i => i.Images)
                .WithOne(im => im.Item)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Item>()
                .HasMany(i => i.Records)
                .WithOne(r => r.Item)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }

        public DbSet<Image> Images { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Record> Records { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<UserActivation> UserActivations { get; set; }
    }
}
