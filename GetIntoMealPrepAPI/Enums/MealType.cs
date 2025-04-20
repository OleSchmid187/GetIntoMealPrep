using System.Text.Json.Serialization;

namespace GetIntoMealPrepAPI.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MealType
    {
        Breakfast,
        Snack1,
        Lunch,
        Snack2,
        Dinner
    }
}
