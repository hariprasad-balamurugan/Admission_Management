
import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';



const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: 'Male', category: 'GM',
  entryType: 'Regular', quotaType: 'KCET', program: '',
  qualifyingMarks: '', allotmentNumber: '',
  admissionMode: 'Government', address: '', parentName: '',
};

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [programs,   setPrograms]   = useState([]);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, progRes] = await Promise.all([
          API.get('/applicants'),
          API.get('/masters/programs'),
        ]);
        setApplicants(appRes.data);
        setPrograms(progRes.data);
      } catch {
        toast.error('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const required = ['firstName','lastName','email','phone','dateOfBirth','program','qualifyingMarks'];
    const missing  = required.filter(f => !form[f]);
    if (missing.length > 0) {
      return toast.error(`Please fill: ${missing.join(', ')}`);
    }

    setSubmitting(true);
    try {
      const { data } = await API.post('/applicants', {
        ...form,
        qualifyingMarks: Number(form.qualifyingMarks),
      });
      setApplicants([data.applicant, ...applicants]); 
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Applicant created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create applicant.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateDocStatus = async (id, documentStatus) => {
    try {
      const { data } = await API.patch(`/applicants/${id}/documents`, { documentStatus });
      setApplicants(applicants.map(a => a._id === id ? data.applicant : a));
      toast.success(`Document status → ${documentStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  const updateFeeStatus = async (id, feeStatus) => {
    try {
      const { data } = await API.patch(`/applicants/${id}/fee`, { feeStatus });
      setApplicants(applicants.map(a => a._id === id ? data.applicant : a));
      toast.success(`Fee status → ${feeStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  const filtered = applicants.filter(a => {
    const q = search.toLowerCase();
    return (
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      a.quotaType?.toLowerCase().includes(q) ||
      a.admissionNumber?.toLowerCase().includes(q)
    );
  });

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: '2rem' }}>⏳</div>
      <p style={{ color: '#6b7280', marginTop: 8 }}>Loading applicants…</p>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 Applicants</h1>
          <p className="page-subtitle">{applicants.length} total applicants</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close Form' : '+ New Applicant'}
        </button>
      </div>

      {showForm && (
        <div className="card section-gap" style={{ border: '2px solid #dbeafe' }}>
          <div className="card-header">
            <h3 className="card-title">📋 New Applicant Form (15 fields)</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Fields marked * are required</p>
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1d4ed8', marginBottom: 10, textTransform: 'uppercase' }}>
            Personal Information
          </p>
          <div className="form-grid" style={{ marginBottom: 20 }}>
            {[
              { name: 'firstName',   label: 'First Name *',        type: 'text'   },
              { name: 'lastName',    label: 'Last Name *',          type: 'text'   },
              { name: 'email',       label: 'Email *',              type: 'email'  },
              { name: 'phone',       label: 'Phone *',              type: 'tel'    },
              { name: 'dateOfBirth', label: 'Date of Birth *',      type: 'date'   },
              { name: 'parentName',  label: 'Parent/Guardian Name', type: 'text'   },
            ].map(f => (
              <div key={f.name} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} name={f.name}
                  value={form[f.name]} onChange={handleChange} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                {['Male','Female','Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" type="text" name="address"
                value={form.address} onChange={handleChange} placeholder="City, State" />
            </div>
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1d4ed8', marginBottom: 10, textTransform: 'uppercase' }}>
            Academic & Admission Details
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {['GM','SC','ST','OBC','EWS'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Entry Type *</label>
              <select className="form-select" name="entryType" value={form.entryType} onChange={handleChange}>
                {['Regular','Lateral'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admission Mode *</label>
              <select className="form-select" name="admissionMode" value={form.admissionMode} onChange={handleChange}>
                {['Government','Management'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quota Type *</label>
              <select className="form-select" name="quotaType" value={form.quotaType} onChange={handleChange}>
                {['KCET','COMEDK','Management'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Program *</label>
              <select className="form-select" name="program" value={form.program} onChange={handleChange}>
                <option value="">Select Program</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.courseType})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Qualifying Marks (%) *</label>
              <input className="form-input" type="number" name="qualifyingMarks"
                min="0" max="100" placeholder="e.g. 85"
                value={form.qualifyingMarks} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Allotment Number (Govt. quota)</label>
              <input className="form-input" type="text" name="allotmentNumber"
                placeholder="KCET/COMEDK allotment no."
                value={form.allotmentNumber} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving…' : '✅ Save Applicant'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Applicants</h3>
          <input
            className="form-input"
            placeholder="🔍 Search by name, email, quota…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Program</th>
                <th>Quota</th>
                <th>Category</th>
                <th>Marks</th>
                <th>Documents</th>
                <th>Fee</th>
                <th>Seat</th>
                <th>Admission No.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    {search ? 'No applicants match your search.' : 'No applicants yet. Click "+ New Applicant" to add one.'}
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {a.firstName} {a.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{a.email}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {a.program?.name || '—'}
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{a.program?.courseType}</div>
                  </td>
                  <td><span className="badge badge-info">{a.quotaType}</span></td>
                  <td><span className="badge badge-gray">{a.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{a.qualifyingMarks}%</td>
                  <td>
                    <select
                      value={a.documentStatus}
                      onChange={e => updateDocStatus(a._id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem',
                        border: '1.5px solid #e5e7eb', cursor: 'pointer',
                        background: a.documentStatus === 'Verified' ? '#f0fdf4'
                                  : a.documentStatus === 'Submitted' ? '#fefce8'
                                  : '#fef2f2',
                      }}
                    >
                      <option>Pending</option>
                      <option>Submitted</option>
                      <option>Verified</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={a.feeStatus}
                      onChange={e => updateFeeStatus(a._id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem',
                        border: '1.5px solid #e5e7eb', cursor: 'pointer',
                        background: a.feeStatus === 'Paid' ? '#f0fdf4' : '#fef2f2',
                      }}
                    >
                      <option>Pending</option>
                      <option>Paid</option>
                    </select>
                  </td>
                  <td>
                    {a.seatAllocated
                      ? <span className="badge badge-success">Allocated</span>
                      : <span className="badge badge-gray">Not Yet</span>}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 700 }}>
                    {a.admissionNumber || <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
