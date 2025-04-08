import { Avatar } from "primereact/avatar";
import Button from "../../components/Button/Button";
import logtoConfig from "../../config/logtoConfig";
import { useLogto } from "@logto/react";
import { useEffect, useState } from "react";
import "./Profil.css";

interface ProfileData {
  name: string;
  email: string;
  avatar: string;
}

function Profil() {
  const { signOut, getIdTokenClaims, isAuthenticated } = useLogto();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const handleLogout = async () => {
    signOut(logtoConfig.logoutRedirectUri);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        const claims = await getIdTokenClaims();
        console.log(claims);

        const name = (claims?.name as string) ?? "Kein Name";
        const email = (claims?.email as string) ?? "Keine E-Mail";
        const avatar = (claims?.picture as string) ?? "https://via.placeholder.com/150";

        setProfileData({
          name,
          email,
          avatar
        });
      }
    };

    fetchProfile();
  }, [getIdTokenClaims, isAuthenticated]);

  if (!profileData) {
    return <div>Lade Profil...</div>;
  }

  return (
    <div className="profil-wrapper">
      <div className="profil-container">
        <div className="custom-panel">
          <div className="custom-panel-header">Mein Profil</div>
          <div className="profil-header">
            <Avatar
              image={profileData.avatar}
              shape="circle"
              size="xlarge"
              className="profil-avatar"
            />
            <h2 className="profil-name">{profileData.name}</h2>
          </div>
          <div className="profil-data">
            <p><strong>Email:</strong> {profileData.email}</p>
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
