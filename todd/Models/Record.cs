using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace todd.Models {
    public class Record {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string ItemId { get; set; }
        public Item Item { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public RecordType Type { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
   }
}