import { Avatar } from "primereact/avatar";
import Button from "../../components/Button/Button";
import logtoConfig from "../../config/logtoConfig";
import { useLogto } from "@logto/react";
import "./Profil.css";

function Profil() {
  const { signOut } = useLogto();

  const profileData = {
    name: "Max Mustermann",
    email: "max@mustermann.de",
    avatar: "https://via.placeholder.com/150",
    bio: "Dies ist ein Beispielprofil mit Dummy-Daten. Hier kannst du deine Informationen präsentieren."
  };

  const handleLogout = async () => {
    signOut(logtoConfig.logoutRedirectUri);
  };

  return (
    <div className="profil-wrapper">
      <div className="profil-container">
        <div className="custom-panel">
          <div className="custom-panel-header">Mein Profil</div>
          <div className="profil-header">
            <Avatar image={profileData.avatar} shape="circle" size="xlarge" className="profil-avatar" />
            <h2 className="profil-name">{profileData.name}</h2>
          </div>
          <div className="profil-data">
            <p><strong>Email:</strong> {profileData.email}</p>
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
        </div>
      </div>
    </div>
  );
}

export default Profil;
