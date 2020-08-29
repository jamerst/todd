using todd.Models;

namespace todd.DTO {
    public class ItemResult {
        public string Id { get; set; }
        public string Name { get; set; }
        public ItemType Type { get; set; }
        public string Description { get; set; }
        public string LocationName { get; set; }
        public string ImageId { get; set; }
    }
}