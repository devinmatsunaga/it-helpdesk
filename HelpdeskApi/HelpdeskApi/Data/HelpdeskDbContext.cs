using Microsoft.EntityFrameworkCore;
using HelpdeskApi.Models;

namespace HelpdeskApi.Data;

public class HelpdeskDbContext : DbContext
{
    public HelpdeskDbContext(DbContextOptions<HelpdeskDbContext> options)
        : base(options) {}

    public DbSet <User> Users => Set<User>();
    public DbSet <Ticket> Tickets => Set<Ticket>();
    public DbSet <Category> Categories => Set<Category>();
    public DbSet <Asset> Assets => Set<Asset>();
    public DbSet <TicketComment> TicketComments => Set<TicketComment>();
    public DbSet <AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Requester)
            .WithMany(u => u.RequestedTickets)
            .HasForeignKey(t => t.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedAgent)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedAgentId)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TicketComment>()
            .HasOne(c => c.Author)
            .WithMany()
            .HasForeignKey(c => c.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TicketComment>()
            .HasOne(c => c.Ticket)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.ChangedBy)
            .WithMany()
            .HasForeignKey(a => a.ChangedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}