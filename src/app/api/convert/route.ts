import { NextResponse } from 'next/server';
import { twi } from 'tw-to-css';
import htmlDocx from 'html-docx-js';
import DOMPurify from "isomorphic-dompurify";

export async function POST(req: Request) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    // Parse the request body
    const { html } = await req.json();

    // Sanitize the HTML to prevent XSS vulnerabilities
    const sanitizedHtml = DOMPurify.sanitize(html);

    // Convert Tailwind CSS classes to inline styles
    const convertedHtml = twi(sanitizedHtml, {
      minify: true,
      merge: true
    });

    // Convert HTML to a DOCX blob
    const docBlob = htmlDocx.asBlob(convertedHtml);

    // Return the DOCX blob as a response
    return new Response(docBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename=document.docx'
      }
    });

  } catch (error: any) {
    console.error('Error converting HTML to DOCX:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb'
    }
  }
};
