import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { userService } from "../service/firebaseService";
import { daftarSiswa } from "../data/siswa";
import { useNavigate } from "react-router-dom";

export default function LoginPopup({ onClose, onLogin }) {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const firebaseStudents = await userService.getAllStudents();
      if (firebaseStudents.length > 0) {
        setStudents(firebaseStudents);
      } else {
        setStudents(daftarSiswa);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents(daftarSiswa);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !password.trim()) {
      alert("❌ Nama dan password harus diisi!");
      return;
    }

    setLoading(true);
    
    try {
      console.log('1. Starting login process...');
      console.log('2. User input:', { nama: nama.trim(), password: password });
      
      // Cari siswa di Firebase
      const student = await userService.getStudentData(nama.trim());
      console.log('3. Student found:', student);
      
      if (student && student.password === password) {
        console.log('4. Password match, creating user data...');
        
        // Buat user data
        const userData = {
          nama: student.nama,
          jurusan: student.jurusan,
          jk: student.jk,
          lencana: student.lencana || [],
          money: student.money || 1000,
          achievements: student.achievements || [],
          joinDate: student.joinDate || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        console.log('5. Saving to localStorage...');
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        console.log('6. Calling onLogin callback...');
        onLogin(userData);
        
        console.log('7. Closing popup...');
        onClose();
        
        console.log('8. Redirecting to games...');
        setTimeout(() => {
          navigate("/games");
        }, 100);
        
      } else {
        console.log('4. Password mismatch or student not found');
        alert("❌ Nama atau password salah!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("❌ Login gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Login Siswa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Nama Siswa</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              list="student-list"
              required
            />
            <datalist id="student-list">
              {students.map((student, index) => (
                <option key={index} value={student.nama} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="text-xs text-gray-500">
            <p>Password default: DynamicIsLand</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

