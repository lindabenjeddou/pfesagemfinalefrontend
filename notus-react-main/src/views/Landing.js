import React from "react";
import { Link } from "react-router-dom";
import Navbar from "components/Navbars/AuthNavbar";
import Footer from "components/Footers/Footer";
import { useLanguage } from "../contexts/LanguageContext";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('landing.features.users.title', 'Gestion des utilisateurs'),
      icon: "fas fa-users-cog",
      description: t('landing.features.users.description', 'Connexion sécurisée, attribution de rôles, gestion des comptes.'),
      route: "/admin/users",
    },
    {
      title: t('landing.features.interventions.title', 'Interventions'),
      icon: "fas fa-tools",
      description: t('landing.features.interventions.description', 'Création, planification et suivi des DI curatives/préventives.'),
      route: "/admin/interventions",
    },
    {
      title: t('landing.features.workOrders.title', 'Bon de travail'),
      icon: "fas fa-file-signature",
      description: t('landing.features.workOrders.description', 'Génération automatique à partir des DI, suivi de l\'exécution.'),
      route: "/admin/bt",
    },
    {
      title: t('landing.features.stock.title', 'Stock & PDR'),
      icon: "fas fa-warehouse",
      description: t('landing.features.stock.description', 'Commandes, seuils critiques, validation par le magasinier.'),
      route: "/admin/stock",
    },
    {
      title: t('landing.features.kpi.title', 'Indicateurs & KPI'),
      icon: "fas fa-chart-line",
      description: t('landing.features.kpi.description', 'Taux d\'exécution, MTTR, MTBF, performance des techniciens.'),
      route: "/admin/kpi",
    },
    {
      title: t('landing.features.planning.title', 'Planning Techniciens'),
      icon: "fas fa-calendar-check",
      description: t('landing.features.planning.description', 'Disponibilités, affectations et conflits évités automatiquement.'),
      route: "/admin/planning",
    },
  ];

  const kpis = [
    { label: t('landing.kpi.mttr', 'MTTR'), value: "2h 15m" },
    { label: t('landing.kpi.mtbf', 'MTBF'), value: "30j" },
    { label: t('landing.kpi.execution', 'Taux d\'exécution'), value: "92%" },
    { label: t('landing.kpi.stock', 'Rupture Stock'), value: "1%" },
  ];

  return (
    <>
      <Navbar transparent />
      <main>
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-blue-800 to-blue-600 text-white py-32 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t('landing.hero.title', 'Plateforme de Gestion de Maintenance Sagemcom')}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              {t('landing.hero.description', 'Gérez efficacement les interventions curatives et préventives, le stock des pièces de rechange, le planning des techniciens et les indicateurs de performance. Optimisez la maintenance grâce à une interface intuitive.')}
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center bg-white text-blue-800 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-100 transition"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> {t('landing.hero.button', 'Commencer')}
            </Link>
          </div>
        </section>

        {/* FONCTIONNALITÉS */}
        <section className="bg-blueGray-50 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">{t('landing.features.title', 'Fonctionnalités principales')}</h2>
            <p className="text-center text-blueGray-600 mb-12 text-lg">
              {t('landing.features.subtitle', 'Une solution complète pour la gestion de la maintenance industrielle.')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-200 text-center"
                >
                  <div className="text-blue-600 text-3xl mb-4">
                    <i className={f.icon}></i>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
                  <p className="text-blueGray-600 text-sm mb-4">{f.description}</p>
                  <Link to={f.route} className="text-blue-600 font-medium hover:underline">
                    {t('landing.features.access', 'Accéder')} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KPI */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-800 mb-12">{t('landing.kpi.title', 'Indicateurs de Performance')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {kpis.map((k, i) => (
                <div key={i} className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-md transition">
                  <div className="text-4xl font-bold text-blue-700 animate-pulse">{k.value}</div>
                  <p className="text-sm text-blueGray-600 uppercase font-semibold mt-2">{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POURQUOI CHOISIR */}
        <section className="bg-blue-50 py-20 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <img
              src="https://source.unsplash.com/600x400?technology,industry"
              alt="Illustration"
              className="rounded-lg shadow-lg w-full"
            />
            <div>
              <h2 className="text-3xl font-bold text-blue-800 mb-6">{t('landing.why.title', 'Pourquoi choisir notre plateforme ?')}</h2>
              <ul className="space-y-4 text-blueGray-700 text-base">
                <li><i className="fas fa-check-circle text-green-500 mr-2"></i> {t('landing.why.feature1', 'Interface intuitive adaptée à tous les rôles')}</li>
                <li><i className="fas fa-check-circle text-green-500 mr-2"></i> {t('landing.why.feature2', 'Suivi en temps réel des interventions')}</li>
                <li><i className="fas fa-check-circle text-green-500 mr-2"></i> {t('landing.why.feature3', 'Automatisation des bons de travail')}</li>
                <li><i className="fas fa-check-circle text-green-500 mr-2"></i> {t('landing.why.feature4', 'Calcul automatique des KPI')}</li>
              </ul>
              <Link
                to="/auth/register"
                className="mt-6 inline-block bg-blue-700 text-white px-6 py-3 rounded shadow hover:bg-blue-800 transition"
              >
                {t('landing.why.demo', 'Demander une démo')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
