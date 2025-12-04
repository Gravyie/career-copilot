import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";

// --- GLOBAL ANIMATIONS & FONTS ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600&display=swap');
    
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #fbfbfd;
      color: #1d1d1f;
      -webkit-font-smoothing: antialiased;
    }

    /* Apple-style Smooth Fade In */
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .animate-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    /* Button Press Effect */
    .btn-apple:active { transform: scale(0.96); }
    
    /* Input Focus Transition */
    .input-apple:focus { 
      border-color: #0071e3; 
      box-shadow: 0 0 0 4px rgba(0,113,227, 0.15); 
      outline: none;
    }

    /* Glass Card */
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
    }
  `}</style>
);

const API_BASE_URL = "https://4d8lc0i0a1.execute-api.ap-south-1.amazonaws.com/dev";

const App = () => {
  // STATE (Logic remains exactly the same)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("interview");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  
  // Feature 1
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState([]);

  // Feature 2
  const [resumeData, setResumeData] = useState({ name: "", email: "", skills: "", experience: "" });
  const [pdfUrl, setPdfUrl] = useState(null);

  // Feature 3
  const [verifyReport, setVerifyReport] = useState(null);

  // LOGIC HANDLERS
  const handleLogin = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setStatus("Verifying Identity...");
    try {
      await axios.post(`${API_BASE_URL}/login`, { image: imageSrc });
      setStatus("Success");
      setTimeout(() => setIsLoggedIn(true), 1200);
    } catch (error) { setStatus("Face Not Recognized"); }
  }, [webcamRef]);

  const handleGenerateQuestions = async () => {
    setLoading(true); setQuestions([]);
    try {
      const response = await axios.post(`${API_BASE_URL}/interview`, { role, company });
      let data = response.data;
      if (typeof data === "string") data = JSON.parse(data);
      setQuestions(data.questions);
    } catch (error) { alert("Error generating questions"); }
    finally { setLoading(false); }
  };

  const handleGenerateResume = async () => {
    setLoading(true); setPdfUrl(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/resume`, resumeData);
      setPdfUrl(response.data.pdf_url);
    } catch (error) { alert("Error generating resume"); }
    finally { setLoading(false); }
  };

  const handleVerifyUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true); setVerifyReport(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/verify`, { file_data: reader.result });
        let data = response.data;
        if (typeof data === "string") data = JSON.parse(data);
        setVerifyReport(data);
      } catch (error) { alert("Verification failed."); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  // --- APPLE STYLE SYSTEM ---
  const s = {
    screen: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      background: "#f5f5f7", // Apple's light grey background
      padding: "40px 20px"
    },
    container: {
      width: "100%",
      maxWidth: "800px",
    },
    heroHeader: {
      textAlign: "center",
      marginBottom: "40px"
    },
    title: {
      fontSize: "48px",
      fontWeight: "700",
      letterSpacing: "-0.02em",
      background: "linear-gradient(180deg, #1d1d1f 0%, #434344 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: "0 0 10px 0"
    },
    subtitle: {
      fontSize: "20px",
      color: "#86868b",
      fontWeight: "400"
    },
    loginCard: {
      padding: "40px",
      borderRadius: "24px",
      textAlign: "center"
    },
    webcamFrame: {
      width: "480px",
      height: "360px",
      margin: "0 auto 20px auto",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
      border: "1px solid rgba(0,0,0,0.05)",
      position: "relative"
    },
    btnPrimary: {
      background: "#0071e3",
      color: "white",
      border: "none",
      padding: "12px 24px",
      fontSize: "17px",
      fontWeight: "500",
      borderRadius: "980px", // Pill shape
      cursor: "pointer",
      transition: "transform 0.1s ease",
      boxShadow: "0 4px 12px rgba(0, 113, 227, 0.2)"
    },
    navBar: {
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      background: "rgba(230, 230, 235, 0.6)",
      padding: "5px",
      borderRadius: "980px",
      width: "fit-content",
      margin: "0 auto 40px auto",
      backdropFilter: "blur(10px)"
    },
    navItem: (isActive) => ({
      padding: "8px 20px",
      borderRadius: "980px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      color: isActive ? "#1d1d1f" : "#6e6e73",
      background: isActive ? "white" : "transparent",
      boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
      transition: "all 0.3s ease"
    }),
    card: {
      padding: "32px",
      borderRadius: "20px",
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: "600",
      color: "#86868b",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    input: {
      width: "100%",
      padding: "16px",
      fontSize: "17px",
      borderRadius: "12px",
      border: "1px solid #d2d2d7",
      background: "rgba(255,255,255,0.8)",
      marginBottom: "20px",
      boxSizing: "border-box",
      transition: "all 0.2s ease"
    },
    resultCard: {
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      border: "1px solid rgba(0,0,0,0.04)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={s.screen}>
        <div style={s.container}>
          
          <div style={s.heroHeader} className="animate-in">
            <div style={s.title}>
              <img src="/public/logo.png" alt="Logo" style={{ width: "48px", verticalAlign: "bottom", marginRight: "12px" }} />
              Career Copilot
            </div>
            <p style={s.subtitle}>Your AI-powered career accelerator.</p>
          </div>

          {!isLoggedIn ? (
            <div className="glass-card animate-in" style={s.loginCard}>
              <div style={s.webcamFrame}>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <p style={{ color: status === "Success" ? "#28cd41" : "#86868b", fontWeight: "500", marginBottom: "20px" }}>
                {status || "Look at the camera to authenticate"}
              </p>
              <button className="btn-apple" style={s.btnPrimary} onClick={handleLogin}>
                Sign In with Face ID
              </button>
            </div>
          ) : (
            <div className="animate-in">
              {/* NAVIGATION PILL */}
              <div style={s.navBar}>
                {["interview", "resume", "verify"].map((tab) => (
                  <div key={tab} style={s.navItem(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                    {tab === "interview" && "Interview Prep"}
                    {tab === "resume" && "Resume Builder"}
                    {tab === "verify" && "Doc Verification"}
                  </div>
                ))}
              </div>

              {/* TAB 1: INTERVIEW */}
              {activeTab === "interview" && (
                <div className="animate-in">
                  <div className="glass-card" style={s.card}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <label style={s.label}>Target Role</label>
                        <input className="input-apple" style={s.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Product Manager" />
                      </div>
                      <div>
                        <label style={s.label}>Target Company</label>
                        <input className="input-apple" style={s.input} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Apple" />
                      </div>
                    </div>
                    <button className="btn-apple" style={{...s.btnPrimary, width: "100%"}} onClick={handleGenerateQuestions} disabled={loading}>
                      {loading ? "Thinking..." : "Generate Questions"}
                    </button>
                  </div>

                  {questions.map((q, i) => (
                    <div key={i} style={s.resultCard} className="animate-in">
                      <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: "600" }}>{q.q}</h3>
                      <p style={{ margin: 0, color: "#424245", lineHeight: "1.6", fontSize: "16px" }}>{q.a}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: RESUME */}
              {activeTab === "resume" && (
                <div className="animate-in">
                  <div className="glass-card" style={s.card}>
                    <label style={s.label}>Personal Details</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <input className="input-apple" style={s.input} value={resumeData.name} onChange={(e) => setResumeData({...resumeData, name: e.target.value})} placeholder="Full Name" />
                      <input className="input-apple" style={s.input} value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} placeholder="Email Address" />
                    </div>
                    
                    <label style={s.label}>Professional Profile</label>
                    <textarea className="input-apple" style={{...s.input, minHeight: "80px", fontFamily: "inherit"}} value={resumeData.skills} onChange={(e) => setResumeData({...resumeData, skills: e.target.value})} placeholder="Key Skills (e.g. Swift, UI Design...)" />
                    <textarea className="input-apple" style={{...s.input, minHeight: "120px", fontFamily: "inherit"}} value={resumeData.experience} onChange={(e) => setResumeData({...resumeData, experience: e.target.value})} placeholder="Work Experience..." />

                    <button className="btn-apple" style={{...s.btnPrimary, width: "100%"}} onClick={handleGenerateResume} disabled={loading}>
                      {loading ? "Generating..." : "Create PDF Resume"}
                    </button>
                  </div>

                  {pdfUrl && (
                    <div style={{...s.resultCard, textAlign: "center", border: "1px solid #34c759"}}>
                      <h3 style={{ color: "#34c759", marginBottom: "10px" }}>Ready for Download</h3>
                      <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ color: "#0071e3", textDecoration: "none", fontWeight: "500" }}>Download PDF ↗</a>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VERIFY */}
              {activeTab === "verify" && (
                <div className="animate-in">
                  <div className="glass-card" style={{...s.card, textAlign: "center"}}>
                    <div style={{ padding: "40px", border: "2px dashed #d2d2d7", borderRadius: "16px", cursor: "pointer" }}>
                      <p style={{ color: "#86868b", marginBottom: "20px" }}>Upload Certificate or Marksheet (JPG/PNG)</p>
                      <input type="file" accept="image/*" onChange={handleVerifyUpload} style={{ display: "none" }} id="fileUpload" />
                      <label htmlFor="fileUpload" className="btn-apple" style={{...s.btnPrimary, background: "#f5f5f7", color: "#1d1d1f", border: "1px solid #d2d2d7", boxShadow: "none"}}>
                        {loading ? "Scanning..." : "Choose File"}
                      </label>
                    </div>
                  </div>

                  {verifyReport && (
                    <div style={s.resultCard} className="animate-in">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h2 style={{ margin: 0, color: verifyReport.is_valid_document ? "#28cd41" : "#ff3b30" }}>
                          {verifyReport.is_valid_document ? "Verified Authentic" : "Potential Issues Detected"}
                        </h2>
                        <span style={{ fontSize: "24px", fontWeight: "700", color: "#1d1d1f" }}>{verifyReport.credibility_score}/100</span>
                      </div>
                      
                      <div style={{ background: "#f5f5f7", padding: "16px", borderRadius: "12px" }}>
                        <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#86868b", fontWeight: "600" }}>DOCUMENT TYPE</p>
                        <p style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "500" }}>{verifyReport.document_type}</p>
                        
                        <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#86868b", fontWeight: "600" }}>AI ANALYSIS</p>
                        <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.5" }}>{verifyReport.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default App;