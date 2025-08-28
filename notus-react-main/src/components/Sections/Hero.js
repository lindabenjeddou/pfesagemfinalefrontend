import React from "react";
import { Link } from "react-router-dom";
import { appName, colors } from "../../theme";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center px-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/1600x900?factory,machine')",
        }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${colors.primaryDark} 0%, rgba(0,0,0,0.6) 100%)`, opacity: 0.7 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-white animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {appName}
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Supervisez les interventions, gérez les stocks, suivez vos KPI et
          optimisez la disponibilité de vos équipements.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth/login"
            className="bg-white text-blue-800 font-bold px-8 py-4 rounded-full shadow hover:bg-blue-100 transition"
          >
            Accéder à la plateforme
          </Link>
          <Link
            to="/auth/register"
            className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-blue-800 transition"
          >
            Demander une démo
          </Link>
        </div>
      </div>
    </section>
  );
}
