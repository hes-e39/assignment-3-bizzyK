// main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RouterProvider, createHashRouter } from "react-router-dom";

import "./index.css";

import TimersView from "./views/TimersView";
import DocumentationView from "./views/DocumentationView";
import AddTimer from "./views/AddTimer";
import PageIndex from "./components/pageIndex/PageIndex";
import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import { TimerProvider } from "./context/TimerContext";

const router = createHashRouter([
    {
        path: "/",
        element: <PageIndex />,
        errorElement: <div>An error occurred while loading this page.</div>,
        children: [
            { index: true, element: <TimersView /> },
            { path: "/docs", element: <DocumentationView /> },
            { path: "/add", element: <AddTimer /> },
            { path: "/edit-timer/:id", element: <AddTimer /> },
        ],
    },
]);

// Ensure your app is wrapped with both TimerProvider and DndProvider
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <TimerProvider>
                <DndProvider backend={HTML5Backend}>
                    <RouterProvider router={router} />
                </DndProvider>
            </TimerProvider>
        </ErrorBoundary>
    </StrictMode>
);