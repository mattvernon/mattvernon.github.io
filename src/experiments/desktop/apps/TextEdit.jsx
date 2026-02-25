import { useState } from 'react'

export default function TextEdit() {
  const [text, setText] = useState('')

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
