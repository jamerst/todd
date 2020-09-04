using todd.Models;

namespace todd.DTO {
    public class ItemUpdate {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ItemType Type { get; set; }
        public string LocationId { get; set; }
        public Location Location { get; set; }
        public int Quantity { get; set; }
    }
}