import { Panel } from "primereact/panel";
import { Avatar } from "primereact/avatar";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import "./Profil.css";

function Profil() {
  const navigate = useNavigate();
  const profileData = {
    name: "Max Mustermann",
    email: "max@mustermann.de",
    avatar: "https://via.placeholder.com/150",
    bio: "Dies ist ein Beispielprofil mit Dummy-Daten. Hier kannst du deine Informationen präsentieren."
  };

  const handleLogout = () => {
    // Here you can add your logout logic (e.g., clear tokens, session, etc.)
    navigate('/');
  };

  return (
    <div className="profil-container">
      <Panel header="Profil" className="profil-panel">
        <div className="profil-header">
          <Avatar image={profileData.avatar} shape="circle" size="xlarge" className="profil-avatar" />
          <h2 className="profil-name">{profileData.name}</h2>
        </div>
        <div className="profil-data">
          <p className="profil-email">
            <strong>Email:</strong> {profileData.email}
          </p>
          <p className="profil-bio">{profileData.bio}</p>
          <div className="profil-actions">
            <Button 
              color="secondary" 
              size="medium" 
              onClick={handleLogout}
            >
              Ausloggen
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default Profil;
