import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

function InstitutionsTab() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', address: '' });

  useEffect(() => {
    API.get('/masters/institutions').then(r => setList(r.data));
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.code) return toast.error('Name and code are required.');
    try {
      const { data } = await API.post('/masters/institutions', form);
      setList([...list, data.institution]);
      setForm({ name: '', code: '', address: '' });
      toast.success('Institution created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create institution.');
    }
  };

  return (
    <div>
      <div className="card section-gap">
        <div className="card-header">
          <h3 className="card-title">Add New Institution</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Institution Name *</label>
            <input className="form-input" placeholder="e.g. ABC Engineering College"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Short Code * (used in admission numbers)</label>
            <input className="form-input" placeholder="e.g. ABCEC"
              value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" placeholder="City, State"
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary mt-4" onClick={handleSubmit}>
          + Add Institution
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">All Institutions ({list.length})</h3></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Code</th><th>Address</th><th>Created</th></tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No institutions yet</td></tr>
              ) : list.map(inst => (
                <tr key={inst._id}>
                  <td style={{ fontWeight: 600 }}>{inst.name}</td>
                  <td><span className="badge badge-info">{inst.code}</span></td>
                  <td>{inst.address || '—'}</td>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(inst.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CampusesTab() {
  const [list, setList]         = useState([]);
  const [institutions, setInst] = useState([]);
  const [form, setForm]         = useState({ name: '', institution: '' });

  useEffect(() => {
    API.get('/masters/campuses').then(r => setList(r.data));
    API.get('/masters/institutions').then(r => setInst(r.data));
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.institution) return toast.error('All fields are required.');
    try {
      const { data } = await API.post('/masters/campuses', form);
      setList([...list, data.campus]);
      setForm({ name: '', institution: '' });
      toast.success('Campus created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div>
      <div className="card section-gap">
        <div className="card-header"><h3 className="card-title">Add New Campus</h3></div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Campus Name *</label>
            <input className="form-input" placeholder="e.g. Main Campus"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Institution *</label>
            <select className="form-select"
              value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })}>
              <option value="">Select Institution</option>
              {institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-4" onClick={handleSubmit}>+ Add Campus</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">All Campuses ({list.length})</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Campus</th><th>Institution</th><th>Created</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>No campuses yet</td></tr>
              ) : list.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.institution?.name || '—'}</td>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DepartmentsTab() {
  const [list, setList]         = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [form, setForm]         = useState({ name: '', campus: '' });

  useEffect(() => {
    API.get('/masters/departments').then(r => setList(r.data));
    API.get('/masters/campuses').then(r => setCampuses(r.data));
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.campus) return toast.error('All fields are required.');
    try {
      const { data } = await API.post('/masters/departments', form);
      setList([...list, data.department]);
      setForm({ name: '', campus: '' });
      toast.success('Department created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div>
      <div className="card section-gap">
        <div className="card-header"><h3 className="card-title">Add New Department</h3></div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input className="form-input" placeholder="e.g. Computer Science & Engineering"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Campus *</label>
            <select className="form-select"
              value={form.campus} onChange={e => setForm({ ...form, campus: e.target.value })}>
              <option value="">Select Campus</option>
              {campuses.map(c => <option key={c._id} value={c._id}>{c.name} — {c.institution?.name}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-4" onClick={handleSubmit}>+ Add Department</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">All Departments ({list.length})</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Department</th><th>Campus</th><th>Institution</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>No departments yet</td></tr>
              ) : list.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.campus?.name || '—'}</td>
                  <td>{d.campus?.institution?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProgramsTab() {
  const [programs, setPrograms]   = useState([]);
  const [depts, setDepts]         = useState([]);
  const [quotaError, setQuotaError] = useState('');
  const [form, setForm] = useState({
    name: '', code: '', department: '',
    academicYear: '2026-27', courseType: 'UG', entryType: 'Regular',
    totalIntake: '',
    quotas: [
      { name: 'KCET',       totalSeats: '' },
      { name: 'COMEDK',     totalSeats: '' },
      { name: 'Management', totalSeats: '' },
    ],
    supernumerarySeats: 0,
  });

  useEffect(() => {
    API.get('/masters/programs').then(r => setPrograms(r.data));
    API.get('/masters/departments').then(r => setDepts(r.data));
  }, []);

  const updateQuota = (index, value) => {
    const updatedQuotas = [...form.quotas];
    updatedQuotas[index] = { ...updatedQuotas[index], totalSeats: value };
    const total = updatedQuotas.reduce((sum, q) => sum + (Number(q.totalSeats) || 0), 0);
    setQuotaError(
      form.totalIntake && total !== Number(form.totalIntake)
        ? `Quota total (${total}) must equal intake (${form.totalIntake})`
        : ''
    );
    setForm({ ...form, quotas: updatedQuotas });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.department || !form.totalIntake) {
      return toast.error('Please fill all required fields.');
    }
    const quotaTotal = form.quotas.reduce((sum, q) => sum + (Number(q.totalSeats) || 0), 0);
    if (quotaTotal !== Number(form.totalIntake)) {
      return toast.error(`Quota total (${quotaTotal}) must equal intake (${form.totalIntake}).`);
    }
    try {
      const { data } = await API.post('/masters/programs', {
        ...form,
        totalIntake: Number(form.totalIntake),
        quotas: form.quotas.map(q => ({ ...q, totalSeats: Number(q.totalSeats) })),
      });
      setPrograms([...programs, data.program]);
      toast.success(`Program "${data.program.name}" created!`);
      setForm({ ...form, name: '', code: '', totalIntake: '', quotas: [
        { name: 'KCET', totalSeats: '' }, { name: 'COMEDK', totalSeats: '' }, { name: 'Management', totalSeats: '' }
      ]});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create program.');
    }
  };

  const quotaTotal = form.quotas.reduce((sum, q) => sum + (Number(q.totalSeats) || 0), 0);

  return (
    <div>
      <div className="card section-gap">
        <div className="card-header"><h3 className="card-title">Add New Program</h3></div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Program Name *</label>
            <input className="form-input" placeholder="e.g. B.E. Computer Science"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Program Code * (used in admission no.)</label>
            <input className="form-input" placeholder="e.g. CSE"
              value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-select"
              value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
              <option value="">Select Department</option>
              {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Academic Year *</label>
            <input className="form-input" placeholder="2026-27"
              value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Course Type *</label>
            <select className="form-select"
              value={form.courseType} onChange={e => setForm({ ...form, courseType: e.target.value })}>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Entry Type *</label>
            <select className="form-select"
              value={form.entryType} onChange={e => setForm({ ...form, entryType: e.target.value })}>
              <option value="Regular">Regular</option>
              <option value="Lateral">Lateral</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Intake *</label>
            <input className="form-input" type="number" placeholder="e.g. 120"
              value={form.totalIntake} onChange={e => setForm({ ...form, totalIntake: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Supernumerary Seats</label>
            <input className="form-input" type="number" placeholder="0"
              value={form.supernumerarySeats}
              onChange={e => setForm({ ...form, supernumerarySeats: Number(e.target.value) })} />
          </div>
        </div>
        <div style={{
          marginTop: 20, padding: 16,
          background: '#f8faff', borderRadius: 8, border: '1.5px solid #dbeafe'
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e3a8a', marginBottom: 12 }}>
            📊 Quota Distribution
            <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
              (Total must equal intake: {form.totalIntake || '?'})
            </span>
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {form.quotas.map((q, idx) => (
              <div key={q.name} className="form-group" style={{ minWidth: 150 }}>
                <label className="form-label">{q.name} Seats *</label>
                <input className="form-input" type="number" placeholder="0"
                  value={q.totalSeats} onChange={e => updateQuota(idx, e.target.value)} />
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 10,
            fontSize: '0.85rem',
            color: quotaError ? '#dc2626' : '#16a34a',
            fontWeight: 600,
          }}>
            {quotaError
              ? `❌ ${quotaError}`
              : form.totalIntake
                ? quotaTotal === Number(form.totalIntake)
                  ? `✅ Quota total (${quotaTotal}) matches intake`
                  : `⚠️ Quota total: ${quotaTotal} / ${form.totalIntake}`
                : ''}
          </div>
        </div>

        <button className="btn btn-primary mt-4" onClick={handleSubmit}>
          + Create Program
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">All Programs ({programs.length})</h3></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Program</th><th>Code</th><th>Type</th><th>Year</th><th>Intake</th><th>Quotas</th></tr>
            </thead>
            <tbody>
              {programs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>No programs yet</td></tr>
              ) : programs.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="badge badge-info">{p.code}</span></td>
                  <td><span className="badge badge-gray">{p.courseType} · {p.entryType}</span></td>
                  <td>{p.academicYear}</td>
                  <td style={{ fontWeight: 700, color: '#1d4ed8' }}>{p.totalIntake}</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {p.quotas.map(q => (
                      <span key={q.name} style={{ marginRight: 8, color: '#374151' }}>
                        {q.name}: {q.filledSeats}/{q.totalSeats}
                      </span>
                    ))}
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

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'admission_officer' });

  useEffect(() => {
    API.get('/masters/users').then(r => setUsers(r.data));
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields required.');
    try {
      const { data } = await API.post('/masters/users', form);
      setUsers([...users, data.user]);
      setForm({ name: '', email: '', password: '', role: 'admission_officer' });
      toast.success('User created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const roleColors = {
    admin: 'badge-warning',
    admission_officer: 'badge-success',
    management: 'badge-info',
  };

  return (
    <div>
      <div className="card section-gap">
        <div className="card-header"><h3 className="card-title">Add New User</h3></div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="John Smith"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="john@college.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select"
              value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="admission_officer">Admission Officer</option>
              <option value="management">Management (View Only)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-4" onClick={handleSubmit}>+ Add User</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">All Users ({users.length})</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: '#6b7280' }}>{u.email}</td>
                  <td><span className={`badge ${roleColors[u.role]}`}>{u.role.replace('_', ' ')}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'institutions', label: '🏛️ Institutions' },
  { key: 'campuses',     label: '🏫 Campuses' },
  { key: 'departments',  label: '🏢 Departments' },
  { key: 'programs',     label: '📚 Programs' },
  { key: 'users',        label: '👤 Users' },
];

export default function Masters() {
  const [activeTab, setActiveTab] = useState('institutions');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Master Setup</h1>
          <p className="page-subtitle">
            Set up the college hierarchy in order: Institution → Campus → Department → Program
          </p>
        </div>
      </div>
      <div className="alert alert-info section-gap">
        <strong>Setup Order:</strong>&nbsp;
        Create an Institution first, then a Campus inside it, then a Department inside the campus,
        and finally a Program inside the department. Each step depends on the previous one.
      </div>
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        borderBottom: '2px solid #e5e7eb', paddingBottom: 0,
      }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color:      activeTab === tab.key ? '#1d4ed8' : '#6b7280',
              borderBottom: activeTab === tab.key ? '2px solid #1d4ed8' : '2px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'institutions' && <InstitutionsTab />}
      {activeTab === 'campuses'     && <CampusesTab />}
      {activeTab === 'departments'  && <DepartmentsTab />}
      {activeTab === 'programs'     && <ProgramsTab />}
      {activeTab === 'users'        && <UsersTab />}
    </div>
  );
}
