import React, { useState, useEffect } from "react";
import moment from "moment";
import 'moment/locale/fr';
import { useLanguage } from "../../contexts/LanguageContext";

// Configurer moment.js en français globalement
moment.locale('fr');

export default function WeeklySchedule() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // État pour forcer le rafraîchissement du composant

  // Récupérer tous les utilisateurs au chargement du composant
  useEffect(() => {
    fetch("http://localhost:8089/PI/user/all")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Erreur lors de la récupération des utilisateurs :", error));
  }, []);

  // Récupérer tous les événements au chargement du composant et quand refreshKey change
  useEffect(() => {
    fetchEvents();
  }, [refreshKey]);

  // Fonction pour récupérer les événements depuis le serveur
  const fetchEvents = () => {
    fetch("http://localhost:8089/PI/planningHoraire/all")
      .then((response) => response.json())
      .then((data) => {
        // Adapter le mapping pour correspondre à la structure de la base de données
        const formattedEvents = data.map((event) => ({
          id: event.id,
          description: event.description,
          start: event.start_date ? new Date(event.start_date) : new Date(event.startDate),
          end: event.end_date ? new Date(event.end_date) : new Date(event.endDate),
          valid: event.valid,
          user_id: event.user_id || (event.user && event.user.id),
          user: event.user,
        }));
        setEvents(formattedEvents);
      })
      .catch((error) => console.error("Erreur lors de la récupération des événements :", error));
  };

  // Fonction pour ajouter un événement
  const handleSubmit = async () => {
    if (!selectedUserId) {
      setErrorMessage("Veuillez sélectionner un utilisateur.");
      return;
    }

    const formattedStartDate = new Date(startDate).toISOString();
    const formattedEndDate = new Date(endDate).toISOString();

    if (!startDate || !endDate) {
      setErrorMessage("Veuillez saisir les dates de début et de fin.");
      return;
    }

    if (moment(startDate).isAfter(moment(endDate))) {
      setErrorMessage("La date de début ne peut pas être après la date de fin.");
      return;
    }

    const data = {
      user: { id: selectedUserId },
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      description: description,
    };

    try {
      const response = await fetch("http://localhost:8089/PI/PI/planningHoraire/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi des données.");
      }

      // Au lieu d'ajouter manuellement l'événement, on force un rechargement
      setRefreshKey(oldKey => oldKey + 1);
      setSuccessMessage("Événement ajouté avec succès !");
      closeModal();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Fonction pour mettre à jour un événement
  const updateEvent = async () => {
    if (!currentEvent || !currentEvent.id) {
      setErrorMessage("Impossible de mettre à jour l'événement : ID invalide.");
      return;
    }

    const formattedStartDate = new Date(startDate).toISOString();
    const formattedEndDate = new Date(endDate).toISOString();

    const data = {
      id: currentEvent.id,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      description: description,
      valid: true,
    };

    try {
      const response = await fetch(`http://localhost:8089/PI/PI/planningHoraire/update/${currentEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'événement.");
      }

      // Force un rechargement après la mise à jour
      setRefreshKey(oldKey => oldKey + 1);
      setSuccessMessage("Événement mis à jour avec succès !");
      closeModal();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Gérer le clic sur un événement
  const handleEventClick = (event) => {
    if (!event.id) {
      setErrorMessage("L'événement sélectionné n'a pas d'ID valide.");
      return;
    }
    setCurrentEvent(event);
    setSelectedUserId(event.user?.id || null);
    setStartDate(moment(event.start).format("YYYY-MM-DDTHH:mm"));
    setEndDate(moment(event.end).format("YYYY-MM-DDTHH:mm"));
    setDescription(event.title);
    setIsUpdateMode(true);
    setShowEventModal(true);
  };

  // Fermer les modales et réinitialiser les états
  const closeModal = () => {
    setShowModal(false);
    setShowEventModal(false);
    setSelectedUserId(null);
    setStartDate("");
    setEndDate("");
    setDescription("");
    setErrorMessage("");
    setIsUpdateMode(false);
    setCurrentEvent(null);
  };

  // Fonction pour générer les horaires toutes les deux heures
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 0; hour <= 22; hour += 2) {
      const startHour = hour < 10 ? "0" + hour : hour;
      const endHour = (hour + 2) < 10 ? "0" + (hour + 2) : (hour + 2);
      timeSlots.push(`${startHour}:00 - ${endHour}:00`);
    }
    return timeSlots;
  };

  // Fonction pour grouper les événements par jour et par créneau horaire
  const groupEventsByDayAndTime = () => {
    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const timeSlots = generateTimeSlots();
    const grouped = {};

    // Initialiser la structure
    daysOfWeek.forEach((day) => {
      grouped[day] = {};
      timeSlots.forEach((timeSlot) => {
        grouped[day][timeSlot] = [];
      });
    });

    // Remplir avec les événements
    events.forEach((event) => {
      const dayOfWeek = moment(event.start).locale('fr').format("dddd");
      const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
      const startHour = moment(event.start).hour();
      const roundedHour = Math.floor(startHour / 2) * 2;
      const formattedStartHour = roundedHour < 10 ? "0" + roundedHour : roundedHour.toString();
      const endHourValue = roundedHour + (roundedHour === 22 ? 2 : 2);
      const formattedEndHour = endHourValue < 10 ? "0" + endHourValue : endHourValue.toString();
      const timeSlot = `${formattedStartHour}:00 - ${formattedEndHour}:00`;

      // S'assurer que la structure existe avant d'ajouter l'événement
      if (grouped[capitalizedDay] && grouped[capitalizedDay][timeSlot]) {
        grouped[capitalizedDay][timeSlot].push(event);
      } else {
        console.log(`Erreur: Impossible de trouver le créneau pour ${capitalizedDay} ${timeSlot}`);
      }
    });

    return grouped;
  };

  // Générer les créneaux horaires et les événements groupés
  const timeSlots = generateTimeSlots();
  const groupedEvents = groupEventsByDayAndTime();

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <div style={{ width: "100%", padding: "24px" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              width: "100%",
              marginBottom: "24px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
              padding: "24px",
              transition: "all 0.3s ease",
            }}
          >
            <h2 style={{ 
                fontSize: "32px", 
                fontWeight: "bold", 
                marginBottom: "24px", 
                textAlign: "center",
                color: "#2c3e50",
                borderBottom: "3px solid #3498db",
                paddingBottom: "12px",
                fontFamily: "'Poppins', sans-serif"
              }}>
                {t('schedule.weekly_title', 'Emploi du Temps Hebdomadaire')}
              </h2>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <button
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  transition: "background 0.3s ease",
                }}
                onClick={() => {
                  setShowModal(true);
                  setIsUpdateMode(false);
                }}
              >
                Ajouter un événement
              </button>
              &nbsp;
              <button
                style={{
                  backgroundColor: "#2ecc71",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  transition: "background 0.3s ease",
                }}
                onClick={() => setRefreshKey(oldKey => oldKey + 1)}
              >
                Rafraîchir les données
              </button>
            </div>

            {/* Tableau de l'emploi du temps */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                backgroundColor: "transparent",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      backgroundColor: "#ffffff",
                      color: "#4a5568",
                      border: "1px solid #e2e8f0",
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>Heure</th>
                    {Object.keys(groupedEvents).map((day) => (
                      <th key={day} style={{ 
                        border: "1px solid #ccc", 
                        padding: "10px",
                        backgroundColor: "#f8f9fa",
                        color: "#2c3e50",
                        fontSize: "0.9rem",
                        fontWeight: "600"
                      }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td style={{ 
                        border: "1px solid #e2e8f0",
                        padding: "12px",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        color: "#4a5568",
                        backgroundColor: "#ffffff",
                        transition: "background-color 0.3s"
                      }}>{timeSlot}</td>
                      {Object.keys(groupedEvents).map((day) => (
                        <td key={`${day}-${timeSlot}`} style={{ 
                          border: "1px solid #ccc", 
                          padding: "10px",
                          minHeight: "80px",
                          verticalAlign: "top"
                        }}>
                          {groupedEvents[day][timeSlot] && groupedEvents[day][timeSlot].map((event) => (
                            <div
                              key={event.id}
                              style={{
                                backgroundColor: "#3498db",
                                color: "white",
                                padding: "12px",
                                borderRadius: "8px",
                                marginBottom: "8px",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.3s ease",
                                transform: "translateY(0)",
                              }}
                              onClick={() => handleEventClick(event)}
                            >
                              <strong>{event.title}</strong>
                              <br />
                              {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter ou mettre à jour un événement */}
      {(showModal || showEventModal) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            backdropFilter: "blur(5px)",
            transition: "all 0.3s ease",
          }}
        >
          <div 
            style={{ 
              backgroundColor: "white", 
              padding: "32px", 
              borderRadius: "16px", 
              width: "500px", 
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              transform: "translateY(0)",
              animation: "modalFadeIn 0.3s ease",
            }}
          >
            <h3 style={{ 
              textAlign: "center", 
              marginBottom: "24px",
              fontSize: "24px",
              color: "#2c3e50",
              fontWeight: "600",
              borderBottom: "2px solid #3498db",
              paddingBottom: "12px",
              fontFamily: "'Poppins', sans-serif"
            }}>
              {isUpdateMode ? "Modifier l'événement" : "Ajouter un événement"}
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <label>Sélectionnez un utilisateur :</label>
              <select
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e9ecef", 
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#2c3e50",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                value={selectedUserId || ""}
                disabled={isUpdateMode}
              >
                <option value="">Choisissez un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.role}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label>Date de début :</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  border: "2px solid #e9ecef", 
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#2c3e50",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label>Date de fin :</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "2px solid #e9ecef", borderRadius: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label>Description :</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "2px solid #e9ecef", borderRadius: "8px" }}
              />
            </div>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={isUpdateMode ? updateEvent : handleSubmit}
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 4px 6px rgba(52, 152, 219, 0.2)",
                }}
              >
                {isUpdateMode ? "Mettre à jour" : "Ajouter"}
              </button>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#2c3e50",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginLeft: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
