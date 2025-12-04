
import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const API_BASE_URL = "https://4d8lc0i0a1.execute-api.ap-south-1.amazonaws.com/dev"; 


const styles = {
  screen: { width: "100vw", minHeight: "100vh", padding: "40px 20px", boxSizing: "border-box", color: "#333", backgroundColor: "#f9f9f9" },
  container: { maxWidth: "700px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" },
  input: { padding: "10px", margin: "10px 0", width: "100%", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", backgroundColor: "white" },
  textarea: { padding: "10px", margin: "10px 0", width: "100%", borderRadius: "5px", border: "1px solid #ccc", minHeight: "80px", boxSizing: "border-box", backgroundColor: "white" },
  button: { padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", margin: "10px 5px" },
  card: { border: "1px solid #ddd", borderRadius: "8px", padding: "20px", margin: "20px 0", textAlign: "left", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  tabActive: { borderBottom: "3px solid #007bff", fontWeight: "bold", color: "#007bff", cursor: "pointer", padding: "0 10px" },
  tabInactive: { color: "#555", cursor: "pointer", padding: "0 10px" },
  nav: { display: "flex", justifyContent: "space-around", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("interview"); 
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  
  const webcamRef = useRef(null);

  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState([]);

  const [resumeData, setResumeData] = useState({ name: "", email: "", skills: "", experience: "" });
  const [pdfUrl, setPdfUrl] = useState(null);

  const [verifyReport, setVerifyReport] = useState(null);

  const handleLogin = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setStatus("Verifying face...");
    try {
      await axios.post(`${API_BASE_URL}/login`, { image: imageSrc });
      setStatus("Login Successful!");
      setTimeout(() => setIsLoggedIn(true), 1500);
    } catch (error) {
      setStatus("Login Failed.");
    }
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
      const base64String = reader.result;
      setLoading(true);
      setVerifyReport(null);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/verify`, { file_data: base64String });
        let data = response.data;
        if (typeof data === "string") data = JSON.parse(data);
        setVerifyReport(data);
      } catch (error) {
        console.error(error);
        alert("Verification failed. Make sure you upload an IMAGE (jpg/png), not a PDF.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.screen}>
    <div style={styles.container}>
      {!isLoggedIn && (
        <div>
          <h1>Career Copilot</h1>
          <div style={{ border: "5px solid #333", display: "inline-block", borderRadius: "10px", overflow: "hidden" }}>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={480} height={360} />
          </div>
          <br /><button style={styles.button} onClick={handleLogin}>Login with Face ID</button>
          <p>{status}</p>
        </div>
      )}

      {isLoggedIn && (
        <div>
          <div style={styles.nav}>
            <span style={activeTab === "interview" ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab("interview")}>🎙️ Interview</span>
            <span style={activeTab === "resume" ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab("resume")}>📄 Resume</span>
            <span style={activeTab === "verify" ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab("verify")}>🔍 Verify Docs</span>
          </div>

          {activeTab === "interview" && (
            <div>
              <div style={styles.card}>
                <input style={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
                <input style={styles.input} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
                <button style={styles.button} onClick={handleGenerateQuestions} disabled={loading}>{loading ? "..." : "Generate Questions"}</button>
              </div>
              {questions.map((q, i) => <div key={i} style={styles.card}><h3>Q{i+1}: {q.q}</h3><p>💡 {q.a}</p></div>)}
            </div>
          )}

          {activeTab === "resume" && (
            <div>
              <div style={styles.card}>
                <input style={styles.input} value={resumeData.name} onChange={(e) => setResumeData({...resumeData, name: e.target.value})} placeholder="Name" />
                <input style={styles.input} value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} placeholder="Email" />
                <textarea style={styles.textarea} value={resumeData.skills} onChange={(e) => setResumeData({...resumeData, skills: e.target.value})} placeholder="Skills" />
                <textarea style={styles.textarea} value={resumeData.experience} onChange={(e) => setResumeData({...resumeData, experience: e.target.value})} placeholder="Experience" />
                <button style={styles.button} onClick={handleGenerateResume} disabled={loading}>{loading ? "..." : "Generate PDF"}</button>
              </div>
              {pdfUrl && <div style={{...styles.card, backgroundColor: "#e8f5e9"}}><a href={pdfUrl} target="_blank">⬇️ Download Resume</a></div>}
            </div>
          )}

          {activeTab === "verify" && (
            <div>
              <h2>Document Verification</h2>
              <div style={styles.card}>
                <p>Upload a photo of your certificate/marksheet (JPG/PNG only):</p>
                <input type="file" accept="image/*" onChange={handleVerifyUpload} disabled={loading} />
                {loading && <p>Analyzing document...</p>}
              </div>
              
              {verifyReport && (
                <div style={{...styles.card, borderLeft: verifyReport.is_valid_document ? "5px solid green" : "5px solid red"}}>
                  <h3>Verification Report</h3>
                  <p><strong>Status:</strong> {verifyReport.is_valid_document ? "Valid" : "Suspicious"}</p>
                  <p><strong>Score:</strong> {verifyReport.credibility_score}/100</p>
                  <p><strong>Type:</strong> {verifyReport.document_type}</p>
                  <p><strong>AI Reasoning:</strong> {verifyReport.reason}</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
    </div>
  );
};

export default App;