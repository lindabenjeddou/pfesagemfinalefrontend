import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import IndexNavbar from "components/Navbars/IndexNavbar";
import Footer from "components/Footers/Footer";

// Images
import heroImage from "../assets/img/team-2-800x800.jpg";
import dashboardImage from "../assets/img/team-1-800x800.jpg";
import planningImage from "../assets/img/team-3-800x800.jpg";
import stockImage from "../assets/img/team-4-470x470.png";
import userManagementImage from "../assets/img/team-2-800x800.jpg";
import interventionImage from "../assets/img/team-1-800x800.jpg";
export default function Index() {
  const { t } = useLanguage();
  
  return (
    <>
      <IndexNavbar />
      <main>
        {/* HERO SECTION */}
        <section 
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated background particles */}
          <div 
            style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}
          ></div>
          <div 
            style={{
              position: 'absolute',
              top: '60%',
              right: '15%',
              width: '6px',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse'
            }}
          ></div>
          <div 
            style={{
              position: 'absolute',
              bottom: '30%',
              left: '20%',
              width: '3px',
              height: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              animation: 'float 7s ease-in-out infinite'
            }}
          ></div>
          
          <div 
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1.5rem',
              width: '100%'
            }}
          >
            <div 
              style={{
                marginLeft: '-1.5rem',
                animation: 'slideInLeft 1s ease-out'
              }}
            >
              <h1 
                style={{
                  fontSize: '4.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  lineHeight: '1.1',
                  animation: 'fadeInUp 1.2s ease-out 0.3s both'
                }}
              >
                {t('index.hero.title', 'Gestion de')} <br />{t('index.hero.title2', 'maintenance')}
              </h1>
              
              <p 
                style={{
                  fontSize: '1.75rem',
                  marginBottom: '2.5rem',
                  fontWeight: '500',
                  animation: 'fadeInUp 1.2s ease-out 0.6s both'
                }}
              >
                {t('index.hero.subtitle', 'Optimisez vos opérations efficacement')}
              </p>
              
              <Link 
                to="/auth/login"
                style={{
                  fontSize: '1.25rem',
                  padding: '1rem 2.5rem',
                  fontWeight: '600',
                  backgroundColor: '#003061',
                  borderRadius: '0.75rem',
                  color: 'white',
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  display: 'inline-block',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'fadeInUp 1.2s ease-out 0.9s both',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#002347';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#003061';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                }}
              >
                {t('index.hero.cta', 'VIEW SERVICES')}
              </Link>
            </div>
          </div>
          
          {/* CSS Animations */}
          <style jsx global>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes slideInLeft {
              from {
                opacity: 0;
                transform: translateX(-50px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            @keyframes slideInRight {
              from {
                opacity: 0;
                transform: translateX(50px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200px 0;
              }
              100% {
                background-position: calc(200px + 100%) 0;
              }
            }
            
            @keyframes bounce {
              0%, 20%, 53%, 80%, 100% {
                transform: translate3d(0,0,0);
              }
              40%, 43% {
                transform: translate3d(0, -8px, 0);
              }
              70% {
                transform: translate3d(0, -4px, 0);
              }
              90% {
                transform: translate3d(0, -2px, 0);
              }
            }
            
            /* Smooth scrolling */
            html {
              scroll-behavior: smooth;
            }
            
            /* Global hover effects */
            .dynamic-card {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .dynamic-card:hover {
              transform: translateY(-8px) scale(1.02);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }
            
            /* Animated backgrounds */
            .animated-bg {
              background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
              background-size: 400% 400%;
              animation: gradientShift 15s ease infinite;
            }
            
            @keyframes gradientShift {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}</style>
        </section>

        {/* ABOUT SECTION - Solution Complete */}
        <section 
          style={{
            padding: '5rem 0',
            backgroundColor: '#f8fafc',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated background elements */}
          <div 
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(45deg, rgba(13, 148, 136, 0.1), rgba(59, 130, 246, 0.1))',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite'
            }}
          ></div>
          <div 
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '300px',
              height: '300px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
              borderRadius: '50%',
              animation: 'float 10s ease-in-out infinite reverse'
            }}
          ></div>
          <div 
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1.5rem'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '3rem',
                alignItems: 'center'
              }}
            >
              {/* Left Content */}
              <div>
                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#003061',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                  }}
                >
                  {t('index.about.badge', 'OPTIMISEZ VOTRE MAINTENANCE')}
                </div>
                
                <h2 
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    lineHeight: '1.2'
                  }}
                >
                  {t('index.about.title', 'Une solution complète pour votre gestion')}
                </h2>
                
                <p 
                  style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    marginBottom: '2rem',
                    lineHeight: '1.7'
                  }}
                >
                  {t('index.about.description', 'Simplifiez la gestion de vos opérations de maintenance avec Sagemcom. Notre plateforme intelligente vous permet d\'optimiser vos processus, réduire les temps d\'arrêt et améliorer l\'efficacité de vos équipes.')}
                </p>
                
                <a 
                  href="#contact" 
                  style={{
                    color: '#1f2937',
                    textDecoration: 'underline',
                    fontWeight: '500',
                    fontSize: '1rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#0d9488';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#1f2937';
                  }}
                >
                  {t('index.about.contact', 'Get in touch')}
                </a>
              </div>
              
              {/* Right Content - Image */}
              <div>
                <div 
                  style={{
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    transform: 'rotate(2deg)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'rotate(0deg) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'rotate(2deg) scale(1)';
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt={t('index.about.image_alt', 'Dashboard maintenance industrielle')}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION - Three Cards */}
        <section 
          style={{
            padding: '5rem 0',
            backgroundColor: '#ffffff',
            position: 'relative'
          }}
        >
          <div 
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1.5rem'
            }}
          >
            {/* Header */}
            <div 
              style={{
                textAlign: 'center',
                marginBottom: '4rem'
              }}
            >
              <div 
                style={{
                  display: 'inline-block',
                  backgroundColor: '#003061',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem'
                }}
              >
                {t('index.services.title')}
              </div>
              
              <h2 
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  lineHeight: '1.2'
                }}
              >
                {t('index.services.subtitle')}
              </h2>
            </div>
            
            {/* Services Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}
            >
              {/* Service Card 1 */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #f3f4f6',
                  animation: 'fadeInUp 0.8s ease-out 0.2s both',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.borderColor = '#0d9488';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#f3f4f6';
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80"
                  alt="Gestion des données matérielles"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.5rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.services.card1.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}
                  >
                    {t('index.services.card1.description')}
                  </p>
                </div>
              </div>

              {/* Service Card 2 */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #f3f4f6',
                  animation: 'fadeInUp 0.8s ease-out 0.4s both',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#f3f4f6';
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Planification des interventions"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.5rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.services.card2.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}
                  >
                    {t('index.services.card2.description')}
                  </p>
                </div>
              </div>

              {/* Service Card 3 */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #f3f4f6',
                  animation: 'fadeInUp 0.8s ease-out 0.6s both',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#f3f4f6';
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Suivi des stocks de pièces de rechange"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.5rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.services.card3.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}
                  >
                    {t('index.services.card3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DAILY OPERATIONS SECTION - Four Cards */}
        <section 
          style={{
            padding: '5rem 0',
            backgroundColor: '#f8fafc',
            position: 'relative'
          }}
        >
          <div 
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1.5rem'
            }}
          >
            {/* Header */}
            <div 
              style={{
                marginBottom: '2rem',
                maxWidth: '900px',
                margin: '0 auto 2rem auto'
              }}
            >
              <div 
                style={{
                  display: 'inline-block',
                  backgroundColor: '#003061',
                  color: 'white',
                  padding: '0.375rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem'
                }}
              >
                {t('index.operations.title')}
              </div>
              
              <h2 
                style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#374151',
                  marginBottom: '0',
                  lineHeight: '1.2',
                  textAlign: 'left'
                }}
              >
                {t('index.operations.subtitle')}
              </h2>
            </div>
            
            {/* Operations Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem',
                maxWidth: '900px',
                margin: '0 auto'
              }}
            >
              {/* Operation Card 1 - Gestion des utilisateurs */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Gestion des utilisateurs"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.25rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {t('index.operations.users.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.operations.users.description')}
                  </p>
                  <a 
                    href="#" 
                    style={{
                      color: '#0d9488',
                      textDecoration: 'underline',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    {t('index.operations.learn_more')}
                  </a>
                </div>
              </div>

              {/* Operation Card 2 - Suivi des interventions */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80"
                  alt="Suivi des interventions"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.25rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {t('index.operations.interventions.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.operations.interventions.description')}
                  </p>
                  <a 
                    href="#" 
                    style={{
                      color: '#0d9488',
                      textDecoration: 'underline',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    Learn more
                  </a>
                </div>
              </div>

              {/* Operation Card 3 - Gestion des stocks */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Gestion des stocks"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.25rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {t('index.operations.stock.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.operations.stock.description')}
                  </p>
                  <a 
                    href="#" 
                    style={{
                      color: '#0d9488',
                      textDecoration: 'underline',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    Learn more
                  </a>
                </div>
              </div>

              {/* Operation Card 4 - Analyse des KPI */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80"
                  alt="Analyse des KPI"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover'
                  }}
                />
                <div 
                  style={{
                    padding: '1.25rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {t('index.operations.kpi.title')}
                  </h3>
                  <p 
                    style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {t('index.operations.kpi.description')}
                  </p>
                  <a 
                    href="#" 
                    style={{
                      color: '#0d9488',
                      textDecoration: 'underline',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    {t('index.operations.learn_more')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section 
          style={{
            backgroundColor: '#003061',
            padding: '5rem 0',
            color: 'white'
          }}
        >
          <div 
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1.5rem'
            }}
          >
            {/* Header above both sections */}
            <div 
              style={{
                textAlign: 'center',
                marginBottom: '3rem'
              }}
            >
              <div 
                style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '0.375rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem'
                }}
              >
                NOUS SOMMES LÀ POUR VOUS
              </div>
              
              <h2 
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '0',
                  lineHeight: '1.2'
                }}
              >
                Assistance et informations rapides
              </h2>
            </div>
            
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '4rem',
                alignItems: 'start'
              }}
            >
              {/* Left Side - Contact Form */}
              <div>
                {/* Form card */}
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}
                >
                <form>
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Name *
                    </label>
                    <input 
                      type="text" 
                      placeholder="Jane Smith"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Email address *
                    </label>
                    <input 
                      type="email" 
                      placeholder="email@website.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Phone number *
                    </label>
                    <input 
                      type="tel" 
                      placeholder="555-555-5555"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Message
                    </label>
                    <textarea 
                      rows="4" 
                      placeholder="Votre message..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        fontSize: '0.875rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    ></textarea>
                  </div>
                  
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <label 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        cursor: 'pointer'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        style={{
                          marginRight: '0.5rem'
                        }}
                      />
                      I allow this website to store my submission so they can respond to my inquiry.
                    </label>
                  </div>
                  
                  <button 
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.5rem',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: 'pulse 2s infinite'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(13, 148, 136, 0.4)';
                      e.currentTarget.style.animation = 'none';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d9488';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.animation = 'pulse 2s infinite';
                    }}
                  >
                    SUBMIT
                  </button>
                 </form>
                </div>
              </div>
              
              {/* Right Side - Contact Info */}
              <div>
                {/* Map Section */}
                <div 
                  style={{
                    marginBottom: '2rem'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '1rem'
                    }}
                  >
                    Notre emplacement
                  </h3>
                  <div 
                    style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.2!2d10.3!3d36.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQyJzAwLjAiTiAxMMKwMTgnMDAuMCJF!5e0!3m2!1sfr!2stn!4v1640000000000!5m2!1sfr!2stn&q=Sagemcom+Ezzahra+Tunisia"
                      width="100%"
                      height="200"
                      style={{
                        border: 'none',
                        borderRadius: '0.75rem'
                      }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Sagemcom Ezzahra Location"
                    ></iframe>
                  </div>
                </div>
                
                <div 
                  style={{
                    marginTop: '2rem'
                  }}
                >
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <h3 
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Nous sommes là pour vous
                    </h3>
                    <p 
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.875rem'
                      }}
                    >
                      📧 test.test@esprit.tn
                    </p>
                  </div>
                  
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <h3 
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Location
                    </h3>
                    <p 
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.875rem'
                      }}
                    >
                      📍 Schmalkalden, TH DE
                    </p>
                  </div>
                  
                  <div 
                    style={{
                      marginBottom: '1.5rem'
                    }}
                  >
                    <h3 
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Hours
                    </h3>
                    <div 
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.875rem',
                        lineHeight: '1.6'
                      }}
                    >
                      <div>Monday - Friday: 9:00am - 10:00pm</div>
                      <div>Saturday: 9:00am - 6:00pm</div>
                      <div>Sunday: 9:00am - 12:00pm</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION - Innovative Design */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

 
        </section>

      </main>
      <Footer />
    </>
  );
}

// Component Functions

function ServiceCard({ image, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ModernServiceCard({ icon, title, description, features, color }) {
  return (
    <div className="group relative">
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full">
        {/* Icon */}
        <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        
        {/* Features */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-500">
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3"></div>
              {feature}
            </div>
          ))}
        </div>
        
        {/* Hover Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
      </div>
    </div>
  );
}
