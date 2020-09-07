using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class Image {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Path { get; set; }
        public string ItemId { get; set; }
        public Item Item { get; set; }
    }
}