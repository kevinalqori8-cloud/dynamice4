import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { daftarSiswa } from "../data/siswa";

const defaultPict = "/AnonimUser.png";

export default function ProfilePage() {
  const { nama } = useParams();
  const nav = useNavigate();
  const base = daftarSiswa.find((s) => s.nama === decodeURIComponent(nama));
  if (!base) return <div className="text-white p-6">Tidak ditemukan</div>;

  // load data (termasuk password yang sudah di-update)
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(`profile_${base.nama}`);
    return raw
      ? JSON.parse(raw)
      : {
          nama: base.nama,
          jurusan: base.jurusan,
          foto: defaultPict,
          bio: "Halo! Saya siswa kelas D.",
          wa: "",
          ig: "",
          tiktok: "",
          showWa: true,
          showIg: true,
          showTiktok: true,
          lencana: base.lencana || [],
          oldPass: "",
          newPass: "",
        };
  });

  const [edit, setEdit] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = user.nama === base.nama; // hanya owner bisa edit

  const save = () => {
    // hapus field sementara sebelum simpan
    const { oldPass, newPass, ...clean } = data;
    localStorage.setItem(`profile_${base.nama}`, JSON.stringify(clean));
    setEdit(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((d) => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const updatePassword = () => {
    if (data.oldPass !== base.password) return alert("Password lama salah");
    if (!data.newPass) return alert("Password baru kosong");
    // update password di data base + localStorage
    const updatedBase = { ...base, password: data.newPass };
    localStorage.setItem(`profile_${base.nama}`, JSON.stringify({ ...data, password: data.newPass }));
    localStorage.setItem("user", JSON.stringify(updatedBase));
    alert("Password berhasil diubah");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-6">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => nav(-1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold">Profil Siswa</h1>
        {isOwner && (
          <button onClick={() => setEdit(!edit)} className="ml-auto glass-button px-3 py-1 rounded-lg text-sm">
            {edit ? "Simpan" : "Edit"}
          </button>
        )}
      </header>

      {/* Foto + Nama */}
      <section className="max-w-md mx-auto glass-lonjong rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <img src={data.foto} alt="Foto" className="w-20 h-20 rounded-lg object-cover border-2 border-white/30" />
          <div>
            <h2 className="font-bold text-lg">{data.nama}</h2>
            <p className="text-sm text-white/70">{data.jurusan}</p>
          </div>
        </div>
        {isOwner && edit && (
          <div className="mt-4 space-y-3">
            <input name="foto" value={data.foto} onChange={handleChange} placeholder="URL foto" className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg text-sm outline-none border border-white/20" />
            <textarea name="bio" value={data.bio} onChange={handleChange} placeholder="Bio singkat" rows="2" className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg text-sm outline-none border border-white/20" />
          </div>
        )}
      </section>

      {/* Sosmed Toggle (hanya owner bisa edit) */}
      {isOwner && edit && (
        <section className="max-w-md mx-auto glass-lonjong rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-3">Sosial Media</h3>
          {["wa", "ig", "tiktok"].map((key) => (
            <div key={key} className="flex items-center justify-between mb-3">
              <span className="text-sm capitalize">{key}</span>
              <div className="flex items-center gap-2">
                <input name={key} value={data[key]} onChange={handleChange} placeholder={`Link ${key}`} className="flex-1 bg-white/10 placeholder-white/60 px-2 py-1 rounded text-xs outline-none border border-white/20" />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" name={`show${key.charAt(0).toUpperCase() + key.slice(1)}`} checked={data[`show${key.charAt(0).toUpperCase() + key.slice(1)}`]} onChange={handleChange} className="scale-75" />
                  Tampil
                </label>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Ganti Password (hanya owner) */}
      {isOwner && edit && (
        <section className="max-w-md mx-auto glass-lonjong rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-3">Ganti Password</h3>
          <input name="oldPass" value={data.oldPass || ""} onChange={handleChange} placeholder="Password lama" type="password" className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg mb-3 outline-none border border-white/20" />
          <input name="newPass" value={data.newPass || ""} onChange={handleChange} placeholder="Password baru" type="password" className="w-full bg-white/10 placeholder-white/60 px-3 py-2 rounded-lg mb-3 outline-none border border-white/20" />
          <button onClick={updatePassword} className="w-full glass-button py-2 rounded-lg">Update Password</button>
        </section>
      )}

      {/* Tampilan Publik (baca saja) */}
      <section className="max-w-md mx-auto glass-lonjong rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-3">Tampilan Publik</h3>
        {data.showWa && data.wa && (
          <a href={data.wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-3 text-sm text-white/80 hover:text-white">
            <img src="/wa.svg" alt="WA" className="w-4 h-4" /> WhatsApp
          </a>
        )}
        {data.showIg && data.ig && (
          <a href={data.ig} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-3 text-sm text-white/80 hover:text-white">
            <img src="/ig.svg" alt="IG" className="w-4 h-4" /> Instagram
          </a>
        )}
        {data.showTiktok && data.tiktok && (
          <a href={data.tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <img src="/tiktok.svg" alt="TT" className="w-4 h-4" /> TikTok
          </a>
        )}
      </section>

      {/* Lencana (badge) */}
      <section className="max-w-md mx-auto glass-lonjong rounded-2xl p-6">
        <h3 className="font-semibold mb-3">Lencana</h3>
        <div className="flex flex-wrap gap-2">
          {data.lencana?.map((b) => (
            <span key={b} className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
              {b}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

