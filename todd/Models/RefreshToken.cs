using System;
using System.ComponentModel.DataAnnotations;

namespace todd.Models {
    public class RefreshToken {
        [Key]
        public string Token { get; set; }
        public User User { get; set; }
        public DateTime Generated { get; set; } = DateTime.Now;
    }
}