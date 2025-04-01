import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h4>GetIntoMealPrep</h4>
          <p>© {new Date().getFullYear()} – Alle Rechte vorbehalten</p>
        </div>
        <div>
          <h4>Links</h4>
          <ul>
            <li><a href="#">Datenschutz</a></li>
            <li><a href="#">Impressum</a></li>
            <li><a href="#">Kontakt</a></li>
          </ul>
        </div>
        <div>
          <h4>Folge uns</h4>
          <ul className="socials">
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="#">GitHub</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
