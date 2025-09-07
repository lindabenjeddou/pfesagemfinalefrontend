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
import Bont from "views/admin/bont.js";
import Listebont from "views/admin/listebont.js";
import Projet from "views/admin/Projet.js";
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
            <Route path="/admin/component-orders" exact component={ComponentOrderValidation} />
            <Route path="/admin/validation-commandes" exact component={ComponentOrderValidationModern} />
            <Route path="/admin/bont" exact component={Bont} />
            <Route path="/admin/listebont" exact component={Listebont} />
            <Route path="/admin/projet" exact component={Projet} />
            <Route path="/admin/sousprojet" exact component={SousProjet} />
            <Route path="/admin/magasinier" exact component={MagasinierDashboard} />
            <Route path="/admin/profile" exact component={Profile} />
            <Route path="/admin/technician-schedule" exact component={TechnicianSchedule} />
            
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
