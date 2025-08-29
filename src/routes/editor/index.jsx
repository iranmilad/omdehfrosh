import Editor from "../../layouts/editor";
import EditorPage from "../../views/public/editor";

export const EditorRoutes = [
    {
        element: <Editor />,
        path: "/editor",
        children: [
            {
                path: "",
                element: <EditorPage />
            }
        ]
    }
]