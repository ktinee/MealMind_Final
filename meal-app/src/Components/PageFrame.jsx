import React from "react";

export default function PageFrame({ title, onNavigate, children }) {
  return (
    <main className="meal-layout">
      <header className="meal-header">
        <h1>{title}</h1>
        <button type="button" onClick={() => onNavigate?.("Home")}>Home</button>
      </header>
      {children}
    </main>
  );
}
