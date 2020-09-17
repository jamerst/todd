using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class User {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Salt { get; set; }
        public int HashSize { get; set; }
        public int HashIterations { get; set; }
        public int SaltSize { get; set; }
        public bool Admin { get; set; }
        public bool Active { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; }
        public List<Item> Items { get; set; }
        public List<Record> Records { get; set; }
        public string Reset { get; set; }
        public DateTime ResetGenerated { get; set; }
        public string Activation { get; set; }
    }
}
