import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, ChevronLeft, ChevronRight } from "lucide-react";

// Data dummy untuk pameran - kamu bisa ganti dengan data asli
const galleryData = [
  {
    id: 1,
    title: "Kegiatan Study Tour 2024",
    image: "/gallery/studytour1.jpg",
    category: "Kegiatan",
    date: "15 Januari 2024",
    description: "Study tour ke Jogjakarta dengan mengunjungi berbagai tempat bersejarah dan edukatif.",
    photographer: "Mr. Teacher",
    location: "Jogjakarta"
  },
  {
    id: 2,
    title: "Peringatan Hari Guru",
    image: "/gallery/hariguru.jpg",
    category: "Peringatan",
    date: "25 November 2023",
    description: "Siswa XE-4 memberikan penghormatan kepada guru-guru tercinta.",
    photographer: "Siswa XE-4",
    location: "SMAN 3 CILACAP"
  },
  {
    id: 3,
    title: "Workshop Coding",
    image: "/gallery/coding.jpg",
    category: "Workshop",
    date: "10 Desember 2023",
    description: "Workshop coding dengan tema pemrograman web modern.",
    photographer: "Pak Kevin",
    location: "Lab Komputer"
  },
  {
    id: 4,
    title: "Pameran Projek",
    image: "/gallery/pameran.jpg",
    category: "Pameran",
    date: "5 Februari 2024",
    description: "Pameran projek akhir dari siswa XE-4 yang menampilkan karya terbaik mereka.",
    photographer: "Tim Dokumentasi",
    location: "Aula Sekolah"
  },
  {
    id: 5,
    title: "Kegiatan Outbound",
    image: "/gallery/outbound.jpg",
    category: "Kegiatan",
    date: "20 Januari 2024",
    description: "Kegiatan outbound untuk membangun kebersamaan dan teamwork.",
    photographer: "Ms. Teacher",
    location: "Lembang"
  },
  {
    id: 6,
    title: "Ujian Praktik",
    image: "/gallery/praktik.jpg",
    category: "Ujian",
    date: "30 Januari 2024",
    description: "Siswa sedang mengerjakan ujian praktik dengan serius.",
    photographer: "Guru Praktik",
    location: "Lab Komputer"
  },
  {
    id: 7,
    title: "Kunjungan Industri",
    image: "/gallery/industri.jpg",
    category: "Kunjungan",
    date: "12 Februari 2024",
    description: "Kunjungan ke industri IT untuk melihat langsung dunia kerja.",
    photographer: "Koordinator",
    location: "PT. Tech Indonesia"
  },
  {
    id: 8,
    title: "Pembekalan Ujian",
    image: "/gallery/pembekalan.jpg",
    category: "Pendidikan",
    date: "18 Februari 2024",
    description: "Pembekalan ujian untuk mempersiapkan siswa menghadapi ujian nasional.",
    photographer: "Wali Kelas",
    location: "Ruang Kelas"
  }
];

// Filter categories
const categories = ["All", "Kegiatan", "Peringatan", "Workshop", "Pameran", "Ujian", "Kunjungan", "Pendidikan"];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter images berdasarkan kategori
  const filteredImages = activeCategory === "All" 
    ? galleryData 
    : galleryData.filter(item => item.category === activeCategory);

  // Handle image click
  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  // Navigate images
  const navigateImage = (direction) => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredImages.length) % filteredImages.length
      : (currentIndex + 1) % filteredImages.length;
    
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <motion.header 
        className="flex items-center gap-4 p-6 z-10 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button 
          onClick={() => window.history.back()} 
          className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🖼️ Gallery XE-4
        </h1>
      </motion.header>

      {/* Category Filter */}
      <motion.div 
        className="px-6 mb-8 z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div 
        className="px-6 pb-10 z-10 relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Masonry Grid Layout */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence mode="wait">
              {filteredImages.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => handleImageClick(item, index)}
                >
                  {/* Image Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:border-white/40 transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "/gallery/placeholder.jpg";
                        }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                          <p className="text-white/80 text-xs">{item.category} • {item.date}</p>
                        </div>
                      </div>

                      {/* Info Icon */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Info className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Card Info (always visible) */}
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                      <p className="text-white/60 text-xs">{item.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Belum ada foto</h3>
              <p className="text-white/60 mb-6">Tidak ada foto dalam kategori {activeCategory}</p>
              <motion.button
                onClick={() => setActiveCategory("All")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Lihat Semua
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Modal untuk detail foto */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh] w-full"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Container */}
              <div className="relative bg-black rounded-2xl overflow-hidden">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.src = "/gallery/placeholder.jpg";
                  }}
                />
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h2>
                    <p className="text-white/80 mb-4">{selectedImage.description}</p>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white/60 text-xs">Kategori</p>
                        <p className="text-white font-medium">{selectedImage.category}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white/60 text-xs">Tanggal</p>
                        <p className="text-white font-medium">{selectedImage.date}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white/60 text-xs">Fotografer</p>
                        <p className="text-white font-medium">{selectedImage.photographer}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white/60 text-xs">Lokasi</p>
                        <p className="text-white font-medium">{selectedImage.location}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Image Counter */}
              {filteredImages.length > 1 && (
                <div className="text-center mt-4 text-white/60 text-sm">
                  {currentIndex + 1} dari {filteredImages.length} foto
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

