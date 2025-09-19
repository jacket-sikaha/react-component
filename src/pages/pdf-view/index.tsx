import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { useEffect } from 'react';
function PDFViewer({ url = 'https://xxxx.com/xxxx.pdf' }) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/legacy/build/pdf.worker.min.js`;
  useEffect(() => {
    console.log('-----------------');
    const viewer = document.getElementById('pdf-canvas');
    pdfjsLib.getDocument(url).promise.then(function (pdf) {
      console.log('pdf.numPages:', pdf.numPages);
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(function (page) {
          const scale = 1.5;
          const viewport = page.getViewport({ scale: scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          viewer?.appendChild(canvas);

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          page.render(renderContext);
        });
      }
    });
  }, []);

  return <div id="pdf-canvas" className="w-screen h-screen"></div>;
}

export default PDFViewer;
