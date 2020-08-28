namespace todd.Configuration {
    public class ImageOptions {
        public const string Section = "ItemImages";
        public string SaveDir { get; set; }
        public int Size { get; set; }
        public int JpegQuality { get; set; }
    }
}