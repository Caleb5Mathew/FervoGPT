import React from "react";
import "./LogoSpinner.css";

const LogoSpinner = ({ size = 100 }) => (
  <div className="logo-spinner-wrapper" style={{ width: size, height: size }}>
    <svg
      className="logo-spinner"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <g fill="#2F47D6">
        {Array.from({ length: 30 }).map((_, i) => {
          const angle = (i / 30) * 2 * Math.PI;
          const radius = 30 + (i % 3) * 5;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          const r = 1.5 + (i % 4) * 0.5;
          return <circle key={i} cx={x} cy={y} r={r} />;
        })}
      </g>
    </svg>
  </div>
);

export default LogoSpinner;
