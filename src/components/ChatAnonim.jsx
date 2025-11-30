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
import AOS from "aos";
import "aos/dist/aos.css";

/* ---------- SVG ICONS (bisa di-host sendiri) ---------- */
const PlaneIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M2.925 5.025l14.95-4.3a1 1 0 011.225 1.225l-4.3 14.95a1 1 0 01-1.7.403L8 14.243V10h-2a1 1 0 01-.707-1.707l4.3-4.3L2.925 5.025z" />
  </svg>
);

const CuteAvatar = ({ src }) => (
  <img
    src={src || "/AnonimUser.png"}
    alt="avatar"
    className="w-8 h-8 rounded-full border-2 border-white shadow"
  />
);

/* ---------- HELPERS ---------- */
const isOnlyEmoji = (str) =>
  /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/gi.test(
    str
  );

export default function ChatAnonim() {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [userIp, setUserIp] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const MAX_MSG = 20;

  const boxRef = useRef(null);
  const endRef = useRef(null);

  /* ---------- FIRESTORE ---------- */
  const colRef = collection(db, "chats");

  /* ---------- IP + BLACKLIST ---------- */
  const fetchBlocked = async () => {
    const snap = await getDocs(collection(db, "blacklist_ips"));
    return snap.docs.map((d) => d.data().ipAddress);
  };

  const getIp = async () => {
    const cached = localStorage.getItem("userIp");
    if (cached) return setUserIp(cached);
    try {
      const { data } = await axios.get("https://ipapi.co/json/");
      const ip = data.network || data.ip;
      setUserIp(ip);
      localStorage.setItem("userIp", ip);
    } catch {
      setUserIp("0.0.0.0");
    }
  };

  /* ---------- MESSAGE LIMIT ---------- */
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

  /* ---------- LISTEN ---------- */
  useEffect(() => {
    AOS.init({ duration: 400, once: true });
    getIp();
    const q = query(colRef, orderBy("timestamp"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMsgs(arr);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!userIp) return;
    (async () => {
      const list = await fetchBlocked();
      setBlocked(list.includes(userIp));
      loadCount();
    })();
    // eslint-disable-next-line
  }, [userIp]);

  /* ---------- SEND ---------- */
  const send = async () => {
    if (!msg.trim() || blocked) return;
    if (msgCount >= MAX_MSG) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Kamu sudah mengirim 20 pesan hari ini 🙈",
      });
      return;
    }
    const key = `msg_${userIp}`;
    const now = msgCount + 1;
    localStorage.setItem(key, String(now));
    setMsgCount(now);

    await addDoc(colRef, {
      message: msg.trim().substring(0, 60),
      sender: { image: auth.currentUser?.photoURL || "/AnonimUser.png" },
      timestamp: new Date(),
      userIp,
    });
    setMsg("");
  };

  /* ---------- RENDER ---------- */
  return (
    <section className="min-h-screen bg-gradient-to-b from-purple-50 to-yellow-100 font-quicksand">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header lucu */}
        <header
          className="flex items-center justify-between mb-4"
          data-aos="fade-down"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧑‍🏫</span>
            <h1 className="text-2xl font-bold text-purple-700">Obrolan Kelas</h1>
          </div>
          <div className="text-xs text-purple-600 bg-white rounded-full px-3 py-1 shadow">
            {MAX_MSG - msgCount} pesan tersisa hari ini
          </div>
        </header>

        {/* Kotak chat */}
        <div
          ref={boxRef}
          className="h-96 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto flex flex-col gap-3"
        >
          {msgs.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${
                m.userIp === userIp ? "flex-row-reverse" : ""
              }`}
              data-aos="fade-up"
            >
              <CuteAvatar src={m.sender.image} />
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                  m.userIp === userIp
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isOnlyEmoji(m.message) ? (
                  <span className="text-3xl">{m.message}</span>
                ) : (
                  <span>{m.message}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div className="mt-4 flex items-center gap-2 bg-white rounded-full shadow-md px-4 py-2">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && send()}
            placeholder="Ketik pesan..."
            maxLength={60}
            disabled={blocked}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={send}
            disabled={blocked}
            className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition disabled:opacity-50"
          >
            <PlaneIcon />
          </button>
        </div>

        {blocked && (
          <p className="text-center text-sm text-red-500 mt-2">
            Kamu diblokir 🚫
          </p>
        )}
      </div>
    </section>
  );
}

