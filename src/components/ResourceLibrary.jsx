import React, { useMemo, useState } from 'react';
import { RESOURCE_CATEGORIES, STARTER_RESOURCES, filterResources } from '../data/resources';
import ResourceCard from './ResourceCard';

export default function ResourceLibrary({ compact = false }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const resources = useMemo(
    () => filterResources(STARTER_RESOURCES, query, category),
    [query, category],
  );

  return (
    <section className={compact ? 'resource-library compact' : 'resource-library compass-card'}>
      <div className="card-header-row">
        <div>
          <p className="eyebrow">Resources</p>
          <h2>Support library</h2>
        </div>
      </div>
      <p className="resource-disclaimer">
        Resources are educational and supportive. They do not replace medical care or emergency services.
      </p>
      {!compact && (
        <div className="resource-controls">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resources"
            aria-label="Search resources"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter resources by category"
          >
            <option value="All">All categories</option>
            {RESOURCE_CATEGORIES.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      )}
      <div className="resource-grid">
        {resources.slice(0, compact ? 3 : resources.length).map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}
