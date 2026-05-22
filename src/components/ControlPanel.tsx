import { Slider, useTheme } from "@huzaifah191001/design-library";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setHeightMultiplier,
  setMinPopulation,
} from "../store/slices/controlsSlice";

const ControlPanel = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { minPopulation, heightMultiplier } = useAppSelector(
    (state) => state.control,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: theme.colors.bg,
        padding: "16px",
        borderRadius: "8px",
        border: `1px solid ${theme.colors.border}`,
        width: "220px",
      }}
    >
      <Slider
        label="Min Population"
        value={minPopulation}
        onChange={(val) => dispatch(setMinPopulation(val))}
        min={0}
        max={500}
        step={10}
        formatValue={(v)=>`${v}M`}
        style={{ marginBottom: "12px" }}
      />

      <Slider
        label="Spike Height"
        value={heightMultiplier}
        onChange={(val) => dispatch(setHeightMultiplier(val))}
        min={0.1}
        max={2}
        step={0.1}
        formatValue={(v)=>v.toFixed(2)}
      />

    </div>
  );
};

export default ControlPanel;
