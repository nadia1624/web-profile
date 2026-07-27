import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

// Premium Google Fonts
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Nadia Deari Hanifah - Portfolio CMS',
    default: 'Nadia Deari Hanifah | Information Systems & Enterprise Architecture Portfolio',
  },
  description:
    'Professional portfolio of Nadia Deari Hanifah, Information Systems student at Universitas Andalas and Secretary of Laboratory of Enterprise Application. Specialized in Systems Analysis, BPMN/UML process modeling, and Full-stack Web Development.',
  keywords: [
    'Nadia Deari Hanifah',
    'Universitas Andalas',
    'Information Systems',
    'Enterprise Application Laboratory',
    'LEA UNAND',
    'BPMN 2.0',
    'UML Modeling',
    'Systems Analyst',
    'Web Developer',
    'Full-stack Portfolio',
  ],
  authors: [{ name: 'Nadia Deari Hanifah' }],
  creator: 'Nadia Deari Hanifah',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased text-foreground bg-background min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
