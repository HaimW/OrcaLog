"use client";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ value, onChange, readOnly, size = "md" }: StarRatingProps) {
  const sizeClass = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-2xl";
  return (
    <div className={`inline-flex ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`${n <= value ? "text-yellow-400" : "text-gray-300"} ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
