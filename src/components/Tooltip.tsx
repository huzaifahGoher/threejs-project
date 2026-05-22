type TooltipProps = {
  visible: boolean;
  x: number;
  y: number;
  country: string;
  value: number;
};

const Tooltip = ({ visible = false, x, y, country, value }: TooltipProps) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: `${x + 15}px`,
        top: `${y + 15}px`,
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        pointerEvents: "none",
        zIndex: 1000,
        border: "1px solid rgba(68, 136, 255, 0.4)",
      }}
    >
      <strong>{country}</strong>
      <br />
      Population: {value}M
    </div>
  );
};

export default Tooltip;
