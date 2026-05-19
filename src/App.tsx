import "./App.css";
import "./index.css";
import { ThemeProvider } from "@huzaifah191001/design-library";
import { useAppSelector } from "./store/hooks";
import Home from "./components/Home";

function App() {
  const mode = useAppSelector(state => state.theme.mode);

  return (
    <ThemeProvider themeType={mode}>
      <Home />
    </ThemeProvider>
  );
}

export default App;
