namespace HelpdeskApi.DTOs;

public class CommentResponse
{
    public int Id {get;set;}
    public string AuthorName {get;set;} = string.Empty;
    public string Body {get;set;} = string.Empty;
    public bool IsInternal {get;set;}
    public DateTime CreatedAt {get;set;}
}

public class CreateCommentResponse
{
    public int AuthorId {get;set;}
    public string Body {get;set;} = string.Empty;
    public bool IsInternal {get;set;}
}