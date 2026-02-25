import { useState } from 'react'

const DEFAULT_TEXT = `hello, welcome to mattOS!

This is an experimental playground I'm building with ClaudeCode.

It's just for fun :~)`

export default function TextEdit() {
  const [text, setText] = useState(DEFAULT_TEXT)

  return (
    <div className="textedit">
      <div className="textedit-toolbar">
        <button className="textedit-toolbar-btn" title="Bold">
          <strong>B</strong>
        </button>
        <button className="textedit-toolbar-btn" title="Italic">
          <em>I</em>
        </button>
        <button className="textedit-toolbar-btn" title="Underline">
          <u>U</u>
        </button>
      </div>
      <textarea
        className="textedit-area"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  )
}
