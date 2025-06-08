import { useEffect } from 'react'

import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Paper, Box, IconButton, Divider, Typography } from '@mui/material'

// Custom extension to handle variable highlighting
const VariableHighlight = Extension.create({
  name: 'variableHighlight',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          isVariable: {
            default: false,
            parseHTML: element => element.hasAttribute('data-variable'),
            renderHTML: attributes => {
              if (!attributes.isVariable) return {}

              return {
                'data-variable': 'true',
                class: 'variable ' + (attributes.isVariable === 'unfilled' ? 'unfilled-variable' : 'filled-variable')
              }
            }
          }
        }
      }
    ]
  }
})

interface CertificateEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
  label?: string
  templateVariables?: Record<string, any>
}

const CertificateEditor: React.FC<CertificateEditorProps> = ({
  content,
  onChange,
  readOnly = false,
  label,
  templateVariables = {}
}) => {
  // Process content to ensure all variables are visible and properly highlighted
  const processContent = (text: string) => {
    // First, find all variables in the template
    const allVariables = new Set<string>()
    const variableRegex = /{{([^}]+)}}/g
    let match

    while ((match = variableRegex.exec(text)) !== null) {
      allVariables.add(match[1])
    }

    // Process each paragraph
    return text
      .split('\n')
      .map(paragraph => {
        if (!paragraph.trim()) return paragraph

        // Handle signature line
        if (paragraph.includes('___________________________')) {
          return paragraph
        }

        let result = ''
        let lastIndex = 0

        // Find all variables in this paragraph
        const matches = Array.from(paragraph.matchAll(variableRegex))

        // If no variables in this paragraph, return as is
        if (matches.length === 0) return paragraph

        // Process each variable in the paragraph
        matches.forEach(match => {
          const variableName = match[1]

          const isFilled =
            templateVariables[variableName] !== undefined &&
            templateVariables[variableName] !== null &&
            templateVariables[variableName] !== ''

          // Add text before the variable
          result += paragraph.slice(lastIndex, match.index)

          // Add the variable with appropriate styling
          result += `<span data-variable="${isFilled ? 'filled' : 'unfilled'}">${match[0]}</span>`

          lastIndex = match.index + match[0].length
        })

        // Add any remaining text
        result += paragraph.slice(lastIndex)

        return result
      })
      .join('\n')
  }

  // Convert HTML content to plain text with proper newlines and variable highlighting
  const convertToPlainText = (html: string) => {
    const div = document.createElement('div')

    div.innerHTML = html

    const processedContent = Array.from(div.getElementsByTagName('p'))
      .map(p => {
        // Handle empty paragraphs
        if (!p.textContent?.trim()) return '\n'

        // Process the paragraph content
        return processContent(p.textContent.trim())
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim()

    return processedContent
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable some features we don't need
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: false
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph']
      }),
      VariableHighlight
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const plainText = convertToPlainText(editor.getHTML())

      onChange(plainText)
    }
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // Only update if the content has actually changed
      const currentContent = convertToPlainText(editor.getHTML())

      if (currentContent !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor, templateVariables])

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

  if (!editor) {
    return null
  }

  const MenuBar = () => {
    if (readOnly) return null

    return (
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title='Bold'
        >
          <i className='tabler-bold' />
        </IconButton>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title='Italic'
        >
          <i className='tabler-italic' />
        </IconButton>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title='Underline'
        >
          <i className='tabler-underline' />
        </IconButton>
        <Divider orientation='vertical' flexItem />
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title='Bullet List'
        >
          <i className='tabler-list' />
        </IconButton>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title='Numbered List'
        >
          <i className='tabler-list-numbers' />
        </IconButton>
        <Divider orientation='vertical' flexItem />
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title='Align Left'
        >
          <i className='tabler-align-left' />
        </IconButton>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title='Align Center'
        >
          <i className='tabler-align-center' />
        </IconButton>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title='Align Right'
        >
          <i className='tabler-align-right' />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box>
      {label && (
        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          {label}
        </Typography>
      )}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          '& .ProseMirror': {
            minHeight: '300px',
            outline: 'none',
            p: 3,
            '& p': {
              margin: '0.5em 0',
              fontSize: '1rem',
              lineHeight: 1.6
            },
            '& ul, & ol': {
              paddingLeft: '1.5em'
            },
            '&:focus': {
              outline: 'none'
            },
            '& .variable': {
              padding: '0 2px',
              borderRadius: '2px',
              fontWeight: 500,
              display: 'inline-block',
              minWidth: '1em',
              textAlign: 'center'
            },
            '& .unfilled-variable': {
              color: 'error.main',
              backgroundColor: 'error.lighter',
              border: '1px dashed',
              borderColor: 'error.main'
            },
            '& .filled-variable': {
              color: 'success.main',
              backgroundColor: 'success.lighter',
              border: '1px solid',
              borderColor: 'success.main'
            }
          },
          '& .ProseMirror-focused': {
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 1
          },
          '& .is-active': {
            bgcolor: 'action.selected'
          }
        }}
      >
        <MenuBar />
        <EditorContent editor={editor} />
      </Paper>
    </Box>
  )
}

export default CertificateEditor
