"use client"

import { useEffect, useRef, useState } from 'react'
import { Message } from '@/app/utils/Message'
import 'grapesjs/dist/css/grapes.min.css'
import './grapesjs-styles.css'
import { Loader2 } from 'lucide-react'

interface CanvaEditorProps {
  html: string
  onSave?: (html: string, css: string) => void
}

export default function CanvaEditor({ html, onSave }: CanvaEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Cargar GrapesJS de forma optimizada
  useEffect(() => {
    let mounted = true
    let progressInterval: NodeJS.Timeout

    async function initEditor() {
      try {
        // Barra de progreso simulada para mejor UX
        progressInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + 5, 90))
        }, 100)

        // Cargar el editor core
        const grapesjs = (await import('grapesjs')).default
        setLoadingProgress(40)
        
        if (!mounted || !editorRef.current) return
        
        // Configuración mínima inicial
        const gEditor = grapesjs.init({
          container: editorRef.current,
          height: '700px',
          width: '100%',
          fromElement: false,
          storageManager: false,
          panels: { defaults: [] }
        })
        
        // Cargar el HTML
        gEditor.setComponents(html)
        setLoadingProgress(60)

        // Cargar bloques básicos
        const basicBlocks = await import('grapesjs-blocks-basic')
      //  gEditor.Plugins.add(basicBlocks.default)
        setLoadingProgress(80)
        
        if (!mounted) return
        
        // Configurar los paneles de edición
        setupEditor(gEditor)
        
        // Guardar referencia
        setEditor(gEditor)
        setLoadingProgress(100)
        setLoading(false)
        clearInterval(progressInterval)
      } catch (error) {
        console.error('Error al cargar el editor:', error)
        if (mounted) {
          Message.errorMessage('Error al cargar el editor')
          setLoading(false)
          clearInterval(progressInterval)
        }
      }
    }

    initEditor()

    // Limpiar al desmontar
    return () => {
      mounted = false
      clearInterval(progressInterval)
      if (editor) editor.destroy()
    }
  }, [html, onSave])

  // Configurar el editor después de la carga inicial
  const setupEditor = (editor: any) => {
    // Comando para guardar
    editor.Commands.add('save-template', {
      run: (editor: any) => {
        if (onSave) onSave(editor.getHtml(), editor.getCss())
        Message.successMessage('Cambios guardados')
      }
    })

    // Panel superior con botones
    editor.Panels.addPanel({
      id: 'basic-actions',
      el: '.panel__basic-actions',
      buttons: [
        {
          id: 'save',
          className: 'btn-save',
          label: 'Guardar',
          command: 'save-template'
        },
        {
          id: 'visibility',
          active: true,
          className: 'btn-toggle-borders',
          label: 'Ver bordes',
          command: 'sw-visibility'
        }
      ]
    })

    // Panel de dispositivos
    editor.Panels.addPanel({
      id: 'devices-c',
      buttons: [
        {
          id: 'device-desktop',
          label: 'Desktop',
          command: 'set-device-desktop',
          active: true
        }, 
        {
          id: 'device-mobile',
          label: 'Mobile',
          command: 'set-device-mobile'
        }
      ]
    })

    // Configurar gestores
    editor.BlockManager.render({ appendTo: '.blocks__container' })
    editor.Layers.render({ appendTo: '.layers__container' })
    editor.StyleManager.render({ appendTo: '.styles__container' })

    // Añadir bloques personalizados
    addBasicBlocks(editor)
  }

  // Añadir bloques básicos necesarios para un CV
  const addBasicBlocks = (editor: any) => {
    const blockManager = editor.BlockManager
    
    // Bloques esenciales para CV
    const blocks = [
      {
        id: 'section',
        label: 'Sección',
        category: 'Básicos',
        content: '<section class="section"><h2>Título Sección</h2><div class="content"><p>Contenido aquí...</p></div></section>',
        media: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      },
      {
        id: 'text',
        label: 'Texto',
        category: 'Básicos',
        content: '<div style="padding: 15px"><p>Texto editable</p></div>',
        media: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      },
      {
        id: 'image',
        label: 'Imagen',
        category: 'Básicos',
        content: { type: 'image', attributes: {src: 'https://via.placeholder.com/150x150'} },
        media: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      },
      {
        id: 'header',
        label: 'Encabezado CV',
        category: 'CV',
        content: `
          <header style="display:flex;padding:20px;background:#f9f9f9;border-bottom:2px solid #eee">
            <div style="flex:1">
              <h1 style="margin:0;font-size:26px">Nombre Completo</h1>
              <p style="margin:5px 0;color:#666">Profesión o Cargo</p>
            </div>
            <div style="width:100px;height:100px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center">
              <span style="color:#999">Foto</span>
            </div>
          </header>
        `,
        media: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="8" r="5" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      },
      {
        id: 'skills',
        label: 'Habilidades',
        category: 'CV',
        content: `
          <div style="margin:15px 0">
            <h3 style="border-bottom:1px solid #ddd;padding-bottom:5px">Habilidades</h3>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
              <span style="padding:5px 10px;background:#f0f0f0;border-radius:15px;font-size:14px">Habilidad 1</span>
              <span style="padding:5px 10px;background:#f0f0f0;border-radius:15px;font-size:14px">Habilidad 2</span>
              <span style="padding:5px 10px;background:#f0f0f0;border-radius:15px;font-size:14px">Habilidad 3</span>
            </div>
          </div>
        `,
        media: '<svg viewBox="0 0 24 24" width="24" height="24"><polyline points="9 11 12 14 22 4" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      }
    ]
    
    // Añadir cada bloque
    blocks.forEach(block => blockManager.add(block.id, block))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full p-10">
        <div className="text-center w-64">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Cargando editor avanzado...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {loadingProgress < 100 
              ? "Inicializando componentes..." 
              : "Casi listo..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grapesjs-editor-container">
      <div className="editor__panel">
        <div className="panel__top">
          <div className="panel__devices"></div>
          <div className="panel__basic-actions"></div>
        </div>
        <div className="editor__content">
          <div className="gjs-column">
            <div className="blocks__container"></div>
            <div className="layers__container"></div>
          </div>
          <div ref={editorRef} className="editor-canvas"></div>
          <div className="gjs-column">
            <div className="styles__container"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .grapesjs-editor-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        
        .editor__panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        
        .panel__top {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background-color: #444;
          border-bottom: 1px solid #ddd;
        }
        
        .editor__content {
          display: flex;
          flex-grow: 1;
          height: 700px;
        }
        
        .gjs-column {
          width: 15%;
          min-width: 200px;
          background-color: #f5f5f5;
          border-right: 1px solid #ddd;
          overflow-y: auto;
        }
        
        .editor-canvas {
          flex-grow: 1;
          height: 100%;
          overflow: hidden;
        }
        
        .blocks__container,
        .layers__container,
        .styles__container {
          height: 100%;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
} 