import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme
import { colors } from "theme";

// Translation Context
import { LanguageProvider } from "contexts/LanguageContext";

// Advanced Contexts
import { ProjectProvider } from "contexts/ProjectContext";
import { SecurityProvider } from "contexts/SecurityContext";
import { NotificationProvider } from "components/Notifications/NotificationSystem";

// PWA Components
import InstallPWA from "components/PWA/InstallPWA";

// layouts
import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import Mobile from "layouts/Mobile.js";

// views without layouts
import Landing from "views/Landing.js";
import Profile from "views/Profile.js";
import Index from "views/Index.js";

// Styles
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

// Create a Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primaryLight,
    },
    background: {
      default: colors.grayLight,
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <LanguageProvider>
      <NotificationProvider>
        <SecurityProvider>
          <ProjectProvider>
            <BrowserRouter>
            <Switch>
              {/* add routes with layouts */}
              <Route path="/admin" component={Admin} />
              <Route path="/auth" component={Auth} />
              <Route path="/mobile" component={Mobile} />
              {/* add routes without layouts */}
              <Route path="/landing" exact component={Landing} />
              <Route path="/profile" exact component={Profile} />
              <Route path="/" exact component={Index} />
              {/* add redirect for first page */}
              <Redirect from="*" to="/" />
            </Switch>
            <InstallPWA />
            </BrowserRouter>
          </ProjectProvider>
        </SecurityProvider>
      </NotificationProvider>
    </LanguageProvider>
  </ThemeProvider>,
  document.getElementById("root")
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration.scope);
        
        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('⚠️ Échec enregistrement Service Worker:', error);
      });
  });

  // Détecter quand l'app peut être installée
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 App peut être installée');
    
    // Afficher une notification ou un bouton pour installer l'app
    // Vous pouvez créer un composant React pour cela
  });

  // Détecter quand l'app a été installée
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installée avec succès');
    deferredPrompt = null;
  });
}