namespace todd.Configuration {
    public class SecurityOptions {
        public const string Section = "Security";
        public int AccessTokExpiry { get; set; }
        public int RefreshTokExpiry { get; set; }
        public int RefreshTokSize { get; set; }
        public int SaltSize { get; set; }
        public int HashSize { get; set; }
        public int HashIter { get; set; }
    }
}