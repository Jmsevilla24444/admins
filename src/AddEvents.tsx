import React from 'react';
import './AdminDashboard.css';
import { IconUpload } from './icons';

const AddEvents: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [datetime, setDatetime] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [cover, setCover] = React.useState<string | null>(null);

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) setCover(URL.createObjectURL(file));
  };

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    // UI-only: no actual submission
    alert('Event saved (demo)');
  };

  return (
    <div className="ad-add">

      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label className="ad-label" htmlFor="title">Event Title</label>
            <input id="title" className="ad-input" placeholder="Enter event title" value={title} onChange={(e)=>setTitle(e.target.value)} />

            <label className="ad-label" htmlFor="dt">Date & Time</label>
            <input id="dt" type="datetime-local" className="ad-input" value={datetime} onChange={(e)=>setDatetime(e.target.value)} />

            <label className="ad-label" htmlFor="loc">Location</label>
            <input id="loc" className="ad-input" placeholder="Enter location" value={location} onChange={(e)=>setLocation(e.target.value)} />

            <label className="ad-label" htmlFor="cat">Category</label>
            <select id="cat" className="ad-input" value={category} onChange={(e)=>setCategory(e.target.value)}>
              <option value="" disabled>Select Category</option>
              <option>Academic</option>
              <option>Sports</option>
              <option>Organization</option>
              <option>Holiday</option>
            </select>

          </div>

          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload">
              {cover ? (
                <img src={cover} alt="cover preview" className="ad-upload-preview" />
              ) : (
                <div className="ad-upload-empty">
                  <div className="ad-upload-ico"><IconUpload size={22} /></div>
                </div>
              )}
              <input className="ad-upload-input" type="file" accept="image/*" onChange={onPick} />
            </div>
              <div className="ad-upload-label">Upload image</div>
            </div>
            <div className="ad-help">Use a 4:3 image. Max 2MB. PNG or JPG.</div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button type="submit" className="ad-btn ad-btn-primary">Add</button>
          <button type="button" className="ad-btn" onClick={()=>window.location.hash = '#/dashboard'}>Cancel</button>
        </div>
      </form>

      <p className="ad-footnote">This added Event will be reviewed by the Super Admin before activation.</p>
    </div>
  );
};

export default AddEvents;
