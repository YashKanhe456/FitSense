import React from 'react';

function StatePanel({ title, description, action }) {
  return (
    <section className="state-panel">
      <div className="state-panel__card">
        <p className="section-kicker">Patil Mens Wear</p>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {action ? <div className="state-panel__action">{action}</div> : null}
      </div>
    </section>
  );
}

export default StatePanel;
