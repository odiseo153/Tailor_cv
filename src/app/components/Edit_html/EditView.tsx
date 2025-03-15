import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const Editor = ({html}:{html:string}) => {
  const editor = useEditor({
    content: html,
    extensions: [StarterKit],
    editorProps: {
        attributes: {
          class: "prose max-w-none focus:outline-none", // Clases Tailwind para el contenedor
        },
      },
  });

  return <EditorContent editor={editor} />;
};