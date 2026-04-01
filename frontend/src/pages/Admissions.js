import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

function SeatStatusBadge({ quota }) {
  const isFull = quota.remaining === 0;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: '0.72rem',
      fontWeight: 600,
      background: isFull ? '#fee2e2' : '#dcfce7',
      color:      isFull ? '#b91c1c' : '#15803d',
      marginRight: 6,
      marginBottom: 4,
    }}>
      {quota.name}: {quota.remaining} left
    </span>
  );
}

export default function Admissions() {
  const [applicants,  setApplicants]  = useState([]);
  const [seatStatus,  setSeatStatus]  = useState({}); 
  const [loading,     setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter,      setFilter]      = useState('all'); 

  const fetchApplicants = useCallback(async () => {
    try {
      const { data } = await API.get('/applicants');
      setApplicants(data);

      const uniquePrograms = [...new Set(data.map(a => a.program?._id).filter(Boolean))];
      const statusMap = {};
      await Promise.all(
        uniquePrograms.map(async (progId) => {
          try {
            const res = await API.get(`/admissions/seat-status/${progId}`);
            statusMap[progId] = res.data;
          } catch {
            statusMap[progId] = { quotaStatus: [] }; 
          }
        })
      );
      setSeatStatus(statusMap);
    } catch {
      toast.error('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const handleAllocate = async (applicantId) => {
    setActionLoading(prev => ({ ...prev, [applicantId]: true }));
    try {
      const { data } = await API.post(`/admissions/allocate/${applicantId}`);
      toast.success(data.message);
      fetchApplicants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicantId]: false }));
    }
  };

  const handleConfirm = async (applicantId) => {
    setActionLoading(prev => ({ ...prev, [applicantId]: true }));
    try {
      const { data } = await API.post(`/admissions/confirm/${applicantId}`);
      toast.success(`🎉 Admission confirmed! Number: ${data.admissionNumber}`);
      fetchApplicants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirmation failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicantId]: false }));
    }
  };

  const filtered = applicants.filter(a => {
    if (filter === 'pending')   return !a.seatAllocated;
    if (filter === 'allocated') return a.seatAllocated && !a.admissionNumber;
    if (filter === 'confirmed') return !!a.admissionNumber;
    return true;
  });

  const counts = {
    all:       applicants.length,
    pending:   applicants.filter(a => !a.seatAllocated).length,
    allocated: applicants.filter(a => a.seatAllocated && !a.admissionNumber).length,
    confirmed: applicants.filter(a => !!a.admissionNumber).length,
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: '2rem' }}>⏳</div>
      <p style={{ color: '#6b7280', marginTop: 8 }}>Loading admissions…</p>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎟️ Admissions</h1>
          <p className="page-subtitle">Allocate seats and confirm admissions</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchApplicants}>
          🔄 Refresh
        </button>
      </div>

      <div className="alert alert-info section-gap">
        <strong>Admission Workflow:</strong>
        &nbsp;①&nbsp;Create Applicant (in Applicants page)
        → ②&nbsp;Mark fee as Paid (in Applicants page)
        → ③&nbsp;<strong>Allocate Seat</strong> (checks quota availability)
        → ④&nbsp;<strong>Confirm Admission</strong> (generates admission number)
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all',       label: `All (${counts.all})` },
          { key: 'pending',   label: `⏳ Seat Pending (${counts.pending})` },
          { key: 'allocated', label: `🪑 Awaiting Confirmation (${counts.allocated})` },
          { key: 'confirmed', label: `✅ Confirmed (${counts.confirmed})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Program</th>
                <th>Quota</th>
                <th>Fee Status</th>
                <th>Doc Status</th>
                <th>Seat Status</th>
                <th style={{ minWidth: 220 }}>Actions</th>
                <th>Admission Number</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
                    No applicants in this category
                  </td>
                </tr>
              ) : filtered.map(a => {
                const isProcessing = actionLoading[a._id];
                const programSeats = seatStatus[a.program?._id];
                const quotaInfo = programSeats?.quotaStatus?.find(q => q.name === a.quotaType);

                const canAllocate   = !a.seatAllocated;
                const canConfirm    = a.seatAllocated && !a.admissionNumber;
                const feeBlocking   = canConfirm && a.feeStatus !== 'Paid';
                const quotaFull     = canAllocate && quotaInfo?.isFull;

                return (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{a.email}</div>
                    </td>

                    <td style={{ fontSize: '0.82rem' }}>
                      <div>{a.program?.name || '—'}</div>
                      {quotaInfo && (
                        <SeatStatusBadge quota={quotaInfo} />
                      )}
                    </td>

                    <td><span className="badge badge-info">{a.quotaType}</span></td>

                    <td>
                      <span className={`badge ${a.feeStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                        {a.feeStatus === 'Paid' ? '✅ Paid' : '❌ Pending'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${
                        a.documentStatus === 'Verified'  ? 'badge-success' :
                        a.documentStatus === 'Submitted' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {a.documentStatus}
                      </span>
                    </td>

                    <td>
                      {a.admissionNumber
                        ? <span className="badge badge-success">🎓 Admitted</span>
                        : a.seatAllocated
                          ? <span className="badge badge-warning">🪑 Allocated</span>
                          : <span className="badge badge-gray">Not Allocated</span>}
                    </td>

                    <td>
                      {a.admissionNumber && (
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                          ✅ Done
                        </span>
                      )}

                      {canAllocate && (
                        <div>
                          <button
                            className="btn btn-warning btn-sm"
                            disabled={isProcessing || quotaFull}
                            onClick={() => handleAllocate(a._id)}
                            title={quotaFull ? `${a.quotaType} quota is full!` : 'Allocate a seat'}
                            style={{ marginBottom: 4 }}
                          >
                            {isProcessing ? '…' : '🪑 Allocate Seat'}
                          </button>
                          {quotaFull && (
                            <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: 2 }}>
                              ❌ {a.quotaType} quota full!
                            </div>
                          )}
                        </div>
                      )}

                      {canConfirm && (
                        <div>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={isProcessing || feeBlocking}
                            onClick={() => handleConfirm(a._id)}
                            title={feeBlocking ? 'Fee must be Paid first' : 'Confirm and generate admission number'}
                          >
                            {isProcessing ? '…' : '🎓 Confirm Admission'}
                          </button>
                          {feeBlocking && (
                            <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: 2 }}>
                              ⚠️ Mark fee as Paid first
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td>
                      {a.admissionNumber
                        ? (
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            background: '#dbeafe',
                            padding: '4px 8px',
                            borderRadius: 6,
                            display: 'inline-block',
                          }}>
                            {a.admissionNumber}
                          </span>
                        )
                        : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
