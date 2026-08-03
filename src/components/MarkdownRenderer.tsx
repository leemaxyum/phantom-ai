import { memo, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { useToast } from '../context/ToastContext'

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    showToast('Code copied', 'success')
    setTimeout(() => setCopied(false), 2000)
  }, [children, showToast])

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded-md bg-neutral-800/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
        title="Copy code"
      >
        {copied ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          fontSize: '0.85em',
          background: '#0d0d0d',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

function MarkdownRendererInner({ content }: { content: string }) {
  return (
    <div className="prose-phantom max-w-none text-neutral-200">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeString = String(children).replace(/\n$/, '')

            if (match) {
              return <CodeBlock language={match[1]}>{codeString}</CodeBlock>
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownRenderer = memo(MarkdownRendererInner)
