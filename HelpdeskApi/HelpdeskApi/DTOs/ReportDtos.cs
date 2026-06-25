namespace HelpdeskApi.DTOs;

public class TimeSeriesPoint
{
    public string Period { get; set; } = string.Empty;  // e.g. "2026-06-25"
    public int Count { get; set; }
}

public class AgentStat
{
    public string AgentName { get; set; } = string.Empty;
    public int Assigned { get; set; }
    public int Resolved { get; set; }
}

public class CategoryStat
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ResolutionStat
{
    public double AvgDaysToClose { get; set; }
    public int ClosedCount { get; set; }
    public List<TimeSeriesPoint> ByPriority { get; set; } = new();  // avg days per priority (Count field reused as rounded days)
}

public class ReportSummary
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public double AvgDaysToClose { get; set; }
    public List<TimeSeriesPoint> VolumeOverTime { get; set; } = new();
    public List<AgentStat> AgentPerformance { get; set; } = new();
    public List<CategoryStat> CategoryTrends { get; set; } = new();
}