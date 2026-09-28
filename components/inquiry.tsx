"use client";
import { useState } from "react";
import { ArrowUpRight, Check, Download, LoaderCircle } from "lucide-react";
type Status = "idle" | "sending" | "sent" | "prepared" | "error";
export function Inquiry({
  dealer = false,
  connected = false,
  initialRegion = "Not sure yet",
}: {
  dealer?: boolean;
  connected?: boolean;
  initialRegion?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [region, setRegion] = useState(initialRegion);
  const [audience, setAudience] = useState(dealer ? "Dealer" : "Private buyer");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const text = `LOGISTIC HUB — VEHICLE INQUIRY\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "Not provided"}\nCustomer: ${audience}\nRegion: ${region}\n\nVehicle requirements:\n${data.message}\n`;
    setSummary(text);
    setError("");
    if (!connected) {
      setStatus("prepared");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, audience, region }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your inquiry could not be sent. Please try again.",
        );
      setStatus("sent");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect. Please try again.",
      );
      setStatus("error");
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "logistic-hub-inquiry.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="inquiry-section" id="inquiry">
      <div className="container inquiry-layout">
        <div className="inquiry-intro">
          <h2>
            Your next vehicle
            <br />
            starts with a<br />
            <span>conversation.</span>
          </h2>
          <p>
            Have a vehicle in mind? An auction lot to check? Or just a few
            questions? Tell us where you’d like to start.
          </p>
          <div className="inquiry-promise">
            <Check size={19} />
            <span>For private buyers and professional dealers</span>
          </div>
          <div className="inquiry-promise">
            <Check size={19} />
            <span>Clear guidance, from selection to delivery</span>
          </div>
        </div>
        <div className="form-wrap">
          {status === "sent" ? (
            <div className="form-result" role="status">
              <Check size={32} />
              <h3>Your inquiry is on its way.</h3>
              <p>Our team will contact you using the details you provided.</p>
              <button className="button" onClick={() => setStatus("idle")}>
                Prepare another inquiry
                <ArrowUpRight size={17} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="form-note required-note">
                All fields are required unless marked optional.
              </p>
              <fieldset>
                <legend>I’m looking for a vehicle as a</legend>
                <div className="audience-toggle">
                  {["Private buyer", "Dealer"].map((type) => (
                    <label
                      key={type}
                      className={audience === type ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={type}
                        checked={audience === type}
                        onChange={() => {
                          setAudience(type);
                          setStatus("idle");
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    maxLength={120}
                    onChange={() => setStatus("idle")}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={200}
                    onChange={() => setStatus("idle")}
                  />
                </label>
                <label>
                  Phone <span>(optional)</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+995"
                    maxLength={40}
                    onChange={() => setStatus("idle")}
                  />
                </label>
                <label>
                  Sourcing region
                  <select
                    name="region"
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setStatus("idle");
                    }}
                  >
                    {["Not sure yet", "USA", "Europe", "China"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                What are you looking for?
                <textarea
                  name="message"
                  placeholder="A make and model, your budget, or a link to an auction lot…"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={3}
                  onChange={() => setStatus("idle")}
                />
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-orange form-submit"
                disabled={status === "sending"}
                type="submit"
              >
                {status === "sending" ? (
                  <>
                    Sending inquiry
                    <LoaderCircle className="spin" size={18} />
                  </>
                ) : (
                  <>
                    {connected ? "Send inquiry" : "Prepare my inquiry"}
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
              <p className="form-note">
                {connected
                  ? "Your details will be used to respond to this inquiry."
                  : "Prepare a summary to share with our team. Online sending is not available yet."}
              </p>
              {status === "prepared" && (
                <div className="prepared-result" role="status">
                  <strong>Your inquiry is ready.</strong>
                  <p>
                    Download your summary and share it with your Logistic Hub
                    contact. Nothing has been sent.
                  </p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={download}
                  >
                    Download inquiry
                    <Download size={16} />
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
