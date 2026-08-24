interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && (
        <p
          className={`text-xs uppercase tracking-wider-3 mb-4 ${
            light ? 'text-ink-300' : 'text-rose-500'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-display leading-[1.15] text-balance ${
          light ? 'text-cream-50' : 'text-ink-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-base sm:text-lg leading-relaxed ${
            light ? 'text-ink-300' : 'text-ink-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
