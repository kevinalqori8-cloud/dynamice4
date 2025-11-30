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
import { useNavigate } from "react-router-dom";

export default function ChatAnonim() {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [userIp, setUserIp] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const MAX_MSG = 20;

  const navigate = useNavigate();
  const endRef = useRef(null);

  const colRef = collection(db, "chats");

  // --- IP & BLACKLIST ---
  const fetchBlockedIPs = async () => {
    const snap = await getDocs(collection(db, "blacklist_ips"));
    return snap.docs.map((d) => d.data().ipAddress);
  };

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
      const list = await fetchBlockedIPs();
      if (list.includes(userIp)) {
        Swal.fire("Info", "Kamu diblokir 🚫", "info");
      }
      loadCount();
    })();
  }, [userIp]);

  // --- SEND ---
  const send = async () => {
    if (!msg.trim()) return;
    const key = `msg_${userIp}`;
    const count = parseInt(localStorage.getItem(key) || "0");
    if (count >= MAX_MSG) {
      Swal.fire("Ups!", "Kamu sudah kirim 20 pesan hari ini 🙈", "warning");
      return;
    }

    const blockedList = await fetchBlockedIPs();
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

  // --- BUBBLE CLASS ---
  const bubble = (ip) =>
    ip === userIp
      ? "bg-purple-500 text-white self-end rounded-br-none"
      : "bg-gray-200 text-gray-800 self-start rounded-bl-none";

  const align = (ip) => (ip === userIp ? "justify-end" : "justify-start");

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-yellow-100 font-sans">
      <div className="max-w-md mx-auto h-screen flex flex-col">
        {/* HEADER + BACK */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white shadow">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-700 font-bold text-xl"
          >
            ← Back
          </button>
          <span className="text-2xl">🧑‍🏫</span>
          <h1 className="text-lg font-bold text-purple-700">Obrolan Kelas</h1>
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${align(m.userIp)}`}>
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl shadow ${bubble(
                  m.userIp
                )}`}
              >
                {m.message}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* INPUT */}
        <div className="bg-white px-4 py-3 flex items-center gap-2 border-t">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={handleKey}
            placeholder="Ketik pesan..."
            maxLength={60}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={send}
            className="bg-purple-600 text-white px-3 py-2 rounded-full hover:bg-purple-700 transition"
          >
            Kirim
          </button>
        </div>

        {/* SISA PESAN */}
        <div className="text-center text-xs text-purple-600 bg-white pb-2">
          {MAX_MSG - msgCount} pesan tersisa hari ini
        </div>
      </div>
    </div>
  );
}

