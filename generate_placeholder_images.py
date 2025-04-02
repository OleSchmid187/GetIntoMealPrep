from PIL import Image
import os

# Define the folder paths
base_folder = r"c:\Users\olesc\OneDrive\Desktop\GetIntoMealPrep\GetIntoMealPrepAPI\Resources"
ingredients_folder = os.path.join(base_folder, "ingredients")

# Ensure the ingredients folder exists
os.makedirs(ingredients_folder, exist_ok=True)

# List of ingredient filenames
ingredient_files = [
    "ingredient_brokkoli.png",
    "ingredient_paprika.png",
    "ingredient_reis.png",
    "ingredient_tofu.png",
    "ingredient_erdnussbutter.png",
    "ingredient_chinakohl.png",
    "ingredient_kidneybohnen.png",
    "ingredient_staudensellerie.png",
    "ingredient_chilischote.png",
    "ingredient_sonnenmais.png",
    "ingredient_suesskartoffeln.png",
    "ingredient_kartoffeln.png",
    "ingredient_kaffir_limettenblaetter.png",
    "ingredient_zucchini.png",
    "ingredient_mediterrane_gemuesepfanne.png",
    "ingredient_rote_linsen.png",
    "ingredient_kichererbsen.png",
    "ingredient_erbsen.png",
    "ingredient_aubergine.png",
    "ingredient_lauch.png",
    "ingredient_zwiebel.png",
    "ingredient_fruehlingszwiebel.png",
    "ingredient_rote_zwiebel.png",
    "ingredient_gurke.png",
    "ingredient_eisbergsalat.png",
    "ingredient_krautsalat.png",
    "ingredient_romana_salatherz.png",
    "ingredient_peperoni.png",
    "ingredient_fleischtomate.png",
    "ingredient_kirschtomaten.png",
    "ingredient_getrocknete_tomaten.png",
    "ingredient_oliven.png",
    "ingredient_hokkaido_kuerbis.png",
    "ingredient_salz.png",
    "ingredient_pfeffer.png",
    "ingredient_muskat.png",
    "ingredient_meersalz.png",
    "ingredient_gyrosgewuerz.png",
    "ingredient_dill.png",
    "ingredient_cayennepfeffer.png",
    "ingredient_currypulver.png",
    "ingredient_chilipulver.png",
    "ingredient_paprikapulver.png",
    "ingredient_zimt.png",
    "ingredient_kreuzkuemmel.png",
    "ingredient_kraeutersalz.png",
    "ingredient_bunter_pfeffer.png",
    "ingredient_zucker.png",
    "ingredient_chinagewuerz.png",
    "ingredient_fett_fuer_die_form.png",
    "ingredient_olivenoel.png",
    "ingredient_oel.png",
    "ingredient_rapsoel.png",
    "ingredient_fischsauce.png",
    "ingredient_gemuesebruehe.png",
    "ingredient_bruehe.png",
    "ingredient_rohrohrzucker.png",
    "ingredient_rote_currypaste.png",
    "ingredient_salatmayonnaise.png",
    "ingredient_sambal_oelek.png",
    "ingredient_weissweinessig.png",
    "ingredient_heller_balsamico.png",
    "ingredient_essig.png",
    "ingredient_tahini.png",
    "ingredient_balsamico_creme_hell.png",
    "ingredient_tabasco.png",
    "ingredient_tomatenmark.png",
    "ingredient_koriander.png",
    "ingredient_schnittlauch.png",
    "ingredient_kresse.png",
    "ingredient_thymian.png",
    "ingredient_basilikum.png",
    "ingredient_rosmarin.png",
    "ingredient_salbei.png",
    "ingredient_lavendelblueten.png"
]

# Create a black image with 1080x720 resolution
image_size = (1080, 720)
black_image = Image.new("RGB", image_size, "black")

# Generate placeholder images
for filename in ingredient_files:
    file_path = os.path.join(ingredients_folder, filename)
    black_image.save(file_path)

print(f"Placeholder images created in {ingredients_folder}")