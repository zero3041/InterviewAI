import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TechPage from "./pages/TechPage";
import QuestionsPage from "./pages/QuestionsPage";
import TestPage from "./pages/TestPage";
import BookmarksPage from "./pages/BookmarksPage";
import HistoryPage from "./pages/HistoryPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/history"} component={HistoryPage} />
      <Route path={"/tech/:techId"} component={TechPage} />
      <Route path={"/tech/:techId/questions/:level"} component={QuestionsPage} />
      <Route path={"/tech/:techId/test/:level"} component={TestPage} />
      {/* Legacy routes for backwards compatibility */}
      <Route path={"/questions/:level"} component={QuestionsPage} />
      <Route path={"/bookmarks"} component={BookmarksPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
