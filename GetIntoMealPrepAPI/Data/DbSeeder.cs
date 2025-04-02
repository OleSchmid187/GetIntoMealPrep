using GetIntoMealPrepAPI.Models;
using GetIntoMealPrepAPI.Enums;

namespace GetIntoMealPrepAPI.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Recipes.Any()) return;

        var rice = new Ingredient
        {
            Name = "Reis",
            Price = 1.49m,
            CaloriesPer100g = 130,
            Protein = 2.7f,
            Fat = 0.3f,
            Carbs = 28f,
            ImageUrl = "/resources/ingredients/ingredient_reis.png"
        };

        var broccoli = new Ingredient
        {
            Name = "Brokkoli",
            Price = 0.89m,
            CaloriesPer100g = 34,
            Protein = 2.8f,
            Fat = 0.4f,
            Carbs = 7.2f,
            ImageUrl = "/resources/ingredients/ingredient_brokkoli.png"
        };

        var tofu = new Ingredient
        {
            Name = "Tofu",
            Price = 2.50m,
            CaloriesPer100g = 145,
            Protein = 15.0f,
            Fat = 9.0f,
            Carbs = 3.9f,
            ImageUrl = "/resources/ingredients/ingredient_tofu.png"
        };

        var bellPepper = new Ingredient
        {
            Name = "Paprika",
            Price = 1.10m,
            CaloriesPer100g = 31,
            Protein = 1.0f,
            Fat = 0.3f,
            Carbs = 6.0f,
            ImageUrl = "/resources/ingredients/ingredient_paprika.png"
        };

        var carrots = new Ingredient
        {
            Name = "Karotten",
            Price = 0.99m,
            CaloriesPer100g = 41,
            Protein = 0.9f,
            Fat = 0.2f,
            Carbs = 9.6f,
            ImageUrl = "/resources/ingredients/ingredient_karotten.png"
        };

        var garlic = new Ingredient
        {
            Name = "Knoblauch",
            Price = 0.50m,
            CaloriesPer100g = 149,
            Protein = 6.4f,
            Fat = 0.5f,
            Carbs = 33.1f,
            ImageUrl = "/resources/ingredients/ingredient_knoblauch.png"
        };

        var ginger = new Ingredient
        {
            Name = "Ingwer",
            Price = 0.70m,
            CaloriesPer100g = 80,
            Protein = 1.8f,
            Fat = 0.8f,
            Carbs = 17.8f,
            ImageUrl = "/resources/ingredients/ingredient_ingwer.png"
        };

        var soySauce = new Ingredient
        {
            Name = "Sojasauce",
            Price = 2.00m,
            CaloriesPer100g = 53,
            Protein = 8.1f,
            Fat = 0.1f,
            Carbs = 4.9f,
            ImageUrl = "/resources/ingredients/ingredient_sojasauce.png"
        };

        var sesame = new Ingredient
        {
            Name = "Sesam",
            Price = 1.50m,
            CaloriesPer100g = 573,
            Protein = 17.7f,
            Fat = 49.7f,
            Carbs = 23.5f,
            ImageUrl = "/resources/ingredients/ingredient_sesam.png"
        };

        var mapleSyrup = new Ingredient
        {
            Name = "Ahornsirup",
            Price = 3.99m,
            CaloriesPer100g = 260,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 67.0f,
            ImageUrl = "/resources/ingredients/ingredient_ahornsirup.png"
        };

        var eggs = new Ingredient
        {
            Name = "Eier",
            Price = 2.99m,
            CaloriesPer100g = 155,
            Protein = 13.0f,
            Fat = 11.0f,
            Carbs = 1.1f,
            ImageUrl = "/resources/ingredients/ingredient_eier.png"
        };

        var mustard = new Ingredient
        {
            Name = "Senf",
            Price = 1.20m,
            CaloriesPer100g = 66,
            Protein = 3.7f,
            Fat = 4.0f,
            Carbs = 5.3f,
            ImageUrl = "/resources/ingredients/ingredient_senf.png"
        };

        var honey = new Ingredient
        {
            Name = "Honig",
            Price = 4.50m,
            CaloriesPer100g = 304,
            Protein = 0.3f,
            Fat = 0.0f,
            Carbs = 82.4f,
            ImageUrl = "/resources/ingredients/ingredient_honig.png"
        };

        var longGrainRice = new Ingredient
        {
            Name = "Langkorn Reis",
            Price = 1.79m,
            CaloriesPer100g = 130,
            Protein = 2.7f,
            Fat = 0.3f,
            Carbs = 28.0f,
            ImageUrl = "/resources/ingredients/ingredient_langkorn_reis.png"
        };

        var quinoa = new Ingredient
        {
            Name = "Quinoa",
            Price = 3.50m,
            CaloriesPer100g = 120,
            Protein = 4.1f,
            Fat = 1.9f,
            Carbs = 21.3f,
            ImageUrl = "/resources/ingredients/ingredient_quinoa.png"
        };

        var greenPesto = new Ingredient
        {
            Name = "Pesto grün",
            Price = 2.99m,
            CaloriesPer100g = 450,
            Protein = 4.0f,
            Fat = 45.0f,
            Carbs = 6.0f,
            ImageUrl = "/resources/ingredients/ingredient_pesto_gruen.png"
        };

        var groundBeef = new Ingredient
        {
            Name = "Rinderhackfleisch",
            Price = 5.99m,
            CaloriesPer100g = 250,
            Protein = 26.0f,
            Fat = 17.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_rinderhackfleisch.png"
        };

        var smokedSalmon = new Ingredient
        {
            Name = "Räucherlachs",
            Price = 6.50m,
            CaloriesPer100g = 142,
            Protein = 20.0f,
            Fat = 6.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_raeucherlachs.png"
        };

        var salmonFillet = new Ingredient
        {
            Name = "Lachsfilet",
            Price = 7.99m,
            CaloriesPer100g = 208,
            Protein = 20.0f,
            Fat = 13.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_lachsfilet.png"
        };

        var dicedHam = new Ingredient
        {
            Name = "Schinkenwürfel",
            Price = 2.50m,
            CaloriesPer100g = 145,
            Protein = 19.0f,
            Fat = 7.0f,
            Carbs = 1.0f,
            ImageUrl = "/resources/ingredients/ingredient_schinkenwuerfel.png"
        };

        var cookedHam = new Ingredient
        {
            Name = "Gekochter Schinken",
            Price = 2.99m,
            CaloriesPer100g = 110,
            Protein = 20.0f,
            Fat = 3.0f,
            Carbs = 1.0f,
            ImageUrl = "/resources/ingredients/ingredient_gekochter_schinken.png"
        };

        var chickenBreast = new Ingredient
        {
            Name = "Hähnchenbrustfilet",
            Price = 6.99m,
            CaloriesPer100g = 165,
            Protein = 31.0f,
            Fat = 3.6f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_haehnchenbrustfilet.png"
        };

        var chickenMeat = new Ingredient
        {
            Name = "Hähnchenfleisch",
            Price = 5.99m,
            CaloriesPer100g = 190,
            Protein = 27.0f,
            Fat = 8.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_haehnchenfleisch.png"
        };

        var fetaCheese = new Ingredient
        {
            Name = "Feta-Käse",
            Price = 2.99m,
            CaloriesPer100g = 264,
            Protein = 14.0f,
            Fat = 21.0f,
            Carbs = 4.0f,
            ImageUrl = "/resources/ingredients/ingredient_feta_kaese.png"
        };

        var parmesan = new Ingredient
        {
            Name = "Parmesan",
            Price = 3.50m,
            CaloriesPer100g = 431,
            Protein = 38.0f,
            Fat = 29.0f,
            Carbs = 4.1f,
            ImageUrl = "/resources/ingredients/ingredient_parmesan.png"
        };

        var gouda = new Ingredient
        {
            Name = "Gouda",
            Price = 2.79m,
            CaloriesPer100g = 356,
            Protein = 25.0f,
            Fat = 27.0f,
            Carbs = 2.2f,
            ImageUrl = "/resources/ingredients/ingredient_gouda.png"
        };

        var cottageCheese = new Ingredient
        {
            Name = "Körniger Frischkäse",
            Price = 1.99m,
            CaloriesPer100g = 98,
            Protein = 11.0f,
            Fat = 4.3f,
            Carbs = 3.4f,
            ImageUrl = "/resources/ingredients/ingredient_koerniger_frischkaese.png"
        };

        var gruyere = new Ingredient
        {
            Name = "Gruyère",
            Price = 4.50m,
            CaloriesPer100g = 413,
            Protein = 30.0f,
            Fat = 32.0f,
            Carbs = 0.4f,
            ImageUrl = "/resources/ingredients/ingredient_gruyere.png"
        };

        var cremeFraiche = new Ingredient
        {
            Name = "Crème fraîche",
            Price = 1.49m,
            CaloriesPer100g = 292,
            Protein = 2.5f,
            Fat = 30.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_creme_fraiche.png"
        };

        var cremeLegere = new Ingredient
        {
            Name = "Crème légère",
            Price = 1.49m,
            CaloriesPer100g = 150,
            Protein = 3.0f,
            Fat = 15.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_creme_legere.png"
        };

        var butter = new Ingredient
        {
            Name = "Butter",
            Price = 2.49m,
            CaloriesPer100g = 717,
            Protein = 0.9f,
            Fat = 81.0f,
            Carbs = 0.1f,
            ImageUrl = "/resources/ingredients/ingredient_butter.png"
        };

        var sourCream = new Ingredient
        {
            Name = "Schmand",
            Price = 1.29m,
            CaloriesPer100g = 240,
            Protein = 2.0f,
            Fat = 24.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_schmand.png"
        };

        var milk = new Ingredient
        {
            Name = "Milch",
            Price = 0.99m,
            CaloriesPer100g = 42,
            Protein = 3.4f,
            Fat = 1.0f,
            Carbs = 5.0f,
            ImageUrl = "/resources/ingredients/ingredient_milch.png"
        };

        var coconutMilk = new Ingredient
        {
            Name = "Kokosmilch",
            Price = 2.49m,
            CaloriesPer100g = 230,
            Protein = 2.3f,
            Fat = 24.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_kokosmilch.png"
        };

        var tzatziki = new Ingredient
        {
            Name = "Tzatziki",
            Price = 1.99m,
            CaloriesPer100g = 120,
            Protein = 3.0f,
            Fat = 10.0f,
            Carbs = 4.0f,
            ImageUrl = "/resources/ingredients/ingredient_tzatziki.png"
        };

        var cream = new Ingredient
        {
            Name = "Sahne",
            Price = 1.29m,
            CaloriesPer100g = 340,
            Protein = 2.0f,
            Fat = 36.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_sahne.png"
        };

        var greekYogurt = new Ingredient
        {
            Name = "Griechischer Joghurt",
            Price = 2.49m,
            CaloriesPer100g = 120,
            Protein = 5.0f,
            Fat = 10.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_griechischer_joghurt.png"
        };

        var coconutYogurt = new Ingredient
        {
            Name = "Kokosjoghurt",
            Price = 2.99m,
            CaloriesPer100g = 150,
            Protein = 1.0f,
            Fat = 12.0f,
            Carbs = 8.0f,
            ImageUrl = "/resources/ingredients/ingredient_kokosjoghurt.png"
        };

        var plainYogurt = new Ingredient
        {
            Name = "Naturjoghurt",
            Price = 1.49m,
            CaloriesPer100g = 60,
            Protein = 3.5f,
            Fat = 3.0f,
            Carbs = 4.0f,
            ImageUrl = "/resources/ingredients/ingredient_naturjoghurt.png"
        };

        var lowFatQuark = new Ingredient
        {
            Name = "Speisequark Magerstufe",
            Price = 1.29m,
            CaloriesPer100g = 67,
            Protein = 12.0f,
            Fat = 0.2f,
            Carbs = 4.0f,
            ImageUrl = "/resources/ingredients/ingredient_speisequark_magerstufe.png"
        };

        var oats = new Ingredient
        {
            Name = "Haferflocken",
            Price = 1.29m,
            CaloriesPer100g = 389,
            Protein = 16.9f,
            Fat = 6.9f,
            Carbs = 66.3f,
            ImageUrl = "/resources/ingredients/ingredient_haferflocken.png"
        };

        var wheatFlour = new Ingredient
        {
            Name = "Weizenmehl Type 405",
            Price = 0.89m,
            CaloriesPer100g = 364,
            Protein = 10.0f,
            Fat = 1.0f,
            Carbs = 76.0f,
            ImageUrl = "/resources/ingredients/ingredient_weizenmehl_405.png"
        };

        var freshDoughRolls = new Ingredient
        {
            Name = "Sonntagsbrötchen Frischteig",
            Price = 2.49m,
            CaloriesPer100g = 270,
            Protein = 7.0f,
            Fat = 3.5f,
            Carbs = 50.0f,
            ImageUrl = "/resources/ingredients/ingredient_sonntagsbroetchen.png"
        };

        var pumpernickel = new Ingredient
        {
            Name = "Pumpernickel",
            Price = 1.99m,
            CaloriesPer100g = 200,
            Protein = 5.0f,
            Fat = 1.0f,
            Carbs = 40.0f,
            ImageUrl = "/resources/ingredients/ingredient_pumpernickel.png"
        };

        var tortillas = new Ingredient
        {
            Name = "Tortillas",
            Price = 2.99m,
            CaloriesPer100g = 310,
            Protein = 8.0f,
            Fat = 7.0f,
            Carbs = 50.0f,
            ImageUrl = "/resources/ingredients/ingredient_tortillas.png"
        };

        var tempeh = new Ingredient
        {
            Name = "Tempeh",
            Price = 3.99m,
            CaloriesPer100g = 195,
            Protein = 19.0f,
            Fat = 11.0f,
            Carbs = 9.0f,
            ImageUrl = "/resources/ingredients/ingredient_tempeh.png"
        };

        var wholeGrainPasta = new Ingredient
        {
            Name = "Vollkornnudeln",
            Price = 1.79m,
            CaloriesPer100g = 350,
            Protein = 12.0f,
            Fat = 2.0f,
            Carbs = 70.0f,
            ImageUrl = "/resources/ingredients/ingredient_vollkornnudeln.png"
        };

        var mieNoodles = new Ingredient
        {
            Name = "Mie-Nudeln",
            Price = 2.49m,
            CaloriesPer100g = 360,
            Protein = 10.0f,
            Fat = 1.5f,
            Carbs = 75.0f,
            ImageUrl = "/resources/ingredients/ingredient_mie_nudeln.png"
        };

        var flaxseed = new Ingredient
        {
            Name = "Geschrotete Leinsamen",
            Price = 1.99m,
            CaloriesPer100g = 534,
            Protein = 18.3f,
            Fat = 42.2f,
            Carbs = 28.9f,
            ImageUrl = "/resources/ingredients/ingredient_leinsamen.png"
        };

        var almonds = new Ingredient
        {
            Name = "Mandeln",
            Price = 3.99m,
            CaloriesPer100g = 579,
            Protein = 21.2f,
            Fat = 49.9f,
            Carbs = 21.6f,
            ImageUrl = "/resources/ingredients/ingredient_mandeln.png"
        };

        var pumpkinSeeds = new Ingredient
        {
            Name = "Kürbiskerne",
            Price = 2.99m,
            CaloriesPer100g = 559,
            Protein = 30.2f,
            Fat = 49.1f,
            Carbs = 10.7f,
            ImageUrl = "/resources/ingredients/ingredient_kuerbiskerne.png"
        };

        var peanuts = new Ingredient
        {
            Name = "Erdnüsse",
            Price = 2.49m,
            CaloriesPer100g = 567,
            Protein = 25.8f,
            Fat = 49.2f,
            Carbs = 16.1f,
            ImageUrl = "/resources/ingredients/ingredient_erdnuesse.png"
        };

        var almondFlakes = new Ingredient
        {
            Name = "Mandelblättchen",
            Price = 3.49m,
            CaloriesPer100g = 575,
            Protein = 21.2f,
            Fat = 49.4f,
            Carbs = 21.6f,
            ImageUrl = "/resources/ingredients/ingredient_mandelblaettchen.png"
        };

        var pineNuts = new Ingredient
        {
            Name = "Pinienkerne",
            Price = 5.99m,
            CaloriesPer100g = 673,
            Protein = 13.7f,
            Fat = 68.4f,
            Carbs = 13.1f,
            ImageUrl = "/resources/ingredients/ingredient_pinienkerne.png"
        };

        var peanutButter = new Ingredient
        {
            Name = "Erdnussbutter",
            Price = 3.49m,
            CaloriesPer100g = 588,
            Protein = 25.0f,
            Fat = 50.0f,
            Carbs = 20.0f,
            ImageUrl = "/resources/ingredients/ingredient_erdnussbutter.png"
        };

        var napaCabbage = new Ingredient
        {
            Name = "Chinakohl",
            Price = 1.99m,
            CaloriesPer100g = 16,
            Protein = 1.2f,
            Fat = 0.2f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_chinakohl.png"
        };

        var kidneyBeans = new Ingredient
        {
            Name = "Kidneybohnen",
            Price = 0.99m,
            CaloriesPer100g = 127,
            Protein = 8.7f,
            Fat = 0.5f,
            Carbs = 22.8f,
            ImageUrl = "/resources/ingredients/ingredient_kidneybohnen.png"
        };

        var celery = new Ingredient
        {
            Name = "Staudensellerie",
            Price = 1.49m,
            CaloriesPer100g = 14,
            Protein = 0.7f,
            Fat = 0.2f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_staudensellerie.png"
        };

        var chiliPepper = new Ingredient
        {
            Name = "Chilischote",
            Price = 0.50m,
            CaloriesPer100g = 40,
            Protein = 1.9f,
            Fat = 0.4f,
            Carbs = 8.8f,
            ImageUrl = "/resources/ingredients/ingredient_chilischote.png"
        };

        var sweetCorn = new Ingredient
        {
            Name = "Sonnenmais, Mais",
            Price = 1.29m,
            CaloriesPer100g = 86,
            Protein = 3.2f,
            Fat = 1.2f,
            Carbs = 19.0f,
            ImageUrl = "/resources/ingredients/ingredient_sonnenmais.png"
        };

        var sweetPotatoes = new Ingredient
        {
            Name = "Süßkartoffeln",
            Price = 2.99m,
            CaloriesPer100g = 86,
            Protein = 1.6f,
            Fat = 0.1f,
            Carbs = 20.1f,
            ImageUrl = "/resources/ingredients/ingredient_suesskartoffeln.png"
        };

        var potatoes = new Ingredient
        {
            Name = "Kartoffeln",
            Price = 1.49m,
            CaloriesPer100g = 77,
            Protein = 2.0f,
            Fat = 0.1f,
            Carbs = 17.6f,
            ImageUrl = "/resources/ingredients/ingredient_kartoffeln.png"
        };

        var kaffirLimeLeaves = new Ingredient
        {
            Name = "Kaffir-Limettenblätter",
            Price = 1.99m,
            CaloriesPer100g = 30,
            Protein = 1.0f,
            Fat = 0.5f,
            Carbs = 6.0f,
            ImageUrl = "/resources/ingredients/ingredient_kaffir_limettenblaetter.png"
        };

        var zucchini = new Ingredient
        {
            Name = "Zucchini",
            Price = 1.29m,
            CaloriesPer100g = 17,
            Protein = 1.2f,
            Fat = 0.3f,
            Carbs = 3.1f,
            ImageUrl = "/resources/ingredients/ingredient_zucchini.png"
        };

        var mediterraneanVegetableMix = new Ingredient
        {
            Name = "Mediterrane Gemüsepfanne",
            Price = 3.99m,
            CaloriesPer100g = 50,
            Protein = 1.5f,
            Fat = 2.0f,
            Carbs = 6.0f,
            ImageUrl = "/resources/ingredients/ingredient_mediterrane_gemuesepfanne.png"
        };

        var redLentils = new Ingredient
        {
            Name = "Rote Linsen",
            Price = 2.49m,
            CaloriesPer100g = 358,
            Protein = 25.8f,
            Fat = 1.1f,
            Carbs = 60.1f,
            ImageUrl = "/resources/ingredients/ingredient_rote_linsen.png"
        };

        var chickpeas = new Ingredient
        {
            Name = "Kichererbsen",
            Price = 1.99m,
            CaloriesPer100g = 164,
            Protein = 8.9f,
            Fat = 2.6f,
            Carbs = 27.4f,
            ImageUrl = "/resources/ingredients/ingredient_kichererbsen.png"
        };

        var peas = new Ingredient
        {
            Name = "Erbsen",
            Price = 1.49m,
            CaloriesPer100g = 81,
            Protein = 5.4f,
            Fat = 0.4f,
            Carbs = 14.5f,
            ImageUrl = "/resources/ingredients/ingredient_erbsen.png"
        };

        var eggplant = new Ingredient
        {
            Name = "Aubergine",
            Price = 1.99m,
            CaloriesPer100g = 25,
            Protein = 1.0f,
            Fat = 0.2f,
            Carbs = 5.9f,
            ImageUrl = "/resources/ingredients/ingredient_aubergine.png"
        };

        var leek = new Ingredient
        {
            Name = "Porree (Lauch)",
            Price = 1.49m,
            CaloriesPer100g = 61,
            Protein = 1.5f,
            Fat = 0.3f,
            Carbs = 14.2f,
            ImageUrl = "/resources/ingredients/ingredient_lauch.png"
        };

        var onion = new Ingredient
        {
            Name = "Zwiebel",
            Price = 0.99m,
            CaloriesPer100g = 40,
            Protein = 1.1f,
            Fat = 0.1f,
            Carbs = 9.3f,
            ImageUrl = "/resources/ingredients/ingredient_zwiebel.png"
        };

        var springOnion = new Ingredient
        {
            Name = "Frühlingszwiebel",
            Price = 1.29m,
            CaloriesPer100g = 32,
            Protein = 1.8f,
            Fat = 0.2f,
            Carbs = 7.3f,
            ImageUrl = "/resources/ingredients/ingredient_fruehlingszwiebel.png"
        };

        var redOnion = new Ingredient
        {
            Name = "Rote Zwiebel",
            Price = 1.49m,
            CaloriesPer100g = 40,
            Protein = 1.1f,
            Fat = 0.1f,
            Carbs = 9.3f,
            ImageUrl = "/resources/ingredients/ingredient_rote_zwiebel.png"
        };

        var cucumber = new Ingredient
        {
            Name = "Gurke",
            Price = 0.99m,
            CaloriesPer100g = 15,
            Protein = 0.7f,
            Fat = 0.1f,
            Carbs = 3.6f,
            ImageUrl = "/resources/ingredients/ingredient_gurke.png"
        };

        var icebergLettuce = new Ingredient
        {
            Name = "Eisbergsalat",
            Price = 1.29m,
            CaloriesPer100g = 14,
            Protein = 0.9f,
            Fat = 0.1f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_eisbergsalat.png"
        };

        var coleslaw = new Ingredient
        {
            Name = "Krautsalat",
            Price = 2.49m,
            CaloriesPer100g = 50,
            Protein = 1.0f,
            Fat = 2.5f,
            Carbs = 6.0f,
            ImageUrl = "/resources/ingredients/ingredient_krautsalat.png"
        };

        var romaineHeart = new Ingredient
        {
            Name = "Romana Salatherz",
            Price = 1.99m,
            CaloriesPer100g = 17,
            Protein = 1.2f,
            Fat = 0.3f,
            Carbs = 3.3f,
            ImageUrl = "/resources/ingredients/ingredient_romana_salatherz.png"
        };

        var pepperoni = new Ingredient
        {
            Name = "Peperoni",
            Price = 1.49m,
            CaloriesPer100g = 40,
            Protein = 1.9f,
            Fat = 0.4f,
            Carbs = 8.8f,
            ImageUrl = "/resources/ingredients/ingredient_peperoni.png"
        };

        var beefTomato = new Ingredient
        {
            Name = "Fleischtomate",
            Price = 1.99m,
            CaloriesPer100g = 18,
            Protein = 0.9f,
            Fat = 0.2f,
            Carbs = 3.9f,
            ImageUrl = "/resources/ingredients/ingredient_fleischtomate.png"
        };

        var cherryTomatoes = new Ingredient
        {
            Name = "Kirschtomaten",
            Price = 2.49m,
            CaloriesPer100g = 20,
            Protein = 0.9f,
            Fat = 0.2f,
            Carbs = 4.0f,
            ImageUrl = "/resources/ingredients/ingredient_kirschtomaten.png"
        };

        var driedTomatoes = new Ingredient
        {
            Name = "Getrocknete Tomaten",
            Price = 3.99m,
            CaloriesPer100g = 258,
            Protein = 14.1f,
            Fat = 3.0f,
            Carbs = 55.8f,
            ImageUrl = "/resources/ingredients/ingredient_getrocknete_tomaten.png"
        };

        var olives = new Ingredient
        {
            Name = "Oliven",
            Price = 2.99m,
            CaloriesPer100g = 115,
            Protein = 0.8f,
            Fat = 10.7f,
            Carbs = 6.3f,
            ImageUrl = "/resources/ingredients/ingredient_oliven.png"
        };

        var hokkaidoPumpkin = new Ingredient
        {
            Name = "Hokkaido Kürbis",
            Price = 3.49m,
            CaloriesPer100g = 26,
            Protein = 1.0f,
            Fat = 0.1f,
            Carbs = 6.5f,
            ImageUrl = "/resources/ingredients/ingredient_hokkaido_kuerbis.png"
        };

        var salt = new Ingredient
        {
            Name = "Salz",
            Price = 0.49m,
            CaloriesPer100g = 0,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_salz.png"
        };

        var pepper = new Ingredient
        {
            Name = "Pfeffer",
            Price = 1.99m,
            CaloriesPer100g = 251,
            Protein = 10.4f,
            Fat = 3.3f,
            Carbs = 64.8f,
            ImageUrl = "/resources/ingredients/ingredient_pfeffer.png"
        };

        var nutmeg = new Ingredient
        {
            Name = "Muskat",
            Price = 2.49m,
            CaloriesPer100g = 525,
            Protein = 5.8f,
            Fat = 36.3f,
            Carbs = 49.3f,
            ImageUrl = "/resources/ingredients/ingredient_muskat.png"
        };

        var seaSalt = new Ingredient
        {
            Name = "Meersalz",
            Price = 0.99m,
            CaloriesPer100g = 0,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_meersalz.png"
        };

        var gyrosSpice = new Ingredient
        {
            Name = "Gyrosgewürz",
            Price = 2.99m,
            CaloriesPer100g = 200,
            Protein = 8.0f,
            Fat = 5.0f,
            Carbs = 30.0f,
            ImageUrl = "/resources/ingredients/ingredient_gyrosgewuerz.png"
        };

        var dill = new Ingredient
        {
            Name = "Dill",
            Price = 1.49m,
            CaloriesPer100g = 43,
            Protein = 3.5f,
            Fat = 1.1f,
            Carbs = 7.0f,
            ImageUrl = "/resources/ingredients/ingredient_dill.png"
        };

        var cayennePepper = new Ingredient
        {
            Name = "Cayennepfeffer",
            Price = 2.49m,
            CaloriesPer100g = 318,
            Protein = 12.0f,
            Fat = 17.3f,
            Carbs = 56.6f,
            ImageUrl = "/resources/ingredients/ingredient_cayennepfeffer.png"
        };

        var curryPowder = new Ingredient
        {
            Name = "Currypulver",
            Price = 1.99m,
            CaloriesPer100g = 325,
            Protein = 14.0f,
            Fat = 14.0f,
            Carbs = 58.0f,
            ImageUrl = "/resources/ingredients/ingredient_currypulver.png"
        };

        var chiliPowder = new Ingredient
        {
            Name = "Chilipulver",
            Price = 2.49m,
            CaloriesPer100g = 282,
            Protein = 12.0f,
            Fat = 14.0f,
            Carbs = 50.0f,
            ImageUrl = "/resources/ingredients/ingredient_chilipulver.png"
        };

        var paprikaPowder = new Ingredient
        {
            Name = "Paprikapulver",
            Price = 1.99m,
            CaloriesPer100g = 282,
            Protein = 14.0f,
            Fat = 13.0f,
            Carbs = 54.0f,
            ImageUrl = "/resources/ingredients/ingredient_paprikapulver.png"
        };

        var cinnamon = new Ingredient
        {
            Name = "Zimt",
            Price = 2.49m,
            CaloriesPer100g = 247,
            Protein = 4.0f,
            Fat = 1.2f,
            Carbs = 81.0f,
            ImageUrl = "/resources/ingredients/ingredient_zimt.png"
        };

        var cuminPowder = new Ingredient
        {
            Name = "Kreuzkümmelpulver",
            Price = 2.99m,
            CaloriesPer100g = 375,
            Protein = 18.0f,
            Fat = 22.0f,
            Carbs = 44.0f,
            ImageUrl = "/resources/ingredients/ingredient_kreuzkuemmel.png"
        };

        var herbSalt = new Ingredient
        {
            Name = "Kräutersalz",
            Price = 1.99m,
            CaloriesPer100g = 0,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_kraeutersalz.png"
        };

        var mixedPepper = new Ingredient
        {
            Name = "Bunter Pfeffer",
            Price = 2.49m,
            CaloriesPer100g = 251,
            Protein = 10.4f,
            Fat = 3.3f,
            Carbs = 64.8f,
            ImageUrl = "/resources/ingredients/ingredient_bunter_pfeffer.png"
        };

        var sugar = new Ingredient
        {
            Name = "Zucker",
            Price = 0.89m,
            CaloriesPer100g = 387,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 100.0f,
            ImageUrl = "/resources/ingredients/ingredient_zucker.png"
        };

        var chineseSpice = new Ingredient
        {
            Name = "Chinagewürz",
            Price = 2.99m,
            CaloriesPer100g = 300,
            Protein = 10.0f,
            Fat = 5.0f,
            Carbs = 50.0f,
            ImageUrl = "/resources/ingredients/ingredient_chinagewuerz.png"
        };

        var formGrease = new Ingredient
        {
            Name = "Fett für die Form",
            Price = 0.99m,
            CaloriesPer100g = 900,
            Protein = 0.0f,
            Fat = 100.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_fett_fuer_die_form.png"
        };

        var oliveOil = new Ingredient
        {
            Name = "Olivenöl zum Braten",
            Price = 4.99m,
            CaloriesPer100g = 884,
            Protein = 0.0f,
            Fat = 100.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_olivenoel.png"
        };

        var oil = new Ingredient
        {
            Name = "Öl",
            Price = 1.99m,
            CaloriesPer100g = 884,
            Protein = 0.0f,
            Fat = 100.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_oel.png"
        };

        var rapeseedOil = new Ingredient
        {
            Name = "Rapsöl",
            Price = 2.49m,
            CaloriesPer100g = 884,
            Protein = 0.0f,
            Fat = 100.0f,
            Carbs = 0.0f,
            ImageUrl = "/resources/ingredients/ingredient_rapsoel.png"
        };

        var fishSauce = new Ingredient
        {
            Name = "Fischsauce",
            Price = 2.99m,
            CaloriesPer100g = 70,
            Protein = 10.0f,
            Fat = 0.0f,
            Carbs = 5.0f,
            ImageUrl = "/resources/ingredients/ingredient_fischsauce.png"
        };

        var vegetableBroth = new Ingredient
        {
            Name = "Gemüsebrühe",
            Price = 1.99m,
            CaloriesPer100g = 20,
            Protein = 1.0f,
            Fat = 0.0f,
            Carbs = 3.0f,
            ImageUrl = "/resources/ingredients/ingredient_gemuesebruehe.png"
        };

        var broth = new Ingredient
        {
            Name = "Brühe",
            Price = 1.49m,
            CaloriesPer100g = 15,
            Protein = 0.5f,
            Fat = 0.0f,
            Carbs = 2.5f,
            ImageUrl = "/resources/ingredients/ingredient_bruehe.png"
        };

        var rawCaneSugar = new Ingredient
        {
            Name = "Rohrohrzucker",
            Price = 1.99m,
            CaloriesPer100g = 387,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 100.0f,
            ImageUrl = "/resources/ingredients/ingredient_rohrohrzucker.png"
        };

        var redCurryPaste = new Ingredient
        {
            Name = "Rote Currypaste",
            Price = 2.49m,
            CaloriesPer100g = 200,
            Protein = 3.0f,
            Fat = 10.0f,
            Carbs = 25.0f,
            ImageUrl = "/resources/ingredients/ingredient_rote_currypaste.png"
        };

        var saladMayonnaise = new Ingredient
        {
            Name = "Salatmayonnaise",
            Price = 1.99m,
            CaloriesPer100g = 680,
            Protein = 1.0f,
            Fat = 75.0f,
            Carbs = 2.0f,
            ImageUrl = "/resources/ingredients/ingredient_salatmayonnaise.png"
        };

        var sambalOelek = new Ingredient
        {
            Name = "Sambal Oelek",
            Price = 2.49m,
            CaloriesPer100g = 100,
            Protein = 2.0f,
            Fat = 0.5f,
            Carbs = 20.0f,
            ImageUrl = "/resources/ingredients/ingredient_sambal_oelek.png"
        };

        var whiteWineVinegar = new Ingredient
        {
            Name = "Weißweinessig",
            Price = 1.49m,
            CaloriesPer100g = 20,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 0.5f,
            ImageUrl = "/resources/ingredients/ingredient_weissweinessig.png"
        };

        var lightBalsamicVinegar = new Ingredient
        {
            Name = "Heller Balsamico-Essig",
            Price = 2.49m,
            CaloriesPer100g = 88,
            Protein = 0.5f,
            Fat = 0.0f,
            Carbs = 17.0f,
            ImageUrl = "/resources/ingredients/ingredient_heller_balsamico.png"
        };

        var vinegar = new Ingredient
        {
            Name = "Essig",
            Price = 0.99m,
            CaloriesPer100g = 20,
            Protein = 0.0f,
            Fat = 0.0f,
            Carbs = 0.5f,
            ImageUrl = "/resources/ingredients/ingredient_essig.png"
        };

        var tahini = new Ingredient
        {
            Name = "Tahini",
            Price = 3.99m,
            CaloriesPer100g = 595,
            Protein = 17.0f,
            Fat = 54.0f,
            Carbs = 21.0f,
            ImageUrl = "/resources/ingredients/ingredient_tahini.png"
        };

        var lightBalsamicCream = new Ingredient
        {
            Name = "Balsamico Creme hell",
            Price = 2.99m,
            CaloriesPer100g = 150,
            Protein = 0.5f,
            Fat = 0.0f,
            Carbs = 35.0f,
            ImageUrl = "/resources/ingredients/ingredient_balsamico_creme_hell.png"
        };

        var tabasco = new Ingredient
        {
            Name = "Tabasco",
            Price = 2.49m,
            CaloriesPer100g = 12,
            Protein = 0.9f,
            Fat = 0.2f,
            Carbs = 1.3f,
            ImageUrl = "/resources/ingredients/ingredient_tabasco.png"
        };

        var tomatoPaste = new Ingredient
        {
            Name = "Tomatenmark",
            Price = 1.29m,
            CaloriesPer100g = 82,
            Protein = 4.8f,
            Fat = 0.5f,
            Carbs = 14.0f,
            ImageUrl = "/resources/ingredients/ingredient_tomatenmark.png"
        };

        var coriander = new Ingredient
        {
            Name = "Koriander",
            Price = 1.49m,
            CaloriesPer100g = 23,
            Protein = 2.1f,
            Fat = 0.5f,
            Carbs = 3.7f,
            ImageUrl = "/resources/ingredients/ingredient_koriander.png"
        };

        var chives = new Ingredient
        {
            Name = "Schnittlauch",
            Price = 1.29m,
            CaloriesPer100g = 30,
            Protein = 3.3f,
            Fat = 0.7f,
            Carbs = 4.4f,
            ImageUrl = "/resources/ingredients/ingredient_schnittlauch.png"
        };

        var cress = new Ingredient
        {
            Name = "Kresse",
            Price = 1.49m,
            CaloriesPer100g = 32,
            Protein = 2.6f,
            Fat = 0.7f,
            Carbs = 4.4f,
            ImageUrl = "/resources/ingredients/ingredient_kresse.png"
        };

        var thyme = new Ingredient
        {
            Name = "Thymian",
            Price = 1.99m,
            CaloriesPer100g = 101,
            Protein = 5.6f,
            Fat = 1.7f,
            Carbs = 24.5f,
            ImageUrl = "/resources/ingredients/ingredient_thymian.png"
        };

        var basil = new Ingredient
        {
            Name = "Basilikum",
            Price = 1.49m,
            CaloriesPer100g = 23,
            Protein = 3.2f,
            Fat = 0.6f,
            Carbs = 2.7f,
            ImageUrl = "/resources/ingredients/ingredient_basilikum.png"
        };

        var rosemary = new Ingredient
        {
            Name = "Rosmarin",
            Price = 1.99m,
            CaloriesPer100g = 131,
            Protein = 3.3f,
            Fat = 5.9f,
            Carbs = 20.7f,
            ImageUrl = "/resources/ingredients/ingredient_rosmarin.png"
        };

        var sage = new Ingredient
        {
            Name = "Salbei",
            Price = 1.99m,
            CaloriesPer100g = 315,
            Protein = 10.6f,
            Fat = 12.8f,
            Carbs = 60.7f,
            ImageUrl = "/resources/ingredients/ingredient_salbei.png"
        };

        var lavenderBlossoms = new Ingredient
        {
            Name = "Lavendelblüten",
            Price = 3.49m,
            CaloriesPer100g = 49,
            Protein = 3.3f,
            Fat = 0.7f,
            Carbs = 8.0f,
            ImageUrl = "/resources/ingredients/ingredient_lavendelblueten.png"
        };

        db.Ingredients.AddRange(rice, broccoli, tofu, bellPepper, carrots, garlic, ginger, soySauce, sesame, mapleSyrup, eggs, mustard, honey, longGrainRice, quinoa, greenPesto, groundBeef, smokedSalmon, salmonFillet, dicedHam, cookedHam, chickenBreast, chickenMeat, fetaCheese, parmesan, gouda, cottageCheese, gruyere, cremeFraiche, cremeLegere, butter, sourCream, milk, coconutMilk, tzatziki, cream, greekYogurt, coconutYogurt, plainYogurt, lowFatQuark, oats, wheatFlour, freshDoughRolls, pumpernickel, tortillas, tempeh, wholeGrainPasta, mieNoodles, flaxseed, almonds, pumpkinSeeds, peanuts, almondFlakes, pineNuts, peanutButter, napaCabbage, kidneyBeans, celery, chiliPepper, sweetCorn, sweetPotatoes, potatoes, kaffirLimeLeaves, zucchini, mediterraneanVegetableMix, redLentils, chickpeas, peas, eggplant, leek, onion, springOnion, redOnion, icebergLettuce, coleslaw, romaineHeart, pepperoni, beefTomato, cherryTomatoes, driedTomatoes, olives, hokkaidoPumpkin, salt, pepper, nutmeg, seaSalt, gyrosSpice, dill, cayennePepper, curryPowder, chiliPowder, paprikaPowder, cinnamon, cuminPowder, herbSalt, mixedPepper, sugar, chineseSpice, formGrease, oliveOil, oil, rapeseedOil, fishSauce, vegetableBroth, broth, soySauce, rawCaneSugar, redCurryPaste, saladMayonnaise, sambalOelek, whiteWineVinegar, lightBalsamicVinegar, vinegar, tahini, lightBalsamicCream, tabasco, tomatoPaste, coriander, chives, cress, thyme, basil, rosemary, sage, lavenderBlossoms);

        var vegan = new Category { Name = "Vegan" };
        var vegetarian = new Category { Name = "Vegetarisch" };

        db.Categories.AddRange(vegan, vegetarian);

        db.SaveChanges();

        var recipe1 = new Recipe
        {
            Name = "Griechischer Schichtsalat",
            Description = "Ein leckerer Schichtsalat mit griechischen Zutaten.",
            Instructions = "1. Hackfleisch mit Gyrosgewürz mischen, in Olivenöl anbraten und abkühlen lassen.\n" +
                           "2. In großer Schüssel Hälfte des Eissalates als unterste Schicht legen.\n" +
                           "3. Darauf Hälfte des abgekühlten Hackfleisches und Hälfte des Tzatziki verteilen.\n" +
                           "4. Schichtweise Peperoni, eine Lage Zwiebelringe, Tomatenwürfel, Gurkenstücke, Mais, Paprikawürfel, Krautsalat, Fetawürfel verteilen.\n" +
                           "5. Zweite Schicht Eissalat, Hackfleisch, klein geschnittene Peperoni darauf verteilen.\n" +
                           "6. Zum Abschluss den Tzatziki und die Oliven (ohne Stein) verteilen.\n" +
                           "7. Salat in der verschlossenen Schüssel im Kühlschrank mindestens für 6 Stunden durchziehen lassen.\n" +
                           "8. Salat entweder vor dem Servieren durchmischen oder abstechen.",
            PortionCount = 8,
            Difficulty = RecipeDifficulty.Medium,
            CaloriesPerServing = 377,
            ImageUrl = "/resources/recipes/recipe_griechischer_schichtsalat.png",
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { Ingredient = groundBeef, Quantity = 400, Unit = "g" },
                new RecipeIngredient { Ingredient = oliveOil, Quantity = 20, Unit = "ml" }, // Approximation for "etwas"
                new RecipeIngredient { Ingredient = gyrosSpice, Quantity = 10, Unit = "g" }, // Approximation
                new RecipeIngredient { Ingredient = icebergLettuce, Quantity = 150, Unit = "g" }, // Approximation for ½ Kopf
                new RecipeIngredient { Ingredient = onion, Quantity = 1, Unit = "Stück" },
                new RecipeIngredient { Ingredient = beefTomato, Quantity = 3, Unit = "Stück" },
                new RecipeIngredient { Ingredient = cucumber, Quantity = 150, Unit = "g" }, // Approximation for ½ Gurke
                new RecipeIngredient { Ingredient = sweetCorn, Quantity = 70, Unit = "g" }, // Approximation for ½ Dose
                new RecipeIngredient { Ingredient = bellPepper, Quantity = 1, Unit = "Stück" },
                new RecipeIngredient { Ingredient = coleslaw, Quantity = 200, Unit = "g" },
                new RecipeIngredient { Ingredient = fetaCheese, Quantity = 200, Unit = "g" },
                new RecipeIngredient { Ingredient = pepperoni, Quantity = 1, Unit = "Glas" },
                new RecipeIngredient { Ingredient = tzatziki, Quantity = 500, Unit = "g" },
                new RecipeIngredient { Ingredient = olives, Quantity = 1, Unit = "Dose" }
            }
        };

        db.Recipes.Add(recipe1);

        // Rezept 2: Vegetarische Gemüsepfanne
        var recipe2 = new Recipe
        {
            Name = "Vegetarische Gemüsepfanne",
            Description = "Eine bunte Gemüsepfanne mit frischen Zutaten.",
            Instructions = "Gemüse klein schneiden. In einer Pfanne mit etwas Öl anbraten. Mit Salz und Pfeffer abschmecken.",
            PortionCount = 2,
            Difficulty = RecipeDifficulty.Easy,
            CaloriesPerServing = 350,
            ImageUrl = "/resources/recipes/recipe_gemuesepfanne.png",
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { Ingredient = broccoli, Quantity = 200, Unit = "g" },
                new RecipeIngredient { Ingredient = bellPepper, Quantity = 150, Unit = "g" }
            },
            Categories = new List<RecipeCategory>
            {
                new RecipeCategory { Category = vegetarian }
            }
        };

        // Rezept 3: Tofu-Curry
        var recipe3 = new Recipe
        {
            Name = "Tofu-Curry",
            Description = "Ein würziges Curry mit Tofu und Gemüse.",
            Instructions = "Tofu würfeln und anbraten. Gemüse schneiden und in einer Pfanne mit Curry-Paste anbraten. Kokosmilch hinzufügen und köcheln lassen.",
            PortionCount = 3,
            Difficulty = RecipeDifficulty.Medium,
            CaloriesPerServing = 520,
            ImageUrl = "/resources/recipes/recipe_tofu_curry.png",
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { Ingredient = tofu, Quantity = 300, Unit = "g" },
                new RecipeIngredient { Ingredient = bellPepper, Quantity = 200, Unit = "g" }
            },
            Categories = new List<RecipeCategory>
            {
                new RecipeCategory { Category = vegan }
            }
        };

        db.Recipes.AddRange(recipe2, recipe3);

        db.SaveChanges();
    }
}
