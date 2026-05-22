import { useTheme } from "@huzaifah191001/design-library";
import ThreeScene from "./ThreeScene";

const Home = () => {
  const theme = useTheme();

  return (
    <div
      style={{
        color: theme.colors.text,
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.bg,
      }}
    >
      <ThreeScene />
    </div>
  );
};

export default Home;
