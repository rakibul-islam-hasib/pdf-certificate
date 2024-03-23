# Best pdf certificate generator 
[demo](https://certificate-generator.netlify.app/)


### Here a demo code for react 


- Step -1  
Create PDF saver

```javascript
import { PDFDocument,  rgb, degrees } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit';


const generatePDF = async (name) => {
    const existingPdfBytes = await fetch("Certificate.pdf").then((res) =>
        res.arrayBuffer()
    );

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);


    //get font
    const fontBytes = await fetch("Sloop-Script-Regular.ttf").then((res) =>
        res.arrayBuffer()
    );
    // Embed our custom font in the document
    const SanChezFont = await pdfDoc.embedFont(fontBytes);
    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Calculate the width of the text
    const textWidth = SanChezFont.widthOfTextAtSize(name, 58);

    // Calculate the x-coordinate to horizontally center the text
    const pageWidth = firstPage.getWidth();
    const centerX = (pageWidth - textWidth) / 2;

    // Draw the text horizontally centered
    firstPage.drawText(name, {
        x: centerX,
        y: 270,
        size: 58,
        font: SanChezFont,
        color: rgb(0.2, 0.84, 0.67),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    saveAs(pdfDataUri, "newcertificate.pdf")
};
```

- Step - 2

Create a file saver component in utils folder to save file

```javascript
// FileSaver.js

// The one and only way of getting global scope in all environments
const _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;

function bom(blob, opts) {
  if (typeof opts === 'undefined') opts = {
    autoBom: false
  }; else if (typeof opts !== 'object') {
    console.warn('Deprecated: Expected third argument to be a object');
    opts = {
      autoBom: !opts
    };
  }
  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
    return new Blob([String.fromCharCode(0xFEFF), blob], {
      type: blob.type
    });
  }
  return blob;
}

function download(url, name, opts) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';

  xhr.onload = function () {
    saveAs(xhr.response, name, opts);
  };

  xhr.onerror = function () {
    console.error('could not download file');
  };

  xhr.send();
}

function corsEnabled(url) {
  const xhr = new XMLHttpRequest(); // use sync to avoid popup blocker
  xhr.open('HEAD', url, false);
  try {
    xhr.send();
  // eslint-disable-next-line no-empty
  } catch (e) {}
  return xhr.status >= 200 && xhr.status <= 299;
}

function click(node) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
    node.dispatchEvent(evt);
  }
}

const isMacOSWebView = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);

const saveAs = _global.saveAs || ((typeof window !== 'object' || window !== _global) ?
  function saveAs() {} :
  'download' in HTMLAnchorElement.prototype && !isMacOSWebView ?
  function saveAs(blob, name, opts) {
    const URL = _global.URL || _global.webkitURL;
    const a = document.createElement('a');
    name = name || blob.name || 'download';
    a.download = name;
    a.rel = 'noopener'; // tabnabbing
    if (typeof blob === 'string') {
      a.href = blob;
      if (a.origin !== location.origin) {
        corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
      }, 4E4); // 40s
      setTimeout(function () {
        click(a);
      }, 0);
    }
  } :
  'msSaveOrOpenBlob' in navigator ?
  function saveAs(blob, name, opts) {
    name = name || blob.name || 'download';
    if (typeof blob === 'string') {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement('a');
        a.href = blob;
        a.target = '_blank';
        setTimeout(function () {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  } :
  function saveAs(blob, name, opts, popup) {
    popup = popup || open('', '_blank');
    if (popup) {
      popup.document.title = popup.document.body.innerText = 'downloading...';
    }
    if (typeof blob === 'string') return download(blob, name, opts);
    const force = blob.type === 'application/octet-stream';
    const isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onloadend = function () {
        let url = reader.result;
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
        if (popup) popup.location.href = url;
        else location = url;
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const URL = _global.URL || _global.webkitURL;
      const url = URL.createObjectURL(blob);
      if (popup) popup.location = url;
      else location.href = url;
      popup = null;
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4E4); // 40s
    }
  });

_global.saveAs = saveAs.saveAs = saveAs;

// Export saveAs function for others to use
export default saveAs;

```