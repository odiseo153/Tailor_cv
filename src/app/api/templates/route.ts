import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
    try {
    
        const templates = [
        'src\\templates\\plantilla.html',
        'src\\templates\\plantilla2.html',
      ];
    
        const contentHtml = templates.map((templatePath) => {
            const fullPath = path.join(process.cwd(), templatePath);
            const content = fs.readFileSync(fullPath, 'utf8');
            return content;
        });
    
        return NextResponse.json({ contentHtml });
    
      } catch (error) {
        return NextResponse.json({ error: `Template not found ${error}` });
      }
  }