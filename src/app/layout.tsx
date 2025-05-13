import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trợ lý Lý thuyết Thông tin',
  description: 'Chatbot trả lời câu hỏi về Lý thuyết Thông tin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <Script
          id="mathjax-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                  displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                  processEscapes: true,
                  processEnvironments: true
                },
                options: {
                  ignoreHtmlClass: 'no-mathjax',
                  processHtmlClass: 'math-content',
                  renderActions: {
                    findScript: [10, function (doc) {
                      for (const node of document.querySelectorAll('script[type^="math/tex"]')) {
                        const display = !!node.type.match(/; *mode=display/);
                        const math = new doc.options.MathItem(
                          node.textContent,
                          doc.inputJax[0],
                          display
                        );
                        const text = document.createTextNode('');
                        node.parentNode.replaceChild(text, node);
                        math.start = {node: text, delim: '', n: 0};
                        math.end = {node: text, delim: '', n: 0};
                        doc.math.push(math);
                      }
                    }, '']
                  }
                },
                startup: {
                  ready: () => {
                    MathJax.startup.defaultReady();
                  }
                }
              };
            `
          }}
        />
        <Script 
          id="mathjax-cdn" 
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" 
          strategy="afterInteractive"
          async
        />
      </head>
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  )
} 