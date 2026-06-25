namespace Helpdeskapi.DTOs;

public class StatItem
{
    public string Label {get;set;} = string.Empty;
    public int Count {get;set;}
}

public class DashboardSummary
{
    public int TotalTickets {get;set;}
    public int OpenTickets {get;set;}
    public int ClosedTickets {get;set;}
    public int TotalAssets {get;set;}
    public List<StatItem> ByStatus {get;set;} = new();
    public List<StatItem> ByPriority {get;set;} = new();
    public List<StatItem> ByCategory {get;set;} = new();
}