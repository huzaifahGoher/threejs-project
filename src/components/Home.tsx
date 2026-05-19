import { Button, useTheme } from "@huzaifah191001/design-library";
import { useAppDispatch } from "../store/hooks";
import { toggleTheme } from "../store/slices/themeSlice";

const Home = () => {
  const theme = useTheme();
  const disaptch = useAppDispatch();

  return (
    <div
      style={{
        color: theme.colors.text,
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.bg,
      }}
    >
      Minimal
      <Button variant="filled" style={{ color: theme.colors.textOnDanger }} 
      onClick={()=>{
        disaptch(toggleTheme());
      }}>
        Switch theme
      </Button>
    </div>
  );
};

export default Home;
