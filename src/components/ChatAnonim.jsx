/* src/components/ChatAnonim.jsx */
import React, { useState, useEffect, useRef } from "react";
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import axios from "axios";
import Swal from "sweetalert2";

export default function ChatAnonim() {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [userIp, setUserIp] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const MAX_MSG = 20;

  const endRef = useRef(null);
  const colRef = collection(db, "chats");

  const getIp = async () => {
    const cached = localStorage.getItem("userIp");
    if (cached) return setUserIp(cached);
    try {
      const { data } = await axios.get("https://ipapi.co/json/");
      const ip = data?.ip || data?.network || "0.0.0.0";
      setUserIp(ip);
      localStorage.setItem("userIp", ip);
    } catch {
      setUserIp("("0.0.0.0");
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
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMsgs(arr);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userIp) return;
    (async () => {
      const list = await fetchBlocked();
      if (list.includes(userIp)) {
        Swal.fire("Info", "Kamu diblokir 🚫", "info");
      }
      loadCount();
    })();
  }, [userIp]);

  const send = async () => {
    if (!msg.trim()) return;
    const key = `msg_${userIp}`;
    const count = parseInt(localStorage.getItem(key) || "0");
    if (count >= MAX_MSG) {
      Swal.fire("Ups!", "Kamu sudah kirim 20 pesan hari ini 🙈", "warning");
      return;
    }

    const blockedList = await fetchBlocked();
    if (blockedList.includes(userIp)) {
      Swal.fire("Blocked", "Kamu tidak bisa kirim pesan.", "error");
      return;
    }

    try {
      await addDoc(colRef, {
        message: msg.trim().substring(0, 60),
        sender: { image: auth.currentUser?.photoURL || "/AnonimUser.png" },
        timestamp: new Date(),
        userIp,
      });
      localStorage.setItem(key, String(count + 1));
      setMsgCount(count + 1);
      setMsg("");
    } catch (e) {
      Swal.fire("Gagal", "Pesan tidak terkirim: " + e.message, "error");
    }
  };

  const handleKey = (e) => e.key === "Enter" && send();

  // --- Bubble styling ---
  const bubbleClass = (ip) =>
    ip === userIp
      ? "bg-purple-500 text-white self-end rounded-br-none"
      : "bg-gray-200 text-gray-800 self-start rounded-bl-none";

  const alignClass = (ip) => (ip === userIp ? "justify-end" : "justify-start");

  return (
    <div id="ChatAnonim" className="max-w-md mx-auto h-screen flex flex-col">
      {/* Header + Back */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => window.history.back()}
          className="text-white font-bold text-xl"
        >
          ← Back
        </button>
        <span className="text-2xl">🧑‍🏫</span>
        <h1 className="text-lg font-bold text-white">Obrolan Kelas</h1>
      </div>

      {/* Chat Box */}
      <div id="KotakPesan" className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${alignClass(m.userIp)}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl shadow ${bubbleClass(
                m.userIp
              )}`}
            >
              {m.message}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div id="InputChat" className="flex items-center gap-2 px-4 py-3">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={handleKey}
          placeholder="Ketik pesan..."
          maxLength={60}
          className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
        />
        <button
          onClick={send}
          className="ml-2"
        >
          <img src="/paper-plane.png" alt="Kirim" className="w-5 h-5" />
        </button>
      </div>

      {/* Sisa pesan */}
      <div className="text-center text-xs text-white/70 pb-2">
        {MAX_MSG - msgCount} pesan tersisa hari ini
      </div>
    </div>
  );
}

