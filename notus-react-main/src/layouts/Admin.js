import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import Sidebar from "components/Sidebar/Sidebar.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";
import AdminTopBar from "components/Navbars/AdminTopBar.js";
import NotificationCenter from "components/Notifications/NotificationCenter.js";

// views

import Dashboard from "views/admin/Dashboard.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";
import Component from "views/admin/Component.js";
import AddIntervention from "views/admin/AddIntervention.js";
import Interventions from "views/admin/interventions.js";
import ValidationInterventions from "views/admin/ValidationInterventions.js";
import Listebont from "views/admin/listebont.js";
// Pages modulaires séparées - Sans onglets
import CreateProjectPage from "views/admin/projet/CreateProjectPage.js";
import ManageProjectsPage from "views/admin/projet/ManageProjectsPage.js";
import SubProjectsPage from "views/admin/projet/SubProjectsPage.js";
import ConfirmSubProjectsPage from "views/admin/projet/ConfirmSubProjectsPage.js";
import AnalyticsProjectPage from "views/admin/projet/AnalyticsProjectPage.js";
import SousProjet from "views/admin/SousProjet.js";
import MagasinierDashboard from "views/admin/MagasinierDashboard.js";
import Profile from "views/admin/Profile.js";

// Advanced Modules
import PredictiveKPIDashboard from "components/KPI/PredictiveKPIDashboard.js";
import EnhancedAnalyticsDashboard from "components/Analytics/EnhancedAnalyticsDashboard.js";
import AdvancedAnalyticsDashboard from "components/Analytics/AdvancedAnalyticsDashboard.js";
import AdvancedNotificationCenter from "components/Notifications/AdvancedNotificationCenter.js";
import NotificationSystemTest from "components/Testing/NotificationSystemTest.js";
import ComponentOrderValidation from "components/ComponentOrders/ComponentOrderValidation.js";
import ComponentOrderValidationModern from "components/ComponentOrders/ComponentOrderValidationModern.js";
import { ToastProvider } from "components/Notifications/ToastNotificationSystem.js";
import IntelligentScheduler from "components/Planning/IntelligentScheduler.js";
import TechnicianMobileApp from "components/Mobile/TechnicianMobileApp.js";
import GamificationDashboard from "components/Gamification/GamificationDashboard.js";
import AIAssistant from "components/AI/AIAssistant.js";
import ProtectedRoute from "components/Security/ProtectedRoute.js";
import IntegrationTest from "components/Testing/IntegrationTest.js";
import TechnicianSchedule from "views/TechnicianSchedule.js";
import CreateBonTravail from "views/admin/CreateBonTravail.js";
import TechnicienBonsTravail from "views/admin/TechnicienBonsTravail.js";
import AssignIntervention from "views/admin/AssignIntervention.js";
import HistoriqueTesteur from "views/admin/HistoriqueTesteur.js";
import Testeurs from "views/admin/Testeurs.js";
import KPIDashboard from "views/admin/KPIDashboard.js";
import ProjectDashboard from "views/admin/ProjectDashboard.js";
export default function Admin() {
  return (
    <ToastProvider>
      <Sidebar />
      <div className="relative bg-blueGray-100" style={{ marginLeft: '280px' }}>
        <AdminTopBar />
        <div className="px-4 md:px-10 mx-auto w-full pt-8">
          <Switch>
            <Route path="/admin/dashboard" exact component={Dashboard} />
            <Route path="/admin/maps" exact component={Maps} />
            <Route path="/admin/settings" exact component={Settings} />
            <Route path="/admin/tables" exact component={Tables} />
            <Route path="/admin/component" exact component={Component} />
            <Route path="/admin/AddIntervention" exact component={AddIntervention} />
            <Route path="/admin/interventions" exact component={Interventions} />
            <Route path="/admin/validation-interventions" exact component={ValidationInterventions} />
            <Route path="/admin/component-orders" exact component={ComponentOrderValidation} />
            <Route path="/admin/validation-commandes" exact component={ComponentOrderValidationModern} />
            <Route path="/admin/listebont" exact component={Listebont} />
            {/* Pages modulaires séparées - Protégées pour Chef de Projet et Admin uniquement */}
            <Route path="/admin/projet/create" exact render={() => (
              <ProtectedRoute 
                requiredPermission="create_project"
                fallbackMessage="Accès réservé aux Chefs de Projet et Administrateurs"
              >
                <CreateProjectPage />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/projet/manage" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_project"
                fallbackMessage="Accès réservé aux Chefs de Projet et Administrateurs"
              >
                <ManageProjectsPage />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/projet/subprojects" exact render={() => (
              <ProtectedRoute 
                requiredPermission="create_subproject"
                fallbackMessage="Accès réservé aux Chefs de Projet et Administrateurs"
              >
                <SubProjectsPage />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/projet/confirm" exact render={() => (
              <ProtectedRoute 
                requiredPermission="confirm_subproject"
                fallbackMessage="Accès réservé aux Chefs de Projet et Administrateurs"
              >
                <ConfirmSubProjectsPage />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/projet/analytics" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_analytics"
                fallbackMessage="Accès réservé aux Chefs de Projet et Administrateurs"
              >
                <AnalyticsProjectPage />
              </ProtectedRoute>
            )} />
            
            {/* Redirection par défaut vers la page de création (aussi protégée) */}
            <Route path="/admin/projet" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_project"
                fallbackMessage="Accès réservé aux Chefs de Projet et Administrateurs"
              >
                <CreateProjectPage />
              </ProtectedRoute>
            )} />
            <Route path="/admin/sousprojet" exact component={SousProjet} />
            <Route path="/admin/magasinier" exact component={MagasinierDashboard} />
            <Route path="/admin/profile" exact component={Profile} />
            <Route path="/admin/technician-schedule" exact component={TechnicianSchedule} />
            <Route path="/admin/create-bon-travail" exact component={CreateBonTravail} />
            <Route
            path="/admin/technicien-bons-travail"
            component={TechnicienBonsTravail}
          />
          <Route
            path="/admin/assign-intervention"
            component={AssignIntervention}
          />
            <Route path="/admin/historique-testeur" exact component={HistoriqueTesteur} />
            <Route path="/admin/testeurs" exact component={Testeurs} />
            <Route path="/admin/kpi-dashboard" exact component={KPIDashboard} />
            <Route path="/admin/project-dashboard" exact component={ProjectDashboard} />
            {/* Advanced Modules Routes - Protected */}
            <Route path="/admin/predictive-kpi" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_predictive_kpi"
                fallbackMessage="Accès réservé aux Admins et Chefs de Secteur"
              >
                <PredictiveKPIDashboard />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/enhanced-analytics" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_enhanced_analytics"
                fallbackMessage="Accès réservé aux Admins et Chefs de Secteur"
              >
                <EnhancedAnalyticsDashboard />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/advanced-analytics" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_enhanced_analytics"
                fallbackMessage="Accès réservé aux Admins, Chefs de Secteur et Magasiniers"
              >
                <AdvancedAnalyticsDashboard />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/notifications-center" exact render={() => (
              <AdvancedNotificationCenter userId={1} userRole="MAGASINIER" />
            )} />
            
            <Route path="/admin/test-notifications" exact render={() => (
              <NotificationSystemTest />
            )} />
            
            <Route path="/admin/intelligent-scheduler" exact render={() => (
              <ProtectedRoute 
                requiredPermission="use_intelligent_scheduler"
                fallbackMessage="Accès réservé aux Admins et Chefs de Secteur"
              >
                <IntelligentScheduler />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/technician-mobile" exact render={() => (
              <ProtectedRoute 
                requiredPermission="access_mobile_app"
                fallbackMessage="Accès réservé aux Techniciens"
              >
                <TechnicianMobileApp />
              </ProtectedRoute>
            )} />
            
            <Route path="/admin/gamification" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_gamification"
                fallbackMessage="Module accessible à tous les utilisateurs connectés"
              >
                <GamificationDashboard />
              </ProtectedRoute>
            )} />
            
            {/* Integration Test Route - Admin Only */}
            <Route path="/admin/integration-test" exact render={() => (
              <ProtectedRoute 
                requiredPermission="view_analytics"
                fallbackMessage="Test d'intégration réservé aux administrateurs"
              >
                <IntegrationTest />
              </ProtectedRoute>
            )} />
            
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
      
      {/* Assistant IA Global */}
      <AIAssistant />
      
      {/* Centre de Notifications pour Magasinier */}
      <NotificationCenter />
    </ToastProvider>
  );
}
