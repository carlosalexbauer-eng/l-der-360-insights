import { useState } from "react";

export function BotaoDataHoje() {
  const [aberto, setAberto] = useState(false);

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
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
          zIndex: 1000,
        }}
      >
        Ver data
      </button>

      {aberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3>Data de hoje</h3>
            <p>{dataHoje}</p>

            <button onClick={() => setAberto(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
