// main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";

import "./index.css";

import TimersView from "./views/TimersView";
import DocumentationView from "./views/DocumentationView";
import AddTimer from "./views/AddTimer";
import PageIndex from "./components/pageIndex/PageIndex";
import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import { TimerProvider } from "./context/TimerContext";

const router = createHashRouter(
    [
        {
            path: "/",
            element: <PageIndex />,
            errorElement: <div>An error occurred while loading this page.</div>,
            children: [
                { index: true, element: <TimersView /> },
                { path: "/docs", element: <DocumentationView /> },
                { path: "/add", element: <AddTimer /> },
            ],
        },
    ],
    {
        future: {
            v7_partialHydration: true,
            v7_skipActionErrorRevalidation: true,
        },
    }
);

// @ts-ignore
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <TimerProvider>
                <RouterProvider
                    router={router}
                    future={{
                        v7_normalizeFormMethod: true, // Enables the future flag
                    }}
                />
            </TimerProvider>
        </ErrorBoundary>
    </StrictMode>
);