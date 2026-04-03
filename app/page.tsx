'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { formatMoney, safeDate } from '@/lib/date';
import { DashboardResponse, ScoredOpportunity } from '@/lib/types';

const defaultStates = ['IN', 'TX', 'AR', 'AL', 'MT'];

function MetricCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="card metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sublabel ? <div className="metric-sublabel">{sublabel}</div> : null}
    </div>
  );
}

function downloadCsv(rows: ScoredOpportunity[]) {
  const headers = [
    'Title',
    'Agency',
    'Program',
    'Source',
    'State',
    'Status',
    'Due Date',
    'Funding Max',
    'Score',
    'Bucket',
    'Go/No-Go',
    'Real Deal',
    'Source URL'
  ];

  const csvRows = rows.map((row) => [
    row.title,
    row.agency,
    row.programName ?? '',
    row.source,
    row.state ?? '',
    row.status,
    row.dueDate ?? '',
    row.fundingMax ?? row.awardCeiling ?? '',
    row.score,
    row.bucket,
    row.goNoGo,
    row.realDeal,
    row.sourceUrl
  ]);

  const csv = [headers, ...csvRows]
    .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `grant-pipeline-export-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateInput, setStateInput] = useState(defaultStates.join(','));
  const [bucket, setBucket] = useState('');

  async function loadData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (stateInput.trim()) params.set('states', stateInput.toUpperCase());
    if (search.trim()) params.set('search', search.trim());
    if (bucket) params.set('buckets', bucket);

    const response = await fetch(`/api/opportunities?${params.toString()}`);
    const json = (await response.json()) as DashboardResponse;
    setDashboard(json);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const topPursuits = useMemo(
    () => dashboard?.opportunities.filter((item) => item.bucket === 'Pursue').slice(0, 5) ?? [],
    [dashboard]
  );

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <div className="eyebrow">Grant Pipeline Engine</div>
          <h1>DOE, EECBG, state energy office, and utility rebate opportunity dashboard</h1>
          <p>
            This is a sales-operations command center built to find real energy-efficiency funding paths,
            score them for commercial fit, and separate real deals from noise.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => void loadData()}>
            Refresh pipeline
          </button>
          <button className="secondary-button" onClick={() => downloadCsv(dashboard?.opportunities ?? [])}>
            Export CSV
          </button>
        </div>
      </section>

      <section className="filter-bar card">
        <div className="filter-group">
          <label>Priority states</label>
          <input value={stateInput} onChange={(e) => setStateInput(e.target.value)} placeholder="IN,TX,AR,AL,MT" />
        </div>
        <div className="filter-group">
          <label>Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="lighting, municipality, rebate" />
        </div>
        <div className="filter-group">
          <label>Bucket</label>
          <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
            <option value="">All buckets</option>
            <option value="Pursue">Pursue</option>
            <option value="Review">Review</option>
            <option value="Watch">Watch</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <div className="filter-group button-stack">
          <label>&nbsp;</label>
          <button className="primary-button" onClick={() => void loadData()}>
            Apply filters
          </button>
        </div>
      </section>

      {loading || !dashboard ? (
        <section className="card">Loading pipeline...</section>
      ) : (
        <>
          <section className="metrics-grid">
            <MetricCard label="Total visible" value={dashboard.totals.total} sublabel={`Refreshed ${safeDate(dashboard.refreshedAt)}`} />
            <MetricCard label="Pursue" value={dashboard.totals.pursue} />
            <MetricCard label="Review" value={dashboard.totals.review} />
            <MetricCard label="Go" value={dashboard.totals.go} />
            <MetricCard label="Real Deal" value={dashboard.totals.realDeal} />
          </section>

          <section className="two-column-grid">
            <div className="card">
              <h2>Top pursuit queue</h2>
              <div className="stack-list">
                {topPursuits.length === 0 ? (
                  <div className="muted">No high-priority pursuits in the current filtered set.</div>
                ) : (
                  topPursuits.map((item) => (
                    <div key={item.id} className="queue-item">
                      <div>
                        <div className="queue-title">{item.title}</div>
                        <div className="queue-meta">{item.agency} · {item.state ?? item.geography} · {item.bucket}</div>
                      </div>
                      <div className="queue-score">{item.score}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <h2>Source mix</h2>
              <div className="stack-list">
                {dashboard.sourceSummary.map((source) => (
                  <div key={source.source} className="source-row">
                    <span>{source.source}</span>
                    <strong>{source.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="table-header">
              <div>
                <h2>Opportunity table</h2>
                <p>Use this as the daily command center. Pursue is actionable now. Review needs qualification. Watch is feeder inventory.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Opportunity</th>
                    <th>Agency / Source</th>
                    <th>Due</th>
                    <th>Funding</th>
                    <th>Score</th>
                    <th>Bucket</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.opportunities.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cell-title">{item.title}</div>
                        <div className="cell-subtitle">{item.projectTags.join(', ') || 'No tags'}</div>
                        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="cell-link">
                          Open source
                        </a>
                      </td>
                      <td>
                        <div className="cell-title">{item.agency}</div>
                        <div className="cell-subtitle">{item.source}</div>
                      </td>
                      <td>
                        <div>{safeDate(item.dueDate)}</div>
                        <div className="cell-subtitle">{item.daysToDeadline == null ? 'Rolling / TBD' : `${item.daysToDeadline} days`}</div>
                      </td>
                      <td>{formatMoney(item.fundingMax ?? item.awardCeiling ?? item.totalFunding)}</td>
                      <td>
                        <span className="pill pill-score">{item.score}</span>
                      </td>
                      <td>
                        <span className={`pill pill-${item.bucket.toLowerCase()}`}>{item.bucket}</span>
                      </td>
                      <td>
                        <div className="cell-title">{item.goNoGo}</div>
                        <div className="cell-subtitle">{item.realDeal}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
