import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Node } from "@tiptap/core";
import { useEffect, useState } from "react";

// Extensión personalizada para soportar clases de Tailwind
const TailwindNode = Node.create({
  name: "tailwindNode",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [
      {
        tag: "div",
        getAttrs: (element) => ({
          class: element.getAttribute("class") || "",
        }),
      },
    ];
  },
  renderHTML({ node }) {
    return ["div", { class: node.attrs.class }, 0];
  },
  addAttributes() {
    return {
      class: {
        default: "",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

export const Editor = ({ html }: { html: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const editor = useEditor({
    content: html,
    extensions: [StarterKit, TailwindNode],
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      console.log("Contenido actualizado:", editor.getHTML());
    },
  });

  // Manejar clics en nodos para selección
  const handleNodeClick = (e: { target: any; }) => {
    const target = e.target;
    if (target.tagName === "DIV" && target.className) {
      setSelectedNode(target);
    }
  };

  // Iniciar arrastre
  const handleMouseDown = (e: any) => {
    if (selectedNode) {
      setIsDragging(true);
    }
  };

  // Finalizar arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!editor) return;

    const editorElement = document.querySelector(".ProseMirror");
    if (editorElement) {
      editorElement.addEventListener("click", handleNodeClick);
      editorElement.addEventListener("mousedown", handleMouseDown);
      editorElement.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener("click", handleNodeClick);
        editorElement.removeEventListener("mousedown", handleMouseDown);
        editorElement.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [editor, selectedNode]);

  return (
    <div className="relative border rounded-lg shadow-lg p-4 bg-white">
      <EditorContent editor={editor} />
      {selectedNode && (
        <div className="absolute top-0 left-0 bg-blue-200 bg-opacity-50 border-2 border-blue-500 pointer-events-none"
          style={{
            width: (selectedNode as HTMLElement).offsetWidth,
            height: (selectedNode as HTMLElement).offsetHeight,
            transform: `translate(${(selectedNode as HTMLElement).offsetLeft}px, ${(selectedNode as HTMLElement).offsetTop}px)`,
          }}
        />
      )}
      <div className="mt-2 text-sm text-gray-500">
        {isDragging ? "Arrastrando..." : "Haz clic en un elemento para seleccionarlo"}
      </div>
    </div>
  );
};