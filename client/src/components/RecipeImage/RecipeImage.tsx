import { getImageUrl } from "../../utils/getImageUrl";

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

function RecipeImage({ src, alt, className }: Props) {
  const fallbackSrc = getImageUrl("/fallback.png");

  return (
    <img
      src={getImageUrl(src)}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = fallbackSrc;
      }}
    />
  );
}

export default RecipeImage;
