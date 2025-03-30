// actions/generate-pdf.js
import puppeteer from 'puppeteer';

export const generatePDF = async (htmlContent) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content with proper styling
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF with proper margins and format
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      scale: 0.9 // Slightly reduce scale to prevent clipping
    });

    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};


// // for vercel only 
// // actions/generate-pdf.js
// import puppeteer from 'puppeteer-core';
// import chromium from '@sparticuz/chromium';

// export const generatePDF = async (htmlContent) => {
//   let browser;
//   try {
//     browser = await puppeteer.launch({
//       args: chromium.args,
//       executablePath: await chromium.executablePath(),
//       headless: chromium.headless,
//     });

//     const page = await browser.newPage();
//     await page.setContent(htmlContent);
    
//     return await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: {
//         top: '20mm',
//         right: '20mm',
//         bottom: '20mm',
//         left: '20mm'
//       },
//       scale: 0.9
//     });
//   } catch (error) {
//     console.error('PDF generation error:', error);
//     throw error;
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// };
// npm install puppeteer @sparticuz/chromium puppeteer-core
// # or
// yarn add puppeteer @sparticuz/chromium puppeteer-core