namespace HelpdeskApi.DTOs;

// List view — light, no full body
public class ArticleListItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? AuthorName { get; set; }
    public bool IsPublished { get; set; }
    public int ViewCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Read view — full content
public class ArticleDetail
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int ArticleCategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? AuthorName { get; set; }
    public bool IsPublished { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int ArticleCategoryId { get; set; }
    public bool IsPublished { get; set; }
}

public class UpdateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int ArticleCategoryId { get; set; }
    public bool IsPublished { get; set; }
}

public class ArticleCategoryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class ArticleCommentResponse
{
    public int Id {get;set;}
    public string AuthorName {get;set;} = string.Empty;
    public int AuthorId {get;set;}
    public string Body {get;set;} = string.Empty;
    public DateTime CreatedAt {get;set;}
}

public class CreateArticleCommentRequest
{
    public string Body {get;set;} =string.Empty;
}