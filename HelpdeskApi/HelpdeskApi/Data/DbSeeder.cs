using System.Runtime.CompilerServices;
using HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(HelpdeskDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync())
            return;

        var hardware = new Category {Name = "Hardware"};
        var software = new Category {Name = "Software"};
        var network = new Category {Name = "Network"};
        var access = new Category {Name = "Access"};
        db.Categories.AddRange(hardware, software, network, access);

        var alice = new User {DisplayName = "Alice Requester", Email = "alice@example.com", Role = UserRole.Requester};
        var bob = new User {DisplayName = "Bob Agent", Email = "bob@example.com", Role = UserRole.Agent};
        db.Users.AddRange(alice, bob);

        var laptop = new Asset {AssetTag = "LAP-001", Name = "Dell Latitude", Type = "Laptop", Location = "Floor 2"};
        db.Assets.Add(laptop);

        var ticket = new Ticket
        {
            Title = "Laptop won't boot",
            Description = "Black screen on startup",
            Requester = alice,
            AssignedAgent = bob,
            Category = hardware,
            Asset = laptop,
            Priority = TicketPriority.High,
            Status = TicketStatus.InProgress
        };
        ticket.Comments.Add(new TicketComment
        {
            Author = bob,
            Body = "Looking into this now",
            IsInternal = true
        });
        db.Tickets.Add(ticket);

        if (!await db.ArticleCategories.AnyAsync())
        {
            var gettingStarted = new ArticleCategory {Name = "Getting Started"};
            var acAccounts = new ArticleCategory {Name = "Accounts & Access"};
            var acHardware = new ArticleCategory {Name = "Hardware"};
            db.ArticleCategories.AddRange(gettingStarted, acAccounts, acHardware);
            
            db.Articles.Add(new Article
            {
                Title = "How to reset your password",
                Body = "## Resetting Your Password\n\n1. Go to login page. \n2. Click **Forgot Password**.\n3. Follow the emailed link. \n\nIf you're still locked out, contact IT. ",
                ArticleCategory = acAccounts,
                IsPublished = true
            });
        }

        await db.SaveChangesAsync();
    }
}