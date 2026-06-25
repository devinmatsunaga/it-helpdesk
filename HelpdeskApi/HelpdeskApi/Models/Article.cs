namespace HelpdeskApi.Models;

public class Article
{
    public int Id {get;set;}
    public string Title {get;set;} = string.Empty;
    public string Body {get;set;} = string.Empty;

    public int ArticleCategoryId {get;set;}
    public ArticleCategory? ArticleCategory {get;set;}

    public int? AuthorId {get;set;}
    public User? Author {get;set;}

    public bool IsPublished {get;set;}
    public int ViewCount {get;set;}

    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
    public DateTime UpdatedAt {get;set;} = DateTime.UtcNow;
}