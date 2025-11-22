import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';


export async function POST(req: NextRequest) {
    try {
        const { html } = await req.json();

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            );
        }

        let browser;

        if (process.env.NODE_ENV === 'production') {
            // Configuración para VERCEL
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: { width: 1920, height: 1080 },
                executablePath: await chromium.executablePath(),
                headless: true,
            });
        } else {
            // Configuración para LOCAL
            // Necesitamos importar puppeteer normal para desarrollo local si queremos que descargue chromium automáticamente
            // O podemos usar puppeteer-core apuntando al chrome local

            // Opción A: Usar una ruta fija al Chrome local (ajusta según tu OS)
            // const localExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; 

            // Opción B: Usar puppeteer completo (requiere instalar 'puppeteer' como devDependency)
            // Como ya tienes puppeteer-core, asumiremos que en local tienes Chrome instalado o usarás una ruta.

            // Para simplificar, intentaremos usar una ruta común de Chrome en Windows o dejar que falle si no está configurado.
            // Lo ideal en local es tener 'puppeteer' instalado que trae su propio chromium.

            // Si tienes 'puppeteer' instalado en devDependencies, puedes hacer:
            const puppeteerLocal = await import('puppeteer').then(m => m.default).catch(() => null);

            if (puppeteerLocal) {
                browser = await puppeteerLocal.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
            } else {
                // Fallback a puppeteer-core buscando Chrome localmente (puede fallar si no encuentra la ruta)
                // Intenta buscar la ruta de Chrome en Windows
                browser = await puppeteer.launch({
                    channel: 'chrome',
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
            }
        }

        const page = await browser.newPage();

        // Set content
        // We use waitUntil: 'networkidle0' to ensure images/fonts are loaded
        await page.setContent(html, {
            waitUntil: 'networkidle0',
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm',
            },
        });

        await browser.close();

        // Return PDF
        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="cv.pdf"',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
