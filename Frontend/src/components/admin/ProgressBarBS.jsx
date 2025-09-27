import React from 'react';

export default function ProgressBarBS({ value = 0 }) {
  return (
    <div className="progress bg-light rounded-pill" style={{ height: 8 }}>
      <div
        className="progress-bar bg-primary"
        style={{ width: `${value}%` }}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={value}
      />
    </div>
  );
}