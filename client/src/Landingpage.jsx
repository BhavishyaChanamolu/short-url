import React, { useState, useRef, useEffect } from 'react';
import './Landingpage.css';
import QRCodeCanvas from 'react-qr-code';
import { FaQrcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "https://short-url-backend-rphz.onrender.com";

const LandingPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [slideLandingUp, setSlideLandingUp] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [qrVisibility, setQrVisibility] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [historyLinks, setHistoryLinks] = useState([]);

  const qrRefs = useRef([]);
  qrRefs.current = historyLinks.map((_, i) => qrRefs.current[i] ?? React.createRef());

  const canCreateMore = historyLinks.length < 3;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    } else {
      setIsLoggedIn(true);
      fetch(`${BACKEND_URL}/shorten/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.urls) {
            const linksWithFullUrl = data.urls.map(link => ({
              ...link,
              shortUrl: `${BACKEND_URL}/${link.shortUrl}`,
            }));
            setHistoryLinks(linksWithFullUrl);
          }
        })
        .catch(err => {
          console.error("Failed to load history:", err);
        });
    }
  }, [navigate]);

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleAnalytics = () => setShowAnalytics(!showAnalytics);
  const handleGetStarted = () => setSlideLandingUp(true);

  const handleShorten = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to generate short URLs.");
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${BACKEND_URL}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ longUrl: inputUrl, customAlias }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || res.statusText);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.shortUrl) {
          const fullShortUrl = `${BACKEND_URL}/${data.shortUrl}`;
          setShortUrl(fullShortUrl);
          setHistoryLinks(prev => [{
            originalUrl: data.originalUrl,
            shortUrl: fullShortUrl,
            createdAt: data.createdAt
          }, ...prev]);
        } else {
          alert("No shortUrl in response");
        }
      })
      .catch(err => {
        alert("Failed to shorten URL: " + err.message);
      });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDownloadQR = (ref) => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

      const link = document.createElement("a");
      link.href = imgURI;
      link.download = "short-url.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = url;
  };

  return (
    <div className={darkMode ? 'lp-hero lp-dark' : 'lp-hero lp-light'}>
      {slideLandingUp && (
        <header className="lp-navbar">
          <div className="lp-nav-left">Shortenit</div>
          <nav className="lp-nav-right">
            {!isLoggedIn ? (
              <>
                <button onClick={() => navigate('/login')} className="lp-nav-btn">Login</button>
                <button onClick={() => navigate('/signup')} className="lp-nav-btn">SignUp</button>
              </>
            ) : (
              <div className="lp-profile-container" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <span className="lp-profile-icon">👤</span>
                {showProfileDropdown && (
                  <div className="lp-profile-dropdown">
                    <button
                      className="lp-logout-btn"
                      onClick={() => {
                        localStorage.removeItem("token");
                        setIsLoggedIn(false);
                        navigate("/login", { replace: true });
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            <button className="lp-analytics-btn" onClick={toggleAnalytics}> Analytics</button>
          </nav>
        </header>
      )}

      <div className={`lp-landing ${slideLandingUp ? 'lp-slide-up' : ''}`}>
        <h1 className="lp-main-title">Shortenit</h1>
        <div className="lp-flowchart">
          <div className="lp-flow-step">1️⃣ Enter the long URL</div>
          <div className="lp-flow-step">2️⃣ Choose custom alias</div>
          <div className="lp-flow-step">3️⃣ Generate short URL</div>
        </div>
        <button className="lp-get-started-btn" onClick={handleGetStarted}>Get Started</button>
      </div>

      <div className={`lp-card ${slideLandingUp ? 'lp-visible' : 'lp-hidden'}`}>
        <h1 className="lp-title">Shorten your URLs</h1>
        <p className="lp-subtitle">Easy sharing and tracking with stylish links.</p>

        <div className="lp-form-group">
          {!shortUrl ? (
            <>
              <input
                type="text"
                placeholder="Enter your long URL here"
                className="lp-input"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Custom short string (optional)"
                className="lp-input"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
              <button className="lp-shorten-btn" onClick={handleShorten}>
                🚀 Shorten URL
              </button>
            </>
          ) : (
            <>
              <div className="lp-output-url">
                🔗 Shortened URL:{' '}
                <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                  {shortUrl.replace(`${BACKEND_URL}/`, "short/")}
                </a>
                <span className="lp-copy-icon" onClick={() => handleCopy(shortUrl)}>📋</span>
              </div>

              <div className="lp-qr-container" ref={qrRefs.current[0]}>
                <QRCodeCanvas value={shortUrl} size={160} fgColor="#000000" bgColor="#ffffff" />
                <button className="lp-download-btn" onClick={() => handleDownloadQR(qrRefs.current[0])}>
                  ⬇️ Download QR Code
                </button>
              </div>

              {canCreateMore ? (
                <button
                  className="lp-shorten-btn"
                  onClick={() => {
                    setShortUrl('');
                    setInputUrl('');
                    setCustomAlias('');
                  }}
                >
                  ➕ Create another short URL
                </button>
              ) : (
                <p style={{ color: 'red', marginTop: '1rem' }}>
                  ⚠️ You have reached the maximum of 3 short URLs.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`lp-analytics-panel ${showAnalytics ? 'lp-open' : ''}`}>
        <button className="lp-close-btn" onClick={toggleAnalytics}>❌</button>
        <h2>User History</h2>
        <ul>
          {historyLinks.map((link, index) => (
            <li key={index}>
              <div><strong>Original:</strong> {link.originalUrl}</div>
              <div><strong>Time:</strong> {new Date(link.createdAt).toLocaleString()}</div>
              <div>
                <strong>Short:</strong>{' '}
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "white" }}
                >
                  {link.shortUrl.replace(`${BACKEND_URL}/`, "short/")}
                </a>
                <span className="lp-copy-icon" onClick={() => handleCopy(link.shortUrl)}>📋</span>
              </div>
              <div className="lp-qr-trigger-inline" onClick={() => setQrVisibility(qrVisibility === index ? null : index)}>
                <FaQrcode style={{ fontSize: '1.2rem' }} />
                <span className="lp-qr-text-inline">Show QR</span>
              </div>
              {qrVisibility === index && (
                <div className="lp-qr-container" ref={qrRefs.current[index]}>
                  <QRCodeCanvas value={link.shortUrl} size={140} fgColor="#000000" bgColor="#ffffff" />
                  <button className="lp-download-btn" onClick={() => handleDownloadQR(qrRefs.current[index])}>
                    ⬇️ Download QR
                  </button>
                </div>
              )}
              <hr style={{ margin: '1rem 0', borderColor: '#ffffff30' }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LandingPage;
