using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class PasswordReset {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public User User { get; set; }
        public DateTime Generated { get; set; }
    }
}