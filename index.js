console.log("hello")
const userName = document.getElementById("name");
const submitBtn = document.getElementById("submitBtn");
const { PDFDocument, rgb, degrees } = PDFLib;


submitBtn.addEventListener("click", () => {
    const val = userName.value;
    if (val.trim() !== "" && userName.checkValidity()) {
        // console.log(val);
        generatePDF(val);
    } else {
        userName.reportValidity();
    }
});
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