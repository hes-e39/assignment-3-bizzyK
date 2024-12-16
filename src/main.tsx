// main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RouterProvider, createHashRouter } from "react-router-dom";

import "./index.css";

import TimersView from "./views/TimersView";
import DocumentationView from "./views/DocumentationView";
import HistoryView from "./views/HistoryView";
import AddTimer from "./views/AddTimer";
import PageIndex from "./components/pageIndex/PageIndex";
import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import { TimerProvider } from "./context/TimerContext";

// Error page for route-level errors
const ErrorPage = () => (
    <div className="error-page">
        <h1>Something went wrong!</h1>
        <p>Sorry, an unexpected error occurred. Please try again later.</p>
    </div>
);

const router = createHashRouter([
    {
        path: "/",
        element: <PageIndex />,
        errorElement: <ErrorPage />, // Dedicated error page for route-level errors
        children: [
            { index: true, element: <TimersView /> },
            { path: "/docs", element: <DocumentationView /> },
            { path: "/add", element: <AddTimer /> },
            { path: "/history", element: <HistoryView /> },
            { path: "/edit-timer/:id", element: <AddTimer /> }, // Add the edit timer route
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