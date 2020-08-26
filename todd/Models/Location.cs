using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class Location {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Name { get; set; }
    }
}