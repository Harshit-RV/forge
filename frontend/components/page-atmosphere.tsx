/** Soft atmospheric backdrop shared by signed-in pages and auth. */
export function PageAtmosphere({
  intensity = "soft",
}: {
  intensity?: "soft" | "full";
}) {
  const opacity =
    intensity === "full"
      ? "opacity-100"
      : "opacity-70 dark:opacity-50";

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 landing-atmosphere ${opacity}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 landing-grid ${
          intensity === "full"
            ? "opacity-[0.35] dark:opacity-[0.22]"
            : "opacity-[0.22] dark:opacity-[0.14]"
        }`}
      />
    </>
  );
}
