using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace todd.Models {
    public class NewItem {
        public string Name { get; set; }
        public ItemType Type { get; set; }
        public string Description { get; set; }
        public string LocationId { get; set; }
        public Location Location { get; set; }
        public int Quantity { get; set; }
        public List<IFormFile> Images { get; set; }
    }
}