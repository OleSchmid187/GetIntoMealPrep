namespace GetIntoMealPrepAPI.Utils;

public static class DateHelper
{
    public static (DateTime Start, DateTime End) GetWeekRange(int offset)
    {
        var today = DateTime.Today;
        var diffToMonday = today.DayOfWeek == DayOfWeek.Sunday ? -6 : DayOfWeek.Monday - today.DayOfWeek;
        var monday = today.AddDays(diffToMonday + offset * 7);
        var sunday = monday.AddDays(6);

        return (monday, sunday);
    }
}
