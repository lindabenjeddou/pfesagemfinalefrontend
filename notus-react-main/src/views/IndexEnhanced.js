import React from "react";
import { Link } from "react-router-dom";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import "../assets/styles/customButtons.css";

// Images locales
import sagemLogo from "../assets/img/sagem.png";
import teamMeeting from "../assets/img/users.png";
import imgUsers from "../assets/img/users.png";
import imgMaintenance from "../assets/img/maintenance.png";
import imgWarehouse from "../assets/img/warehouse.png";
import imgCalendar from "../assets/img/calendar.png";
import imgDashboard from "../assets/img/dashboard.png";

export default function Index() {
  const features = [
    {
      title: "Gestion des Utilisateurs",
      icon: "fas fa-users-cog",
      img: imgUsers,
      description: "Créer, gérer les comptes et assigner des rôles métiers avec une interface intuitive.",
      route: "/auth/register",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Interventions & BT",
      icon: "fas fa-tools",
      img: imgMaintenance,
      description: "DI curatives/préventives et génération automatique des bons de travail.",
      route: "/auth/register",
      color: "from-green-500 to-green-600",
    },
    {
      title: "PDR & Stock",
      icon: "fas fa-warehouse",
      img: imgWarehouse,
      description: "Suivi intelligent des pièces et validation optimisée des commandes.",
      route: "/auth/register",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Planning Techniciens",
      icon: "fas fa-calendar-check",
      img: imgCalendar,
      description: "Gestion intelligente des interventions avec détection automatique des conflits.",
      route: "/auth/register",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "KPI & Dashboard",
      icon: "fas fa-chart-line",
      img: imgDashboard,
      description: "MTTR, MTBF, disponibilité et suivi en temps réel avec analytics avancés.",
      route: "/auth/register",
      color: "from-red-500 to-red-600",
    },
  ];

  const kpis = [
    { label: "MTTR", value: "2h 15min", icon: "fas fa-clock", color: "text-blue-600" },
    { label: "MTBF", value: "27 jours", icon: "fas fa-calendar-alt", color: "text-green-600" },
    { label: "Taux d'exécution", value: "94%", icon: "fas fa-check-circle", color: "text-purple-600" },
    { label: "Ruptures de stock", value: "1%", icon: "fas fa-exclamation-triangle", color: "text-orange-600" },
  ];

  const [statsRef, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <>
      <IndexNavbar transparent />
      <main className="relative">

        {/* HERO SECTION - Enhanced */}
        <section className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
            <div className="absolute inset-0 bg-black opacity-40"></div>
            
            {/* Floating particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    x: [-10, 10, -10],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Geometric shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute top-20 left-10 w-32 h-32 border border-yellow-400 opacity-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-20 right-10 w-24 h-24 border border-blue-400 opacity-20"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          <motion.div
            className="relative z-10 max-w-5xl mx-auto text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Logo with enhanced effects */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 1, type: "spring", stiffness: 100 }}
            >
              <div className="relative">
                <img
                  src={sagemLogo}
                  alt="Logo Sagemcom"
                  className="h-32 mx-auto filter drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-transparent opacity-20 blur-xl"></div>
              </div>
            </motion.div>

            {/* Enhanced title with gradient text */}
            <motion.h1
              className="text-6xl md:text-8xl font-black mb-6 leading-tight"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                Plateforme de Maintenance
              </span>
              <br />
              <span className="text-yellow-400 text-shadow-lg">Industrielle</span>
            </motion.h1>

            {/* Enhanced description */}
            <motion.p
              className="text-xl md:text-2xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              Révolutionnez votre maintenance avec une plateforme intelligente qui{" "}
              <span className="text-yellow-400 font-semibold">optimise vos interventions</span>,{" "}
              <span className="text-yellow-400 font-semibold">gère vos stocks</span> et{" "}
              <span className="text-yellow-400 font-semibold">maximise la disponibilité</span> de vos équipements.
            </motion.p>

            {/* Enhanced CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Link
                to="/auth/login"
                className="group relative px-12 py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 font-bold text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <i className="fas fa-rocket mr-3"></i>
                  Accéder à la plateforme
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <a
                href="#features"
                className="group px-10 py-5 border-2 border-white text-white font-semibold text-lg rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-sm flex items-center"
              >
                <i className="fas fa-play mr-3 group-hover:translate-x-1 transition-transform"></i>
                Découvrir les fonctionnalités
              </a>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              <motion.div
                className="w-6 h-10 border-2 border-white rounded-full flex justify-center cursor-pointer"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                <motion.div
                  className="w-1 h-3 bg-white rounded-full mt-2"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* MODULES CLÉS - Enhanced */}
        <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative" ref={featuresRef}>
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold text-gray-800 mb-4">
                Modules <span className="text-blue-600">Clés</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez nos solutions intégrées pour optimiser votre maintenance industrielle
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  className="group"
                >
                  <Tilt
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                    className="h-full"
                  >
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center h-full flex flex-col hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-gray-200">
                      {/* Icon and Image */}
                      <div className="relative mb-6">
                        <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-4 shadow-lg`}>
                          <img
                            src={feature.img}
                            alt={feature.title}
                            className="w-full h-full object-contain filter brightness-0 invert"
                          />
                        </div>
                        <div className={`absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <i className={`${feature.icon} text-white text-lg`} />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* CTA */}
                      <Link
                        to={feature.route}
                        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${feature.color} text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                      >
                        <span>Découvrir</span>
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                      </Link>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* KPIs SECTION - Enhanced */}
        <section
          className="py-24 relative overflow-hidden"
          ref={statsRef}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900"></div>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="container relative mx-auto px-6 text-center text-white">
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-4">
                Indicateurs <span className="text-yellow-400">Clés</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Suivez vos performances en temps réel avec nos KPI avancés
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {kpis.map((kpi, idx) => (
                <motion.div
                  key={idx}
                  className="group"
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:bg-white transition-all duration-300 transform hover:scale-105">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center`}>
                      <i className={`${kpi.icon} text-white text-2xl`} />
                    </div>
                    
                    <div className={`text-4xl font-bold mb-2 ${kpi.color}`}>
                      {inView ? (
                        <CountUp
                          end={parseFloat(kpi.value)}
                          duration={2.5}
                          suffix={kpi.value.replace(/\d|\s/g, "")}
                        />
                      ) : (
                        "0"
                      )}
                    </div>
                    
                    <div className="text-gray-600 font-semibold text-lg">
                      {kpi.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* RÔLES & CONTACTS - Enhanced */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black text-white">
          <div className="container mx-auto px-6">
            {/* RÔLES ET IMAGE */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-20 mb-20">
              
              {/* IMAGE avec effets améliorés */}
              <motion.div
                className="w-full lg:w-1/2 mb-12 lg:mb-0"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <img
                    src={teamMeeting}
                    alt="Équipe"
                    className="rounded-3xl shadow-[0_25px_50px_-15px_rgba(0,0,0,0.7)] max-w-full transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl"></div>
                </div>
              </motion.div>

              {/* RÔLES */}
              <motion.div
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-8 text-yellow-400">Rôles & Responsabilités</h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "Admin",
                      description: "Supervise le système, assigne les rôles, valide les DI et suit les KPI.",
                      icon: "fas fa-user-shield"
                    },
                    {
                      title: "Chef de secteur",
                      description: "Planifie les interventions, supervise les techniciens.",
                      icon: "fas fa-user-tie"
                    },
                    {
                      title: "Magasinier",
                      description: "Gère les PDR, valide les commandes, surveille les seuils.",
                      icon: "fas fa-boxes"
                    },
                    {
                      title: "Technicien Curatif",
                      description: "Travaille sur les DI curatives.",
                      icon: "fas fa-wrench"
                    },
                    {
                      title: "Technicien Préventif",
                      description: "Planifie les DI préventives et commande des PDR.",
                      icon: "fas fa-calendar-check"
                    }
                  ].map((role, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`${role.icon} text-white`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-2">{role.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{role.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* CONTACTS - Enhanced */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-12 text-yellow-400">Contactez-nous</h2>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
                
                {/* Email */}
                <motion.a
                  href="mailto:support@sagemcom-maintenance.com"
                  className="group flex items-center space-x-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <i className="fas fa-envelope text-white text-2xl"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="font-semibold text-white text-lg group-hover:text-yellow-400 transition-colors">
                      support@sagemcom-maintenance.com
                    </p>
                  </div>
                </motion.a>

                {/* LinkedIn */}
                <motion.a
                  href="https://www.linkedin.com/company/sagemcom-maintenance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <i className="fab fa-linkedin text-white text-2xl"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-400 mb-1">LinkedIn</p>
                    <p className="font-semibold text-white text-lg group-hover:text-yellow-400 transition-colors">
                      Sagemcom Maintenance
                    </p>
                  </div>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
