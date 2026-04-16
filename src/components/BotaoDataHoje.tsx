<button
  onClick={() => setAberto(true)}
  style={{
    position: "fixed",
    right: "24px",
    bottom: "24px",
    padding: "12px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 99999, // 👈 importante
    background: "#000",
    color: "#fff",
  }}
>
  Ver data
</button>
