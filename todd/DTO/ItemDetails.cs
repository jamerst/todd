using System;
using System.Collections.Generic;

using todd.Models;

namespace todd.DTO {
    public class ItemDetails {
        public string Name { get; set; }
        public ItemType Type { get; set; }
        public string Description { get; set; }
        public string LocationName { get; set; }
        public int Quantity { get; set; }
        public string CreatorName { get; set; }
        public DateTime Created { get; set; }
        public List<string> ImageIds { get; set; }
        public List<ItemDetailsRecord> Records { get; set; }
    }
}