import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Tipos para los estilos
export interface ElementStyles {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  [key: string]: any;
}

// Estructura de un elemento de contenido
export interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'list' | 'link';
  value: string; // Texto, URL, etc.
  label?: string; // Para identificar el campo (ej: "Nombre", "Empresa")
  styles: ElementStyles;
  visible: boolean;
}

// Estructura de una sección
export interface CVSection {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'custom';
  title: string;
  subtitle?: string; // Añadido para flexibilidad
  items: ContentItem[] | CVSection[]; // Puede contener items o sub-secciones (para experiencia/educación que son listas de objetos)
  styles: ElementStyles;
  visible: boolean;
  isList?: boolean; // Indica si la sección es una lista de elementos complejos (ej: Experiencias)
}

// Estado seleccionado
export interface SelectedElement {
  sectionId: string;
  itemId?: string; // Si es null, seleccionó la sección completa
  subSectionId?: string; // Para listas anidadas (ej: una experiencia específica)
  type: 'section' | 'item' | 'subsection';
}

interface CVState {
  sections: CVSection[];
  selectedElement: SelectedElement | null;
  
  // Acciones
  setSections: (sections: CVSection[]) => void;
  selectElement: (element: SelectedElement | null) => void;
  updateSectionStyles: (sectionId: string, styles: Partial<ElementStyles>) => void;
  updateItemStyles: (sectionId: string, itemId: string, styles: Partial<ElementStyles>, subSectionId?: string) => void;
  updateContent: (sectionId: string, itemId: string, value: string, subSectionId?: string) => void;
  reorderSections: (newOrder: CVSection[]) => void;
  addSection: (type: CVSection['type']) => void;
  removeSection: (id: string) => void;
  addItemToSection: (sectionId: string) => void; // Para añadir una nueva experiencia/educación
  removeItemFromSection: (sectionId: string, subSectionId: string) => void;
}

// Datos iniciales de ejemplo
const initialSections: CVSection[] = [
  {
    id: 'header-1',
    type: 'header',
    title: 'Encabezado',
    visible: true,
    styles: {
      backgroundColor: '#f8f9fa',
      padding: '40px 20px',
      textAlign: 'center',
    },
    items: [
      { id: 'name', type: 'text', value: 'Tu Nombre', label: 'Nombre', styles: { fontSize: '32px', fontWeight: 'bold', color: '#333' }, visible: true },
      { id: 'role', type: 'text', value: 'Desarrollador Web', label: 'Cargo', styles: { fontSize: '18px', color: '#666', marginTop: '10px' }, visible: true },
      { id: 'email', type: 'text', value: 'hola@ejemplo.com', label: 'Email', styles: { fontSize: '14px', color: '#555', marginTop: '5px' }, visible: true },
    ],
  },
  {
    id: 'summary-1',
    type: 'summary',
    title: 'Perfil Profesional',
    visible: true,
    styles: { padding: '20px', backgroundColor: '#ffffff' },
    items: [
      { id: 'summary-text', type: 'text', value: 'Describe aquí tu perfil profesional...', label: 'Descripción', styles: { fontSize: '16px', lineHeight: '1.5' }, visible: true }
    ]
  },
  {
    id: 'experience-1',
    type: 'experience',
    title: 'Experiencia Laboral',
    visible: true,
    isList: true,
    styles: { padding: '20px', backgroundColor: '#ffffff' },
    items: [] // Aquí irían objetos complejos, se manejarán como sub-secciones en la implementación
  }
];

export const useCVStore = create<CVState>((set) => ({
  sections: initialSections,
  selectedElement: null,

  setSections: (sections) => set({ sections }),
  
  selectElement: (element) => set({ selectedElement: element }),

  updateSectionStyles: (sectionId, newStyles) => set((state) => ({
    sections: state.sections.map((section) => 
      section.id === sectionId 
        ? { ...section, styles: { ...section.styles, ...newStyles } }
        : section
    ),
  })),

  updateItemStyles: (sectionId, itemId, newStyles, subSectionId) => set((state) => ({
    sections: state.sections.map((section) => {
      if (section.id !== sectionId) return section;

      // Si es una lista compleja (Experiencia)
      if (section.isList && subSectionId) {
        const subSections = section.items as CVSection[]; // Cast as sub-sections
        return {
          ...section,
          items: subSections.map(sub => {
            if (sub.id !== subSectionId) return sub;
            // Dentro de la sub-sección (una experiencia), buscamos el item (ej: título del puesto)
            return {
              ...sub,
              items: (sub.items as ContentItem[]).map(item => 
                item.id === itemId 
                  ? { ...item, styles: { ...item.styles, ...newStyles } }
                  : item
              )
            };
          })
        };
      }

      // Sección simple
      return {
        ...section,
        items: (section.items as ContentItem[]).map((item) => 
          item.id === itemId 
            ? { ...item, styles: { ...item.styles, ...newStyles } }
            : item
        )
      };
    })
  })),

  updateContent: (sectionId, itemId, value, subSectionId) => set((state) => ({
    sections: state.sections.map((section) => {
      if (section.id !== sectionId) return section;

      if (section.isList && subSectionId) {
        const subSections = section.items as CVSection[];
        return {
          ...section,
          items: subSections.map(sub => {
            if (sub.id !== subSectionId) return sub;
            return {
              ...sub,
              items: (sub.items as ContentItem[]).map(item =>
                item.id === itemId ? { ...item, value } : item
              )
            };
          })
        };
      }

      return {
        ...section,
        items: (section.items as ContentItem[]).map((item) =>
          item.id === itemId ? { ...item, value } : item
        )
      };
    })
  })),

  reorderSections: (newOrder) => set({ sections: newOrder }),
  
  addSection: (type) => set((state) => ({
    sections: [...state.sections, {
      id: `${type}-${uuidv4()}`,
      type,
      title: 'Nueva Sección',
      visible: true,
      styles: { padding: '20px' },
      items: []
    }]
  })),
  
  removeSection: (id) => set((state) => ({
    sections: state.sections.filter(s => s.id !== id)
  })),

  addItemToSection: (sectionId) => set((state) => ({
    sections: state.sections.map(section => {
      if (section.id !== sectionId) return section;
      if (!section.isList) return section;

      // Crear nueva entrada para lista (ej: Nueva Experiencia)
      const newItem: CVSection = {
        id: `sub-${uuidv4()}`,
        type: 'custom', // tipo interno
        title: 'Nuevo Item',
        visible: true,
        styles: { marginBottom: '20px' },
        items: [
            { id: 'title', type: 'text', value: 'Título', styles: { fontWeight: 'bold' }, visible: true },
            { id: 'subtitle', type: 'text', value: 'Subtítulo / Empresa', styles: { fontStyle: 'italic' }, visible: true },
            { id: 'date', type: 'text', value: 'Fecha', styles: { fontSize: '0.9em', color: '#666' }, visible: true },
            { id: 'description', type: 'text', value: 'Descripción...', styles: {}, visible: true },
        ]
      };

      return {
        ...section,
        items: [...(section.items as CVSection[]), newItem]
      };
    })
  })),

  removeItemFromSection: (sectionId, subSectionId) => set((state) => ({
    sections: state.sections.map(section => {
      if (section.id !== sectionId) return section;
      if (!section.isList) return section;

      return {
        ...section,
        items: (section.items as CVSection[]).filter(s => s.id !== subSectionId)
      };
    })
  }))

}));
