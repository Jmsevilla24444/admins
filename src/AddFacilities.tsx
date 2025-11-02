import React from 'react';
import './AdminDashboard.css';
import { IconUpload } from './icons';

const AddFacilities: React.FC = () => {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('');
  const [image, setImage] = React.useState<string | null>(null);

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    alert('Facility added (demo)');
  };

  return (
    <div className="ad-add">
      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label htmlFor="fac-name" className="ad-label">Facility name</label>
            <input id="fac-name" className="ad-input" placeholder="Enter name" value={name} onChange={(e)=>setName(e.target.value)} />

            <label htmlFor="fac-type" className="ad-label">Type</label>
            <select id="fac-type" className="ad-input" value={type} onChange={(e)=>setType(e.target.value)}>
              <option value="" disabled>Select Type</option>
              <option>Gate</option>
              <option>Office</option>
              <option>Room</option>
              <option>Academic</option>
              <option>Laboratory</option>
            </select>
          </div>

          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload">
                {image ? (
                  <img src={image} alt="facility" className="ad-upload-preview" />
                ) : (
                  <div className="ad-upload-empty">
                    <IconUpload size={22} />
                  </div>
                )}
                <input className="ad-upload-input" type="file" accept="image/*" onChange={onPick} />
              </div>
              <div className="ad-upload-label">Upload image</div>
            </div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button type="submit" className="ad-btn ad-btn-primary">Add</button>
          <button type="button" className="ad-btn" onClick={()=> (window.location.hash = '#/facilities')}>Cancel</button>
        </div>
      </form>

      <p className="ad-footnote">This added Facility will be reviewed by the Super Admin before activation.</p>
    </div>
  );
};

export default AddFacilities;
