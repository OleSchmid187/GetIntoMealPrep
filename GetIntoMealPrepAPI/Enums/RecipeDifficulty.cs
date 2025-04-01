using System.Text.Json.Serialization;

namespace GetIntoMealPrepAPI.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RecipeDifficulty
{
    Easy,
    Medium,
    Hard
}