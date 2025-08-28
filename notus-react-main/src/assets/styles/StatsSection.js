// components/StatsSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const stats = [
  { label: 'Total DI', value: 1200 },
  { label: 'Préventives', value: 800 },
  { label: 'Curatives', value: 400 },
  { label: 'Techniciens', value: 15 },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-8">
          Quelques chiffres clés
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-6"
            >
              <CountUp
                end={s.value}
                duration={2}
                separator=" "
                className="text-4xl font-extrabold text-blue-700"
              />
              <p className="mt-2 text-gray-700">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
