import type { ReactNode } from 'react';

interface SocialLink {
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
}

const TwitterIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2H21.5l-7.39 8.444L22.75 22h-6.82l-5.34-6.98L4.65 22H1.39l7.905-9.033L1.25 2h6.98l4.83 6.39L18.244 2Zm-1.2 18h1.87L7.05 4H5.07l11.974 16Z" />
  </svg>
);

const LinkedInIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm7 0h3.84v1.5h.05c.54-.95 1.86-1.95 3.82-1.95 4.09 0 4.85 2.53 4.85 5.82v5.63h-4v-5c0-1.19-.02-2.73-1.8-2.73-1.8 0-2.08 1.3-2.08 2.65v5.08h-4v-11Z" />
  </svg>
);

const LINKS: SocialLink[] = [
  {
    href: 'https://x.com/tabXport',
    label: 'TableXport on X',
    icon: TwitterIcon,
  },
  {
    href: 'https://www.linkedin.com/in/artem-k-3392b3366/',
    label: 'LinkedIn profile',
    icon: LinkedInIcon,
  },
];

export const SocialLinks = () => (
  <div className="flex shrink-0 items-center gap-1.5">
    {LINKS.map((link) => (
      <a
        key={link.href}
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={link.label}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-brand-light text-brand-dark/70 transition-colors hover:border-brand hover:text-brand"
      >
        {link.icon}
      </a>
    ))}
  </div>
);
