// frontend/src/pages/Home.js
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* 🔮 Animated Background Blobs */}
      <motion.div
        className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 50, -50, 0], y: [0, -40, 40, 0], scale: [1, 1.2, 0.8, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -40, 40, 0], y: [0, 50, -50, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* 🚀 Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pt-40 px-6">
        <motion.h1
          className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-blue-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          CivicTrack 🏙️
        </motion.h1>
        <motion.p
          className="text-2xl text-gray-300 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Report. Track. Resolve. <br /> Community Issues Near You.
        </motion.p>

        <motion.div
          className="flex gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link
            to="/submit-issue"
            className="px-8 py-4 bg-pink-600 hover:bg-pink-700 rounded-xl font-semibold shadow-xl hover:scale-110 transition"
          >
            🚨 Report Issue
          </Link>
          <Link
            to="/map"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-xl hover:scale-110 transition"
          >
            🗺️ View Map
          </Link>
        </motion.div>
      </div>

      {/* ✨ Nearby Issues Section */}
      <motion.div
        className="relative z-10 mt-28 px-8 md:px-20"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl font-bold mb-8 text-center">🔥 Nearby Issues</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition"
              whileHover={{ scale: 1.08 }}
            >
              <h3 className="text-2xl font-semibold mb-3">Issue #{i}</h3>
              <p className="text-gray-400 mb-4">
                Example issue description for issue {i}. Click below to see more details.
              </p>
              <Link
                to="/issues"
                className="inline-block mt-2 text-pink-400 font-medium hover:underline"
              >
                View Details →
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 📞 Helpline Section */}
      <motion.div
        className="relative z-10 mt-28 px-8 md:px-20 mb-24"
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl font-bold mb-8 text-center">📞 One-Tap Helplines</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          {[
            { name: "🚓 Police", number: "100", color: "bg-red-600" },
            { name: "🚑 Ambulance", number: "102", color: "bg-green-600" },
            { name: "🔥 Fire Brigade", number: "101", color: "bg-yellow-600" },
          ].map((c) => (
            <motion.a
              key={c.name}
              href={`tel:${c.number}`}
              className={`${c.color} rounded-xl p-8 text-xl font-bold shadow-lg hover:scale-105 transition`}
              whileTap={{ scale: 0.9 }}
            >
              {c.name}
              <br />
              <span className="text-3xl">{c.number}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
