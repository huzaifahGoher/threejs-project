interface LoadingScreenProps {
  visible: boolean;
  progress: number; // 0 to 100
}

const LoadingScreen = ({ visible, progress }: LoadingScreenProps) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        zIndex: 2000,
        transition: "opacity 0.6s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <div style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>
        Loading Globe...
      </div>
      <div
        style={{
          width: "200px",
          height: "4px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#16A34A",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
