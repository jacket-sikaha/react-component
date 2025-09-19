import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import * as PdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import { useEffect } from 'react';
function PDFViewer({
  url = 'https://linkjob-pub.oss-cn-shenzhen.aliyuncs.com/product-manual/100001/68b28873-8bca-4669-88b6-bdd43f01a75a.pdf'
}) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.93/legacy/build/pdf.worker.mjs`;
  console.log('url:', PdfWorker);
  window.pdfjsWorker = PdfWorker;
  useEffect(() => {
    console.log('-----------------');
    const viewer = document.getElementById('pdf-canvas');
    pdfjsLib.getDocument(url).promise.then(function (pdf) {
      console.log('pdf.numPages:', pdf.numPages);
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(function (page) {
          const scale = 0.1;
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
