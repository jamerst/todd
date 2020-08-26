using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class Item {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Name { get; set; }
        public ItemType Type { get; set; }
        public string Description { get; set; }
        public Location Location { get; set; }
        public int Quantity { get; set; }
        public User Creator { get; set; }
        public DateTime Created { get; set; }
        public List<Image> Images { get; set; }
        public List<Record> Records { get; set; }
    }
}