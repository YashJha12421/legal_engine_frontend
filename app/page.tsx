"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Source = {
  code_type: string;
  section: string;
  chapter?: string;
  title?: string;
  clause?: string;
  url?: string;
  text?: string;
};

type Message = {
  role: "user" | "ai";
  content: string;
  sources?: Source[];
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatute, setSelectedStatute] = useState<Source | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://yjha17a-legal-engine-api.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      const aiMessage: Message = {
        role: "ai",
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Unable to connect to the database. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const latestSources =
    messages.filter((m) => m.role === "ai" && m.sources).pop()?.sources || [];

  return (
    // Added flex-col for mobile stacking, md:flex-row for desktop
    <div className="flex flex-col md:flex-row h-screen font-serif text-[#1a1a14] antialiased relative overflow-hidden" style={{ background: "#f4f0e6" }}>

      {/* ── LEFT PANEL (Chat) ── */}
      {/* 60% height on mobile, full height on desktop */}
      <div className="flex flex-col flex-1 h-[60%] md:h-full w-full" style={{ borderRight: "1px solid #3a5240" }}>

        {/* Header */}
        <div
          className="px-6 py-3 flex items-center justify-between shrink-0"
          style={{ background: "#1e3328", borderBottom: "2px solid #b5904a" }}
        >
          <div>
            <h1 className="text-base font-normal tracking-wide" style={{ color: "#f0e8d0" }}>
              Legal Engine
            </h1>
            <p className="text-[10px] italic tracking-widest hidden sm:block" style={{ color: "#7aaa84", marginTop: "2px" }}>
              Bharatiya Nyaya Sanhita · Indian Penal Code
            </p>
          </div>
          <div
            className="px-3 py-1 text-[10px] tracking-widest hidden sm:block"
            style={{
              background: "#162a1e",
              border: "1px solid #3a5240",
              color: "#7aaa84",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Built with love...
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4"
          style={{ background: "#ece8db" }}
        >
          {messages.length === 0 && (
            <div className="mt-8 md:mt-16 max-w-md mx-auto text-center px-4">
              <h2 className="text-lg md:text-xl font-normal tracking-wide mb-2" style={{ color: "#1e3328" }}>
                How may I assist you?
              </h2>
              <p className="text-xs md:text-sm leading-relaxed font-sans italic" style={{ color: "#6a5a38" }}>
                Describe a situation in plain English. The engine will search the BNS 2023 and IPC 1860 corpus and return the applicable statutes.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[90%] md:max-w-[82%] px-4 py-3 text-[13px] leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "#1e3328",
                        color: "#e0d8c0",
                        border: "1px solid #3a5240",
                        fontFamily: "'Courier New', monospace",
                        fontSize: "12.5px",
                      }
                    : {
                        background: "#f9f5ec",
                        border: "1px solid #c8bb98",
                        color: "#1a1a14",
                        fontFamily: "Arial, sans-serif",
                      }
                }
              >
                {msg.role === "ai" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-li:my-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 flex items-center gap-1.5"
                style={{ background: "#f9f5ec", border: "1px solid #c8bb98" }}
              >
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 animate-pulse"
                    style={{ background: "#b5904a", animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="flex gap-2 px-3 py-3 shrink-0"
          style={{ background: "#ddd8c8", borderTop: "1px solid #b8b098" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the situation..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-[12px] md:text-[13px] outline-none transition-colors disabled:opacity-40"
            style={{
              background: "#faf7ee",
              border: "1px solid #a09870",
              color: "#1a1a14",
              fontFamily: "'Courier New', monospace",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 md:px-5 py-2 text-[11px] tracking-widest disabled:opacity-40 transition-colors"
            style={{
              background: "#1e3328",
              color: "#e0d8c0",
              border: "1px solid #3a5240",
              fontFamily: "'Courier New', monospace",
            }}
          >
            SUBMIT
          </button>
        </form>

        {/* Status bar & LIABILITY DISCLAIMER */}
        <div
          className="px-3 md:px-4 py-2 flex flex-col md:flex-row items-center justify-between shrink-0 gap-1.5"
          style={{ background: "#162a1e", borderTop: "1px solid #2a4030" }}
        >
          <span
            className="text-[9px] md:text-[10px] tracking-wide"
            style={{ fontFamily: "'Courier New', monospace", color: "#4a7050" }}
          >
            Legal Engine v2.1
          </span>
          
          {/* LIABILITY DISCLAIMER INSTALLED HERE */}
          <span 
            className="text-[8px] md:text-[9px] tracking-widest uppercase opacity-80 text-center"
            style={{ color: "#7aaa84", fontFamily: "Arial, sans-serif" }}
          >
            AI Research Tool • Not Official Legal Advice • Consult an Advocate
          </span>

          <span
            className="flex items-center gap-1.5 text-[9px] md:text-[10px]"
            style={{ fontFamily: "'Courier New', monospace", color: "#5a9060" }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#5a9060" }} />
            DB Online
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL (Statutes) ── */}
      {/* 40% height on mobile, full height on desktop, with a top border on mobile to separate from chat */}
      <div className="w-full md:w-72 flex flex-col shrink-0 h-[40%] md:h-full border-t-[3px] md:border-t-0" style={{ background: "#ece8db", borderColor: "#b5904a" }}>
        <div
          className="px-6 py-3 shrink-0 flex items-center justify-between"
          style={{ background: "#2a4432", borderBottom: "2px solid #b5904a" }}
        >
          <div>
            <h2 className="text-base font-normal tracking-wide" style={{ color: "#e8dfc0" }}>
              Matched Statutes
            </h2>
            <p
              className="text-[10px] mt-0.5 tracking-widest italic"
              style={{ fontFamily: "'Courier New', monospace", color: "#6a9070" }}
            >
              {latestSources.length > 0
                ? `${latestSources.length} provisions retrieved`
                : "Awaiting query"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {latestSources.length === 0 ? (
            <p
              className="text-[12px] text-center mt-6 md:mt-10 leading-relaxed italic font-sans"
              style={{ color: "#8a7850" }}
            >
              Submit a query to retrieve applicable statutes.
            </p>
          ) : (
            <>
              {/* Verdict strip */}
              <div
                className="p-2.5 flex gap-2 items-start"
                style={{
                  background: "#f2eedf",
                  border: "1px solid #a09040",
                  borderLeft: "3px solid #b5904a",
                }}
              >
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: "#b5904a" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-[11px] font-sans leading-snug" style={{ color: "#3a3010" }}>
                  Review statutes carefully. Context determines applicability.
                </p>
              </div>

              {(["BNS", "IPC"] as const).map((codeType) => {
                const group = latestSources.filter(
                  (s, i, arr) =>
                    s.code_type === codeType &&
                    arr.findIndex((x) => x.section === s.section && x.code_type === s.code_type) === i
                );
                if (group.length === 0) return null;
                return (
                  <div key={codeType}>
                    {/* Divider */}
                    <div className="flex items-center gap-2 py-1.5">
                      <div className="flex-1 h-px" style={{ background: "#b8b090" }} />
                      <span
                        className="text-[10px] tracking-widest"
                        style={{ fontFamily: "'Courier New', monospace", color: "#7a7050" }}
                      >
                        {codeType === "BNS" ? "BNS 2023" : "IPC 1860"}
                      </span>
                      <div className="flex-1 h-px" style={{ background: "#b8b090" }} />
                    </div>

                    {group.map((source, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedStatute(source)}
                        className="p-2.5 cursor-pointer mb-2 transition-colors"
                        style={{
                          background: "#f6f2e6",
                          border: "1px solid #c0b890",
                          borderLeft: "3px solid #c0b890",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderLeftColor = "#b5904a";
                          (e.currentTarget as HTMLDivElement).style.background = "#f0ebdb";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderLeftColor = "#c0b890";
                          (e.currentTarget as HTMLDivElement).style.background = "#f6f2e6";
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 tracking-wide"
                            style={
                              codeType === "BNS"
                                ? {
                                    background: "#1e3328",
                                    color: "#c8a85a",
                                    border: "1px solid #3a5240",
                                    fontFamily: "'Courier New', monospace",
                                  }
                                : {
                                    background: "#3a2810",
                                    color: "#d4a84a",
                                    border: "1px solid #7a5820",
                                    fontFamily: "'Courier New', monospace",
                                  }
                            }
                          >
                            {codeType}
                          </span>
                          {source.url ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] transition-colors"
                              style={{ fontFamily: "'Courier New', monospace", color: "#5a6850" }}
                            >
                              § {source.section}
                            </a>
                          ) : (
                            <span
                              className="text-[11px]"
                              style={{ fontFamily: "'Courier New', monospace", color: "#5a6850" }}
                            >
                              § {source.section}
                            </span>
                          )}
                        </div>
                        {source.title && (
                          <p className="text-[12px] leading-snug italic" style={{ color: "#1a1a14" }}>
                            {source.title}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {selectedStatute && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(20, 38, 25, 0.75)", backdropFilter: "blur(2px)" }}
          onClick={() => setSelectedStatute(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            style={{ background: "#f9f5ec", border: "1px solid #c8bb98" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="px-4 md:px-6 py-4 flex items-center justify-between shrink-0"
              style={{ background: "#1e3328", borderBottom: "2px solid #b5904a" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] md:text-[11px] font-bold px-2 py-1 tracking-wide"
                  style={
                    selectedStatute.code_type === "BNS"
                      ? {
                          background: "#b5904a",
                          color: "#f7f0e0",
                          border: "1px solid #d4b06a",
                          fontFamily: "'Courier New', monospace",
                        }
                      : {
                          background: "#3a2810",
                          color: "#d4a84a",
                          border: "1px solid #7a5820",
                          fontFamily: "'Courier New', monospace",
                        }
                  }
                >
                  {selectedStatute.code_type}
                </span>
                <h2 className="text-sm md:text-base font-normal tracking-wide" style={{ color: "#f0e8d0" }}>
                  Section {selectedStatute.section}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStatute(null)}
                aria-label="Close"
                style={{ color: "#7aaa84" }}
                className="hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-4 md:p-6 overflow-y-auto">
              {selectedStatute.title && (
                <h3
                  className="text-base md:text-lg mb-4 md:mb-5 leading-snug pb-3 md:pb-4 font-normal italic"
                  style={{ color: "#b5904a", borderBottom: "1px solid #c8bb98" }}
                >
                  {selectedStatute.title}
                </h3>
              )}
              <div
                className="text-[13px] md:text-[14px] leading-relaxed md:leading-loose whitespace-pre-wrap font-sans"
                style={{ color: "#1a1a14" }}
              >
                {selectedStatute.text ?? (
                  <span className="italic" style={{ color: "#8a7850" }}>
                    Full text was not included in the response payload.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
