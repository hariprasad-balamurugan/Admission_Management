import { useEffect, useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

function QuotaProgress({ quota }) {
  const pct = quota.fillPercent;
  const barClass =
    pct >= 100 ? 'full' :
    pct >= 75  ? 'high' : 'good';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
          {quota.name}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          {quota.filled}/{quota.total}
          {' '}
          <span style={{
            color: quota.remaining === 0 ? '#dc2626' : '#16a34a',
            fontWeight: 600,
          }}>
            ({quota.remaining} left)
          </span>
        </span>
      </div>
      <div className="progress-bar-bg">
        <div
          className={`progress-bar-fill ${barClass}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, emoji }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{emoji} {label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await API.get('/admissions/dashboard');
        setData(res);
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Loading dashboard…</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, programs } = data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Real-time overview of admissions — auto-refreshes every 30 seconds
          </p>
        </div>
      </div>

      <div className="stat-cards">
        <StatCard label="Total Applicants" value={summary.totalApplicants} color="blue"   emoji="👥" />
        <StatCard label="Seats Allocated"  value={summary.seatsAllocated}  color="teal"   emoji="🪑" />
        <StatCard label="Fully Admitted"   value={summary.totalAdmitted}   color="green"  emoji="✅" />
        <StatCard label="Pending Docs"     value={summary.pendingDocs}     color="yellow" emoji="📄" />
        <StatCard label="Pending Fees"     value={summary.pendingFees}     color="red"    emoji="💰" />
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: 16 }}>
        Program-wise Seat Matrix
      </h2>

      {programs.length === 0 ? (
        <div className="card empty-state">
          <h3>No programs configured yet</h3>
          <p>Ask an admin to set up programs and seat quotas in the Masters section.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {programs.map(p => {
            const fillPct = p.totalIntake > 0
              ? Math.round((p.totalAdmitted / p.totalIntake) * 100)
              : 0;

            return (
              <div className="card" key={p.id}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>
                        {p.program}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                        {p.courseType} · {p.academicYear}
                      </p>
                    </div>
                    <span style={{
                      background: fillPct >= 100 ? '#fee2e2' : '#dbeafe',
                      color:      fillPct >= 100 ? '#b91c1c' : '#1d4ed8',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {p.totalAdmitted}/{p.totalIntake}
                    </span>
                  </div>
                </div>

                {p.quotas.map(q => (
                  <QuotaProgress key={q.name} quota={q} />
                ))}

                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  gap: 16,
                  fontSize: '0.78rem',
                  color: '#6b7280',
                }}>
                  <span>🪑 Allocated: <strong>{p.totalAllocated}</strong></span>
                  <span>✅ Admitted: <strong>{p.totalAdmitted}</strong></span>
                  <span>📊 Intake: <strong>{p.totalIntake}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
