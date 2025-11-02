import React from 'react';
import './AdminDashboard.css';

const Report: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [image, setImage] = React.useState<string | null>(null);

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    // UI-only demo
    alert('Report sent (demo)');
  };

  return (
    <div className="ad-add">
      <header className="ad-header">
        <h1 className="ad-title">Create Report</h1>
        <div className="ad-profile" />
      </header>

      <form className="ad-form" onSubmit={onSubmit}>
        <div className="ad-form-grid">
          <div className="ad-form-left">
            <label className="ad-label" htmlFor="r-title">Title</label>
            <input id="r-title" className="ad-input" placeholder="Enter title" value={title} onChange={(e)=>setTitle(e.target.value)} />

            <label className="ad-label" htmlFor="r-desc">Description</label>
            <textarea id="r-desc" className="ad-input ad-textarea" placeholder="Describe the issue or feedback" value={desc} onChange={(e)=>setDesc(e.target.value)} />
          </div>

          <div className="ad-form-right">
            <div className="ad-upload-row">
              <div className="ad-upload">
                {image ? (
                  <img src={image} alt="evidence" className="ad-upload-preview" />
                ) : (
                  <div className="ad-upload-empty">
                    <div className="ad-upload-ico">⬆️</div>
                  </div>
                )}
                <input className="ad-upload-input" type="file" accept="image/*" onChange={onPick} />
              </div>
              <div>
                <div className="ad-upload-label">Upload image</div>
                <div style={{ color:'#9ca3af', fontSize:12, marginTop:6 }}>for evidence or visual context (Optional)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button type="submit" className="ad-btn ad-btn-primary">Send</button>
        </div>
      </form>
    </div>
  );
};

export default Report;
