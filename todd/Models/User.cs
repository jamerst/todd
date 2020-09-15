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
    }
}
