using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class UserActivation {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public User User { get; set; }
    }
}