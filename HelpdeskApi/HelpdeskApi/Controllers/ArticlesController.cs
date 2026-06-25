using System.Security.Claims;
using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using HelpdeskApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ArticlesController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public ArticlesController(HelpdeskDbContext db) => _db = db;

    // List with optional search + category filter.
    // Requesters see only published; agents/admins see everything (incl. drafts).
    [HttpGet]
    public async Task<ActionResult<List<ArticleListItem>>> GetAll(
        [FromQuery] string? search, [FromQuery] int? categoryId)
    {
        var isAgent = User.IsInRole("Agent") || User.IsInRole("Admin");

        var query = _db.Articles
            .Include(a => a.ArticleCategory)
            .Include(a => a.Author)
            .AsQueryable();

        if (!isAgent)
            query = query.Where(a => a.IsPublished);   // requesters: published only

        if (categoryId.HasValue)
            query = query.Where(a => a.ArticleCategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Title.Contains(search) || a.Body.Contains(search));

        var items = await query
            .OrderByDescending(a => a.UpdatedAt)
            .Select(a => new ArticleListItem
            {
                Id = a.Id,
                Title = a.Title,
                CategoryName = a.ArticleCategory!.Name,
                AuthorName = a.Author != null ? a.Author.DisplayName : null,
                IsPublished = a.IsPublished,
                ViewCount = a.ViewCount,
                UpdatedAt = a.UpdatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ArticleDetail>> GetById(int id)
    {
        var a = await _db.Articles
            .Include(x => x.ArticleCategory)
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a is null) return NotFound();

        var isAgent = User.IsInRole("Agent") || User.IsInRole("Admin");
        if (!a.IsPublished && !isAgent) return NotFound();  // hide drafts from requesters

        // Increment view count (fire and forget-ish).
        a.ViewCount++;
        await _db.SaveChangesAsync();

        return Ok(new ArticleDetail
        {
            Id = a.Id,
            Title = a.Title,
            Body = a.Body,
            ArticleCategoryId = a.ArticleCategoryId,
            CategoryName = a.ArticleCategory!.Name,
            AuthorName = a.Author?.DisplayName,
            IsPublished = a.IsPublished,
            ViewCount = a.ViewCount,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<ActionResult<ArticleDetail>> Create(CreateArticleRequest request)
    {
        var userId = GetUserId();
        var article = new Article
        {
            Title = request.Title,
            Body = request.Body,
            ArticleCategoryId = request.ArticleCategoryId,
            IsPublished = request.IsPublished,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Articles.Add(article);
        await _db.SaveChangesAsync();
        return await GetById(article.Id);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<ActionResult<ArticleDetail>> Update(int id, UpdateArticleRequest request)
    {
        var article = await _db.Articles.FindAsync(id);
        if (article is null) return NotFound();

        article.Title = request.Title;
        article.Body = request.Body;
        article.ArticleCategoryId = request.ArticleCategoryId;
        article.IsPublished = request.IsPublished;
        article.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetById(id);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var article = await _db.Articles.FindAsync(id);
        if (article is null) return NotFound();
        _db.Articles.Remove(article);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : null;
    }

    [HttpGet("{id:int}/comments")]
    public async Task<ActionResult<List<ArticleCommentResponse>>> GetComments(int id)
    {
        var comments = await _db.ArticleComments
            .Where(c => c.ArticleId == id)
            .Include(c => c.Author)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new ArticleCommentResponse
            {
                Id = c.Id,
                AuthorName = c.Author!.DisplayName,
                AuthorId = c.AuthorId,
                Body = c.Body,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
        return Ok(comments);
    }

    [HttpPost("{id:int}/comments")]
    public async Task<ActionResult<ArticleCommentResponse>> AddComment(int id, CreateArticleCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
        return BadRequest(new { message = "Comment cannot be empty." });

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var exists = await _db.Articles.AnyAsync(a => a.Id == id);
        if (!exists) return NotFound();

        var comment = new ArticleComment { ArticleId = id, AuthorId = userId.Value, Body = request.Body.Trim() };
        _db.ArticleComments.Add(comment);
        await _db.SaveChangesAsync();

        return await _db.ArticleComments
        .Where(c => c.Id == comment.Id)
        .Include(c => c.Author)
        .Select(c => new ArticleCommentResponse
        {
            Id = c.Id, AuthorName = c.Author!.DisplayName, AuthorId = c.AuthorId,
            Body = c.Body, CreatedAt = c.CreatedAt
        })
        .FirstAsync();
    }

    [HttpDelete("{id:int}/comments/{commentId:int}")]
    public async Task<IActionResult> DeleteComment(int id, int commentId)
    {
        var comment = await _db.ArticleComments.FindAsync(commentId);
        if (comment is null || comment.ArticleId != id) return NotFound();

        var userId = GetUserId();
        var isAgent = User.IsInRole("Agent") || User.IsInRole("Admin");
        if (!isAgent && comment.AuthorId != userId) return Forbid();   // not yours, not an agent

        _db.ArticleComments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}