using System;
using todd.Models;

namespace todd.DTO {
    public class ItemDetailsRecord {
        public string Username { get; set; }
        public string Description { get; set; }
        public RecordType Type { get; set; }
        public DateTime Date { get; set; }
    }
}