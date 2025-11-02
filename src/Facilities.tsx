import React from 'react';
import './AdminDashboard.css';
import { IconEdit, IconTrash, IconSearch, IconPlus } from './icons';

type Facility = {
  id: number;
  name: string;
  type: 'Gate' | 'Office' | 'Room' | 'Academic' | 'Laboratory';
  updated: string; // formatted date
};

const DUMMY_FACILITIES: Facility[] = [
  { id: 1, name: 'Main Gate', type: 'Gate', updated: 'Oct 23, 2024' },
  { id: 2, name: 'Registrar', type: 'Office', updated: 'Sept 1, 2024' },
  { id: 3, name: 'Room 203', type: 'Room', updated: 'Dec 29, 2024' },
  { id: 4, name: 'Library', type: 'Academic', updated: 'Jul 23, 2024' },
  { id: 5, name: 'Computer Lab', type: 'Laboratory', updated: 'Jul 28, 2025' },
];

const Facilities: React.FC = () => {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DUMMY_FACILITIES;
    return DUMMY_FACILITIES.filter(
      f => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="ad-fac">
      <header className="ad-header">
        <h1 className="ad-title">Facilities Management</h1>
        <button type="button" className="ad-btn ad-btn-accent" onClick={()=> (window.location.hash = '#/add-facilities')}>
          <span className="ad-btn-ico"><IconPlus size={16} stroke="#fff" /></span>
          <span>Add new facilities</span>
        </button>
      </header>

      <div className="ad-search">
        <span className="ad-search-ico" aria-hidden>
          <IconSearch size={16} />
        </span>
        <input
          className="ad-search-input"
          placeholder="Search Facilities"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="ad-table-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Facility name</th>
              <th>Type</th>
              <th>Last Updated</th>
              <th className="ad-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.type}</td>
                <td>{f.updated}</td>
                <td className="ad-actions">
                  <button className="ad-icon-btn edit" title="Edit" type="button"><IconEdit size={16} /></button>
                  <button className="ad-icon-btn danger" title="Delete" type="button"><IconTrash size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Facilities;
