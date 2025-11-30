/* components/ChatAnonimContent.jsx */
import React, { useState, useEffect, useRef } from "react";
import { addDoc, collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import axios from "axios";
import Swal from "sweetalert2";

export default function ChatAnonimContent() {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [userIp, setUserIp] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const MAX_MSG = 20;
  const endRef = useRef(null);
  const colRef = collection(db, "chats");

  /* IP & blacklist */
  const getIp = async () => {
    const cached = localStorage.getItem("userIp");
    if (cached) return setUserIp(cached);
    try {
      const { data } = await axios.get("https://ipapi.co/json/");
      const ip = data?.ip || data?.network || "0.0.0.0";
      setUserIp(ip);
      localStorage.setItem("userIp", ip);
    } catch {
      setUserIp("0.0.0.0");
    }
  };
  const fetchBlocked = async () => {
    const snap = await getDocs(collection(db, "blacklist_ips"));
    return snap.docs.map((d) => d.data().ipAddress);
  };
  const loadCount = () => {
    const today = new Date().toDateString();
    const last = localStorage.getItem("msgDate");
    const key = `msg_${userIp}`;
    if (last !== today) {
      localStorage.setItem("msgDate", today);
      localStorage.setItem(key, "0");
    }
    setMsgCount(parseInt(localStorage.getItem(key) || "0"));
  };

  useEffect(() => {
    getIp();
    const q = query(colRef, orderBy("timestamp"));
    const unsub = onSnapshot(q, (snap) => {
      setMsgs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userIp) return;
    (async () => {
      if ((await fetchBlocked()).includes(userIp))
        Swal.fire("Info", "Kamu diblokir 🚫", "info");
      loadCount();
    })();
  }, [userIp]);

  /* send */
  const send = async () => {
    if (!msg.trim()) return;
    const key = `msg_${userIp}`;
    const count = parseInt(localStorage.getItem(key) || "0");
    if (count >= MAX_MSG) {
      Swal.fire("Ups!", "Kamu sudah kirim 20 pesan hari ini 🙈", "warning");
      return;
    }
    if ((await fetchBlocked()).includes(userIp)) {
      Swal.fire("Blocked", "Kamu tidak bisa kirim pesan.", "error");
      return;
    }
    await addDoc(colRef, {
      message: msg.trim().substring(0, 60),
      sender: { image: auth.currentUser?.photoURL || "/AnonimUser.png" },
      timestamp: new Date(),
      userIp,
    });
    localStorage.setItem(key, String(count + 1));
    setMsgCount(count + 1);
    setMsg("");
  };
  const handleKey = (e) => e.key === "Enter" && send();

  /* bubble styling */
  const bubble = (ip) =>
    ip === userIp
      ? "bg-purple-500 text-white self-end rounded-br-none"
      : "bg-gray-200 text-gray-800 self-start rounded-bl-none";
  const align = (ip) => (ip === userIp ? "justify-end" : "justify-start");

  return (
    <div className="flex flex-col h-full text-white">
      {/* header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className="text-lg">🧑‍🏫</span>
        <h1 className="text-base font-semibold">Obrolan Kelas</h1>
        <span className="ml-auto text-[10px] text-white/70">
          {MAX_MSG - msgCount} tersisa
        </span>
      </div>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 text-sm">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${align(m.userIp)}`}>
            <div
              className={`max-w-[70%] px-2 py-1 rounded-xl shadow ${bubble(
                m.userIp
              )}`}
            >
              {m.message}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-2">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={handleKey}
          placeholder="Ketik..."
          maxLength={60}
          className="flex-1 bg-white/10 placeholder-white/60 text-white px-3 py-2 rounded-full outline-none border border-white/20 focus:border-white/40"
        />
        <button
          onClick={send}
          className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-full transition"
        >
          <img src="/paper-plane.png" alt="Kirim" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

