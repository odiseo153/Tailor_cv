// pages/api/generate-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

//import chrome from 'chrome-aws-lambda'; 
import autoprefixer from 'autoprefixer';

import tailwindConfig from '../../../../tailwind.config';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { html: userHtml } = req.body;

  // Validación básica de entrada
  if (!userHtml || typeof userHtml !== 'string') {
    return res.status(400).json({ error: 'HTML inválido' });
  } 

  // 1. Generación de CSS Tailwind
  let criticalCSS: string; 
  try {
    const processor = postcss([
      tailwindcss({
        ...tailwindConfig,
        content: [{ raw: userHtml, extension: 'html' }],
        corePlugins: { preflight: false },
        mode: 'jit',
      }),
      autoprefixer(),
    ]);

    const result = await processor.process(`
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
    `, { from: undefined });

    criticalCSS = result.css;
  } catch (cssError) {
    console.error('Error generando CSS:', cssError);
    return res.status(500).json({ error: 'Fallo en procesamiento de estilos' });
  }

  // 2. Construcción del HTML final
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${criticalCSS}</style>
      </head>
      <body class="bg-white">${userHtml}</body>
    </html>
  `;

  // 3. Generación del PDF con Puppeteer
  let browser;
  try {
    browser = await puppeteer.launch({
      headless:true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=IsolateOrigins',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--no-zygote',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false,
      },
    });

    const page = await browser.newPage();
    
    // Configuración de renderizado
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Asegurar carga de fuentes y estilos
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm',
      },
      timeout: 60000,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
  } catch (pdfError) {
    console.error('Error generando PDF:', pdfError);
    res.status(500).json({ error: 'Fallo en generación de PDF' });
  } finally {
    if (browser) await browser.close();
  }
}