import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    try {
        const { html } = await req.json();

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            );
        }

        // Launch browser
        // Note: In production (Vercel/AWS), you might need 'chrome-aws-lambda' or '@sparticuz/chromium'
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

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
