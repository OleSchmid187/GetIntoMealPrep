import { Avatar } from "primereact/avatar";
import Button from "../../components/Button/Button";
import logtoConfig from "../../config/logtoConfig";
import { useLogto } from "@logto/react";
import { FaUserCircle } from "react-icons/fa";
import { useProfileData } from "../../utils/useProfileData";
import "./Profil.css";

function Profil() {
  const { signOut } = useLogto();
  const { profileData, loading, error } = useProfileData();

  const handleLogout = () => {
    signOut(logtoConfig.logoutRedirectUri);
  };

  if (loading) {
    return <div>Lade Profil...</div>;
  }

  if (error || !profileData) {
    return <div>Fehler beim Laden des Profils</div>;
  }

  return (
    <div className="profil-wrapper">
      <div className="profil-container">
        <div className="custom-panel">
          <div className="custom-panel-header">Mein Profil</div>
          <div className="profil-header">
            <Avatar
              icon={<FaUserCircle />}
              shape="circle"
              size="xlarge"
              className="profil-avatar-icon"
            />
            <h2 className="profil-name">{profileData.username}</h2>
          </div>
          <div className="profil-data">
            <p>
              <strong>Email:</strong> {profileData.email}
            </p>
            <p>
              <strong>Erstellt am:</strong> {profileData.createdAt}
            </p>
            <div className="profil-actions">
              <Button color="primary" size="medium" onClick={handleLogout}>
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
