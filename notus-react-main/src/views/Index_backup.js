import React from "react";
import { Link } from "react-router-dom";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import "../assets/styles/customButtons.css";

// vos images locales (déposez team-meeting.jpg dans src/assets/img/)
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
    description: "Créer, gérer les comptes et assigner des rôles métiers.",
    route: "/auth/register",
  },
  {
    title: "Interventions & BT",
    icon: "fas fa-tools",
    img: imgMaintenance,
    description: "DI curatives/préventives et génération des BT.",
    route: "/auth/register",
  },
  {
    title: "PDR & Stock",
    icon: "fas fa-warehouse",
    img: imgWarehouse,
    description: "Suivi des pièces et validation des commandes.",
    route: "/auth/register",
  },
  {
    title: "Planning Techniciens",
    icon: "fas fa-calendar-check",
    img: imgCalendar,
    description: "Gestion intelligente des interventions et conflits.",
    route: "/auth/register",
  },
  {
    title: "KPI & Dashboard",
    icon: "fas fa-chart-line",
    img: imgDashboard,
    description: "MTTR, MTBF, disponibilité et suivi en temps réel.",
    route: "/auth/register",
  },
];

  const kpis = [
    { label: "MTTR", value: "2h 15min" },
    { label: "MTBF", value: "27 jours" },
    { label: "Taux d’exécution", value: "94%" },
    { label: "Ruptures de stock", value: "1%" },
  ];

  const [statsRef, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <>
      <IndexNavbar transparent />
      <main className="relative">

        {/* HERO */}
        <section
          className="relative h-screen flex items-center justify-center text-center px-4 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://source.unsplash.com/1600x900?industrial,maintenance,machine')",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-60" />
          <motion.div
            className="relative z-10 max-w-3xl mx-auto text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src={sagemLogo}
              alt="Logo Sagemcom"
              className="h-24 mx-auto mb-6 animate-pulse"
            />
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Plateforme de Maintenance<br /> Industrielle
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              Supervisez les interventions, gérez les stocks, suivez vos KPI et
              optimisez la disponibilité de vos équipements.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <Link
                to="/auth/login"
                className="inline-block px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-blue-900 font-bold rounded-full shadow-xl transform hover:scale-105 transition"
              >
                Accéder à la plateforme
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* MODULES CLÉS */}
        <section className="py-20 bg-white relative z-10">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">
              Modules Clés
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {features.map((f, i) => (
                <Tilt
                  key={i}
                  tiltMaxAngleX={10}
                  tiltMaxAngleY={10}
                  className="w-[220px]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl shadow-xl p-6 text-center flex flex-col items-center hover:shadow-2xl transition"
                  >
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-20 h-20 mb-4 rounded-full"
                    />
                    <i className={`${f.icon} text-4xl text-blue-600 mb-3`} />
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-gray-500 mb-4">{f.description}</p>
                    <Link
                      to={f.route}
                      className="text-yellow-500 font-semibold hover:underline"
                    >
                      Découvrir
                    </Link>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </div>
        </section>

        {/* KPIS */}
        <section
          className="py-16 relative z-10 bg-cover bg-center"
          ref={statsRef}
          style={{
            backgroundImage:
              "url('https://source.unsplash.com/1600x900?analytics,report')",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="container relative mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-8">Indicateurs Clés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {kpis.map((k, idx) => (
                <div key={idx} className="bg-white/90 rounded-xl shadow p-6">
                  <span className="text-blue-800 text-3xl font-bold block mb-2">
                    {inView ? (
                      <CountUp
                        end={parseFloat(k.value)}
                        duration={2}
                        suffix={k.value.replace(/\d|\s/g, "")}
                      />
                    ) : (
                      0
                    )}
                  </span>
                  <span className="text-gray-600">{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

{/* RÔLES & CONTACTS - Design inspiré de ton image */}
<section className="py-20 bg-black text-white">
  <div className="container mx-auto px-6">
    {/* IMAGE + RÔLES */}
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
      
      {/* IMAGE avec ombre et bords arrondis */}
      <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
        <img
          src={teamMeeting}
          alt="Équipe"
          className="rounded-xl shadow-[0_25px_50px_-15px_rgba(0,0,0,0.7)] max-w-full"
        />
      </div>

      {/* RÔLES */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-3xl font-bold mb-8">Rôles</h2>
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold">Admin</h3>
            <p className="text-sm text-gray-300">
              Supervise le système, assigne les rôles, valide les DI et suit les KPI.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Chef de secteur</h3>
            <p className="text-sm text-gray-300">
              Planifie les interventions, supervise les techniciens.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Magasinier</h3>
            <p className="text-sm text-gray-300">
              Gère les PDR, valide les commandes, surveille les seuils.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Technicien Curatif</h3>
            <p className="text-sm text-gray-300">
              Travaille sur les DI curatives.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Technicien Préventif</h3>
            <p className="text-sm text-gray-300">
              Planifie les DI préventives et commande des PDR.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* CONTACTS */}
    <div className="mt-20">
      <h2 className="text-3xl font-bold mb-8">Contacts</h2>
      <div className="flex flex-col sm:flex-row sm:space-x-12 gap-6">
        
        {/* Email */}
        <a
          href="mailto:support@sagemcom-maintenance.com"
          className="flex items-center space-x-4 hover:scale-105 transition-transform duration-300"
        >
          <div className="bg-orange-500 p-4 rounded-lg shadow-lg">
            <i className="fas fa-envelope text-white text-2xl"></i>
          </div>
          <div>
            <p className="text-sm text-gray-300">Email</p>
            <p className="font-semibold underline text-white">
              support@sagemcom-maintenance.com
            </p>
          </div>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/company/sagemcom-maintenance"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-4 hover:scale-105 transition-transform duration-300"
        >
          <div className="bg-orange-500 p-4 rounded-lg shadow-lg">
            <i className="fab fa-linkedin text-white text-2xl"></i>
          </div>
          <div>
            <p className="text-sm text-gray-300">Linkedin</p>
            <p className="font-semibold underline text-white">
              Sagemcom Maintenance
            </p>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>




      </main>
      <Footer />
    </>
  );
}
