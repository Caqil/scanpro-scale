'use client'
import dynamic from 'next/dynamic'

// Import react-pdf components with dynamic import
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
})

const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false,
})

import { useState } from 'react'

export default function PDFViewer() {
  const [numPages, setNumPages] = useState(null)
  
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  return (
    <div>
      <Document
        file="/sample.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  )
}