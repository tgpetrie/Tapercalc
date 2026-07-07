import React from 'react';

export default function ResourceCard({ resource }) {
  return (
    <article className="resource-card">
      <div>
        <span className="resource-category">{resource.category}</span>
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>
      </div>
      <div className="resource-meta">
        <span>{resource.sourceName}</span>
        <span>{resource.cost}</span>
        <span>{resource.region}</span>
      </div>
      {resource.url ? (
        <a href={resource.url} target="_blank" rel="noreferrer" className="text-button">
          Open Resource
        </a>
      ) : (
        <span className="resource-note">Printable tool planned inside Compass.</span>
      )}
    </article>
  );
}
