namespace HelpdeskApi.Models;

public class ArticleComment
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public Article? Article { get; set; }
    public int AuthorId { get; set; }
    public User? Author { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}