import { CVSection, ContentItem } from './useCVStore';
import { v4 as uuidv4 } from 'uuid';

export const parseHtmlToSections = (html: string): CVSection[] => {
  if (typeof window === 'undefined') return []; // Ensure client-side only for DOMParser

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections: CVSection[] = [];

  // Helper to extract styles (basic implementation)
  const getComputedStyles = (el: HTMLElement) => {
    // Note: parsed styled from string won't have computed styles unless appended to DOM
    // We can try to grab inline styles
    const style: any = {};
    if (el.style.fontSize) style.fontSize = el.style.fontSize;
    if (el.style.fontWeight) style.fontWeight = el.style.fontWeight;
    if (el.style.color) style.color = el.style.color;
    if (el.style.textAlign) style.textAlign = el.style.textAlign;
    if (el.style.backgroundColor) style.backgroundColor = el.style.backgroundColor;
    return style;
  };

  // 1. Header Extraction (heuristic: header tag or first div with extensive text)
  const header = doc.querySelector('header');
  if (header) {
    const items: ContentItem[] = [];
    
    // Name (h1)
    const h1 = header.querySelector('h1');
    if (h1) {
       items.push({
         id: 'name',
         type: 'text',
         value: h1.textContent?.trim() || '',
         label: 'Nombre',
         styles: { 
             fontSize: '24px', 
             fontWeight: 'bold', 
             textAlign: 'center',
             color: '#000000',
             ...getComputedStyles(h1)
         },
         visible: true
       });
    }

    // Role/Title (p or h2)
    const role = header.querySelector('p, h2') as HTMLElement;
    if (role && role !== h1) {
        items.push({
            id: 'role',
            type: 'text',
            value: role.textContent?.trim() || '',
            label: 'Título',
            styles: { fontSize: '16px', textAlign: 'center', color: '#666666', ...getComputedStyles(role) },
            visible: true
        });
    }

    sections.push({
      id: 'header-parsed',
      type: 'header',
      title: 'Encabezado',
      visible: true,
      styles: { padding: '20px', backgroundColor: '#f8f9fa' },
      items
    });
  }

  // 2. Generic Sections (section tags)
  const sectionElements = doc.querySelectorAll('section');
  sectionElements.forEach((elem) => {
    const titleEl = elem.querySelector('h2, h3');
    const title = titleEl?.textContent?.trim() || 'Sección';
    
    // Check for lists
    const listItems = elem.querySelectorAll('ul li');
    
    if (listItems.length > 0) {
        // Handle list-based sections (Skills, etc)
        const items: ContentItem[] = Array.from(listItems).map((li) => ({
             id: `item-${uuidv4()}`,
             type: 'text' as const,
             value: li.textContent?.trim() || '',
             styles: { display: 'block', marginBottom: '5px' },
             visible: true
        }));

        sections.push({
            id: `section-${uuidv4()}`,
            type: 'custom',
            title,
            visible: true,
            styles: { padding: '15px' },
            items
        });

    } else {
        // Text based section (Summary, etc)
        // Get all paragraphs
        const ps = elem.querySelectorAll('p');
        const contentText = Array.from(ps).map(p => p.textContent).join('\n') || elem.textContent || '';
        if (contentText.trim()) {
             sections.push({
                id: `section-${uuidv4()}`,
                type: 'summary',
                title,
                visible: true,
                styles: { padding: '15px' },
                items: [
                    {
                        id: `content-${uuidv4()}`,
                        type: 'text',
                        value: contentText.trim(),
                        styles: { fontSize: '14px', lineHeight: '1.6' },
                        visible: true
                    }
                ]
            });
        }
    }
  });

  // Fallback: If minimal parsing failed (e.g. raw HTML without <section>)
  if (sections.length === 0) {
      // Try to just dump the body text
      sections.push({
          id: 'fallback',
          type: 'summary',
          title: 'Contenido Importado',
          visible: true,
          styles: { padding: '20px' },
          items: [{
              id: 'full-text',
              type: 'text',
              value: doc.body.textContent?.trim() || 'Sin contenido detectado',
              styles: {},
              visible: true
          }]
      });
  }

  return sections;
};
