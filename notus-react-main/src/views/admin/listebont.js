// src/views/admin/Interventions.jsx
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSecurity } from "../../contexts/SecurityContext";
import AdvancedPagination from "../../components/Pagination/AdvancedPagination";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import sagemcomLogo from "assets/img/sagem.png";

export default function Interventions() {
  const { t } = useLanguage();
  const { user } = useSecurity();

  // ---- Interventions
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- Bons par intervention
  const [bonsByIntervention, setBonsByIntervention] = useState({}); // { [id]: {loading, error, data: []} }
  const [expanded, setExpanded] = useState(() => new Set()); // interventions ouvertes
  const [expandedBons, setExpandedBons] = useState(() => new Set()); // bons ouverts

  // ---- Création intervention
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    titre: "",
    priorite: "NORMALE",
    demandeurId: null,
    demandeurNom: "",
    demandeurEmail: "",
  });
  const [userDetails, setUserDetails] = useState(null);

  // ---- Edition de statut des bons
  const BON_STATUTS = [
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "EN_COURS", label: "En cours" },
    { value: "TERMINE", label: "Terminé" },
  ];
  const [statusDrafts, setStatusDrafts] = useState({}); // { [bonId]: { value, saving } }
  const setDraftStatus = (bonId, value) => {
    setStatusDrafts((prev) => ({
      ...prev,
      [bonId]: { ...(prev[bonId] || {}), value },
    }));
  };
  const updateBonStatus = async (bonId, interventionId) => {
    const next = statusDrafts[bonId]?.value;
    if (!next) return;
    setStatusDrafts((prev) => ({
      ...prev,
      [bonId]: { ...(prev[bonId] || {}), saving: true },
    }));
    try {
      const res = await fetch(`http://localhost:8089/PI/pi/bons/update/${bonId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ statut: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchBonsForIntervention(interventionId);
    } catch (e) {
      console.error(e);
      alert("Impossible de mettre à jour le statut du bon.");
    } finally {
      setStatusDrafts((prev) => ({
        ...prev,
        [bonId]: { ...(prev[bonId] || {}), saving: false },
      }));
    }
  };

  // ----------------- Helpers généraux -----------------
  const getToken = () =>
    localStorage.getItem("sagemcom_token") || localStorage.getItem("token");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  });

  // Dates
  function toJsDate(val) {
    if (val == null) return null;
    if (Array.isArray(val)) {
      const [y, m = 1, d = 1, hh = 0, mm = 0, ss = 0, ms = 0] = val;
      return new Date(y, m - 1, d, hh, mm, ss, ms);
    }
    const n = Number(val);
    return isNaN(n) ? new Date(val) : new Date(n);
  }
  function formatDate(val) {
    const d = toJsDate(val);
    if (!d || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR");
  }
  const formatTech = (t) =>
    [t?.firstname || t?.firstName || "", t?.lastname || t?.lastName || ""]
      .join(" ")
      .trim() || (t?.id ? `#${t.id}` : "—");

  // ----- Helpers d'affichage : Description comme Titre -----
  function getInterventionHeader(i, max = 120) {
    const description =
      (i?.description ?? i?.details ?? i?.desc ?? "").toString().trim();
    if (description) return description.length > max ? description.slice(0, max - 1) + "…" : description;

    const fallbackTitle =
      (i?.titre ?? i?.title ?? i?.nom ?? i?.name ?? i?.intitule ?? i?.libelle ?? "")
        .toString()
        .trim();
    if (fallbackTitle) return fallbackTitle.length > max ? fallbackTitle.slice(0, max - 1) + "…" : fallbackTitle;

    return `Intervention #${i?.id ?? ""}`;
  }

  // ----------------- Récup user + interventions -----------------
  useEffect(() => {
    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = getToken();
      const fallback = {
        firstName: user?.firstName || "Prénom",
        lastName: user?.lastName || "Nom",
        email: user?.email || "email@exemple.com",
        role: user?.role || "UTILISATEUR",
        phoneNumber: user?.phoneNumber || "+216 XX XXX XXX",
        adress: user?.adress || "Adresse",
      };
      setUserDetails(fallback);
      setFormData((prev) => ({
        ...prev,
        demandeurId: user?.userId || user?.id,
        demandeurNom: `${fallback.firstName} ${fallback.lastName}`.trim(),
        demandeurEmail: fallback.email,
      }));

      const resp = await fetch("http://localhost:8089/PI/user/all", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (resp.ok) {
        const users = await resp.json();
        const current = users.find((u) => u.id === (user?.userId ?? user?.id));
        if (current) {
          setUserDetails(current);
          setFormData((prev) => ({
            ...prev,
            demandeurId: current.id,
            demandeurNom: `${current.firstName || current.firstname || ""} ${current.lastName || current.lastname || ""}`.trim(),
            demandeurEmail: current.email || "",
          }));
        }
      }
    } catch (e) {
      console.error("fetch user error:", e);
    }
  };

  const fetchInterventions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8089/PI/demandes/recuperer/all", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Erreur lors du chargement des interventions");
      const data = await response.json();

      // Normalisation légère (tolérance champs backend)
      const arr = Array.isArray(data) ? data : [];
      const normalized = arr.map((i) => ({
        ...i,
        titre: (i?.titre ?? i?.title ?? i?.nom ?? i?.name ?? i?.intitule ?? i?.libelle ?? "")
          .toString()
          .trim(),
        description: (i?.description ?? i?.details ?? i?.desc ?? "")
          .toString()
          .trim(),
      }));
      setInterventions(normalized);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les interventions");
    } finally {
      setLoading(false);
    }
  };

  const fetchBonsForIntervention = async (interventionId) => {
    setBonsByIntervention((prev) => ({
      ...prev,
      [interventionId]: { loading: true, error: "", data: [] },
    }));
    try {
      const res = await fetch(
        `http://localhost:8089/PI/pi/bons/intervention/${interventionId}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setBonsByIntervention((prev) => ({
        ...prev,
        [interventionId]: { loading: false, error: "", data: arr },
      }));
    } catch (err) {
      console.error(err);
      setBonsByIntervention((prev) => ({
        ...prev,
        [interventionId]: { loading: false, error: "Erreur de chargement", data: [] },
      }));
    }
  };

  const toggleExpandIntervention = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!bonsByIntervention[id]) fetchBonsForIntervention(id);
      }
      return next;
    });
  };

  const toggleExpandBon = (bonId) => {
    setExpandedBons((prev) => {
      const next = new Set(prev);
      next.has(bonId) ? next.delete(bonId) : next.add(bonId);
      return next;
    });
  };

  // ----------------- Création intervention -----------------
  const createIntervention = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    if (!formData.titre?.trim()) {
      setCreateError("Le titre est obligatoire.");
      setCreateLoading(false);
      return;
    }
    if (!formData.description?.trim()) {
      setCreateError("La description est obligatoire.");
      setCreateLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8089/PI/PI/demandes/create", {
        method: "POST",
        headers: getAuthHeaders(),
        // On envoie aussi 'title' pour compat éventuelle
        body: JSON.stringify({ ...formData, title: formData.titre }),
      });
      if (!response.ok) throw new Error("Erreur lors de la création de l'intervention");

      const createdIntervention = await response.json();
      
      // Envoyer notification au chef de secteur
      try {
        const interventionDesc = formData.titre || formData.description || "Nouvelle intervention";
        await fetch(`http://localhost:8089/PI/PI/notifications/nouvelle-intervention?interventionId=${createdIntervention.id}&interventionDescription=${encodeURIComponent(interventionDesc)}`, {
          method: "POST",
        });
        console.log("✅ Notification envoyée au chef de secteur");
      } catch (notifError) {
        console.warn("⚠️ Erreur notification chef secteur (non bloquant):", notifError);
      }

      setFormData({
        description: "",
        titre: "",
        priorite: "NORMALE",
        demandeurId: user?.id || null,
        demandeurNom: user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "",
        demandeurEmail: user?.email || "",
      });
      setShowCreateForm(false);
      await fetchInterventions();
    } catch (err) {
      console.error("Erreur création:", err);
      setCreateError("Une erreur s'est produite lors de la création.");
    } finally {
      setCreateLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------- PDF (bons) -----------------
  async function urlToDataURL(url) {
    try {
      if (!url) return null;
      if (typeof url === "string" && url.startsWith("data:")) return url;
      const res = await fetch(url, { cache: "no-cache" });
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Impossible de charger l'image:", url, e);
      return null;
    }
  }

  const BRAND = {
    dark: [0, 48, 97],
    mid: [0, 120, 212],
    light: [243, 244, 246],
    text: [17, 24, 39],
    success: [22, 163, 74],
    warning: [217, 119, 6],
    info: [37, 99, 235],
  };

  function chip(doc, { x, y, text, fill = [243, 244, 246], color = [17, 24, 39], padX = 8, padY = 5 }) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const w = doc.getTextWidth(text) + padX * 2;
    const h = 18;
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, w, h, 6, 6, "F");
    doc.setTextColor(...color);
    doc.text(text, x + padX, y + h - padY);
    return { width: w, height: h };
  }
  function labelValue(doc, x, y, label, value, maxWidth) {
    // Label en gras et plus visible
    doc.setTextColor(70, 70, 70); // Gris foncé plus lisible
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11); // Augmenté de 10 à 11
    doc.text(label, x, y);
    
    // Valeur en noir pour meilleure lisibilité
    doc.setTextColor(0, 0, 0); // Noir pur
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12); // Augmenté de 11 à 12
    const wrapped = doc.splitTextToSize(value || "—", maxWidth);
    doc.text(wrapped, x, y + 16); // Augmenté l'espacement de 14 à 16
    return y + 16 + wrapped.length * 14; // Augmenté l'espacement de 12 à 14
  }
  function statusColors(statut) {
    switch (statut) {
      case "TERMINE":
      case "TERMINEE":
        return { fill: [220, 252, 231], color: BRAND.success };
      case "EN_COURS":
        return { fill: [219, 234, 254], color: BRAND.info };
      case "EN_ATTENTE":
        return { fill: [254, 243, 199], color: BRAND.warning };
      default:
        return { fill: [243, 244, 246], color: BRAND.text };
    }
  }

  async function exportBonToPdf(bon, intervention) {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = 42;
      const nowStr = new Date().toLocaleString("fr-FR");

      const logo = await urlToDataURL(sagemcomLogo);
      doc.setFillColor(...BRAND.dark);
      doc.rect(0, 0, pageW, 92, "F");
      doc.setFillColor(...BRAND.mid);
      doc.rect(0, 92, pageW, 6, "F");
      if (logo) doc.addImage(logo, "PNG", M, 22, 140, 40, undefined, "FAST");

      const bonId = bon?.id ?? "";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(`Bon de travail #${bonId}`, M + 160, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Généré le ${nowStr}`, M + 160, 58);

      let cursorY = 120;
      const st = statusColors(bon?.statut);
      let chipX = M;
      chip(doc, { x: chipX, y: cursorY, text: bon?.statut || "—", fill: st.fill, color: st.color });
      chipX += 98;
      chip(doc, {
        x: chipX,
        y: cursorY,
        text: `Type: ${intervention?.typeDemande || "—"}`,
        fill: [219, 234, 254],
        color: BRAND.info,
      });
      chipX += 160;
      chip(doc, { x: chipX, y: cursorY, text: `Priorité: ${intervention?.priorite || "—"}` });

      cursorY += 34;

      // === SECTION: Détails de l'intervention ===
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(M, cursorY, pageW - 2 * M, 180, 12, 12, "FD");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.dark);
      doc.setFontSize(14);
      doc.text("DETAILS DE L'INTERVENTION", M + 14, cursorY + 22);

      let yIntervention = cursorY + 46;
      
      // Colonne gauche - Intervention
      yIntervention = labelValue(
        doc,
        M + 14,
        yIntervention,
        "N° Intervention",
        `#${intervention?.id ?? "—"}`,
        (pageW - 2 * M) / 2 - 28
      );
      yIntervention = labelValue(
        doc,
        M + 14,
        yIntervention + 8,
        "Description",
        intervention?.description || "—",
        (pageW - 2 * M) / 2 - 28
      );
      yIntervention = labelValue(
        doc,
        M + 14,
        yIntervention + 8,
        "Type",
        intervention?.typeDemande || "—",
        (pageW - 2 * M) / 2 - 28
      );
      yIntervention = labelValue(
        doc,
        M + 14,
        yIntervention + 8,
        "Priorité",
        intervention?.priorite || "—",
        (pageW - 2 * M) / 2 - 28
      );

      // Colonne droite - Intervention
      let yInterventionR = cursorY + 46;
      yInterventionR = labelValue(
        doc,
        pageW / 2 + 8,
        yInterventionR,
        "Date demande",
        formatDate(intervention?.dateDemande),
        (pageW - 2 * M) / 2 - 28
      );
      yInterventionR = labelValue(
        doc,
        pageW / 2 + 8,
        yInterventionR + 8,
        "Statut",
        intervention?.statut || "—",
        (pageW - 2 * M) / 2 - 28
      );
      
      // Détails spécifiques selon le type
      if (intervention?.typeDemande === "CURATIVE") {
        yInterventionR = labelValue(
          doc,
          pageW / 2 + 8,
          yInterventionR + 8,
          "Panne",
          intervention?.panne || "—",
          (pageW - 2 * M) / 2 - 28
        );
        yInterventionR = labelValue(
          doc,
          pageW / 2 + 8,
          yInterventionR + 8,
          "Urgence",
          intervention?.urgence ? "OUI" : "NON",
          (pageW - 2 * M) / 2 - 28
        );
      } else if (intervention?.typeDemande === "PREVENTIVE") {
        yInterventionR = labelValue(
          doc,
          pageW / 2 + 8,
          yInterventionR + 8,
          "Fréquence",
          intervention?.frequence || "—",
          (pageW - 2 * M) / 2 - 28
        );
        yInterventionR = labelValue(
          doc,
          pageW / 2 + 8,
          yInterventionR + 8,
          "Prochain RDV",
          formatDate(intervention?.prochainRDV),
          (pageW - 2 * M) / 2 - 28
        );
      }

      cursorY = cursorY + 180 + 18;

      // === SECTION: Informations du bon de travail ===
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(M, cursorY, pageW - 2 * M, 140, 12, 12, "FD");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.dark);
      doc.setFontSize(14);
      doc.text("INFORMATIONS DU BON DE TRAVAIL", M + 14, cursorY + 22);

      let yL = cursorY + 46;
      yL = labelValue(
        doc,
        M + 14,
        yL,
        "Description",
        bon?.description || "—",
        (pageW - 2 * M) / 2 - 28
      );
      yL = labelValue(
        doc,
        M + 14,
        yL + 8,
        "Technicien",
        formatTech(bon?.technicien),
        (pageW - 2 * M) / 2 - 28
      );

      let yR = cursorY + 46;
      yR = labelValue(
        doc,
        pageW / 2 + 8,
        yR,
        "Testeur (Code GMAO)",
        bon?.testeur?.codeGMAO || intervention?.testeurCodeGMAO || "—",
        (pageW - 2 * M) / 2 - 28
      );
      yR = labelValue(
        doc,
        pageW / 2 + 8,
        yR + 8,
        "Statut",
        bon?.statut || "—",
        (pageW - 2 * M) / 2 - 28
      );

      const datesY = Math.max(yL, yR) + 12;
      doc.setTextColor(70, 70, 70); // Gris foncé plus lisible
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Dates", M + 14, datesY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Noir pur pour meilleure lisibilité
      doc.setFontSize(12); // Augmenté de 11 à 12
      doc.text(`Creation: ${formatDate(bon?.dateCreation)}`, M + 14, datesY + 16);
      doc.text(`Debut: ${formatDate(bon?.dateDebut)}`, M + 200, datesY + 16);
      doc.text(`Fin: ${formatDate(bon?.dateFin)}`, M + 340, datesY + 16);

      cursorY = cursorY + 140 + 22;

      // === SECTION: Composants utilisés ===
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.dark);
      doc.setFontSize(14);
      doc.text("COMPOSANTS UTILISES", M, cursorY);
      
      cursorY += 20;

      const composants = Array.isArray(bon?.composants) ? bon.composants : [];
      const compRows = composants.map((c, i) => [
        (c?.id ?? i + 1).toString(),
        c?.component?.trartArticle || "—",
        c?.component?.trartDesignation || "—",
        (c?.quantiteUtilisee ?? "—").toString(),
        c?.component?.trartQuantite ?? "—",
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: M, right: M },
        head: [["#", "Article", "Designation", "Qte utilisee", "Stock actuel"]],
        body: compRows,
        styles: {
          font: "helvetica",
          fontSize: 11, // Augmenté de 10 à 11
          lineColor: [200, 200, 200], // Lignes plus visibles
          lineWidth: 0.8, // Lignes plus épaisses
          textColor: [0, 0, 0], // Noir pur
        },
        headStyles: {
          fillColor: BRAND.dark,
          textColor: [255, 255, 255], // Blanc pur
          halign: "left",
          valign: "middle",
          fontStyle: "bold",
          fontSize: 12, // Augmenté pour l'en-tête
        },
        alternateRowStyles: { fillColor: BRAND.light },
        columnStyles: {
          0: { cellWidth: 40, halign: "center" },
          1: { cellWidth: 100 },
          2: { cellWidth: 260 },
          3: { cellWidth: 90, halign: "center" },
          4: { cellWidth: 90, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 2 && typeof data.cell.text[0] === "string") {
            const s = data.cell.text[0];
            if (s.length > 120) data.cell.text[0] = s.slice(0, 117) + "…";
          }
        },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Généré le ${nowStr} · Page ${i}/${pageCount}`, M, pageH - 18);
      }

      // Signature (vierge)
      doc.setPage(pageCount);
      let y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 28 : pageH - 180;
      if (y > pageH - 180) {
        doc.addPage();
        y = 100;
      }

      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M, y, pageW - 2 * M, 160, 12, 12, "FD");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0); // Noir pur
      doc.setFontSize(14);
      doc.text("SIGNATURE", M + 14, y + 22);

      const sigBoxX = M + 14;
      const sigBoxY = y + 40;
      const sigBoxW = 240;
      const sigBoxH = 80;

      doc.setDrawColor(180);
      doc.setLineWidth(1);
      if (doc.setLineDash) doc.setLineDash([5, 3], 0);
      doc.rect(sigBoxX, sigBoxY, sigBoxW, sigBoxH);
      if (doc.setLineDash) doc.setLineDash();

      const lineY = sigBoxY + sigBoxH + 20;
      doc.setDrawColor(180, 180, 180);
      doc.line(sigBoxX, lineY, sigBoxX + 220, lineY);

      doc.setTextColor(0, 0, 0); // Noir pur
      doc.setFontSize(11);
      doc.text("Nom & Prenom", sigBoxX, lineY + 14);
      doc.text(`Le ${new Date().toLocaleDateString("fr-FR")}`, sigBoxX + 240, lineY + 14);

      doc.save(`bon-${bonId}.pdf`);
    } catch (err) {
      console.error("Export PDF échoué:", err);
      alert("Impossible de générer le PDF (voir console).");
    }
  }

  // ----------------- Config AdvancedPagination -----------------
  const searchFields = ["description", "details", "desc", "titre", "title", "nom", "name", "intitule", "libelle"];
  const sortFields = [
    { key: "dateDemande", label: "Date de demande" },
    { key: "description", label: "Description" },
    { key: "titre", label: "Titre" },
    { key: "priorite", label: "Priorité" },
    { key: "statut", label: "Statut" },
  ];
  const filterFields = [
    {
      key: "statut",
      label: "Statut",
      type: "select",
      options: [
        { value: "EN_ATTENTE", label: "En Attente" },
        { value: "EN_COURS", label: "En Cours" },
        { value: "TERMINEE", label: "Terminée" },
        { value: "REFUSEE", label: "Refusée" },
        { value: "VALIDEE", label: "Validée" },
        { value: "PLANIFIEE", label: "Planifiée" },
      ],
    },
    {
      key: "typeDemande",
      label: "Type",
      type: "select",
      options: [
        { value: "CURATIVE", label: "Curative" },
        { value: "PREVENTIVE", label: "Préventive" },
      ],
    },
    {
      key: "priorite",
      label: "Priorité",
      type: "select",
      options: [
        { value: "NORMALE", label: "Normale" },
        { value: "HAUTE", label: "Haute" },
        { value: "URGENTE", label: "Urgente" },
      ],
    },
  ];

  // ----------------- Rendus loading/erreur -----------------
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loaderCard}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚙️</div>
          <h2 style={styles.loaderTitle}>
            {t("interventions.loading", "Chargement des interventions...")}
          </h2>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.5rem", color: "#dc2626", marginBottom: "1rem" }}>
            {t("interventions.error", "Erreur")}
          </h2>
          <p style={{ color: "#dc2626", marginBottom: "2rem" }}>{error}</p>
          <button onClick={fetchInterventions} style={styles.retryBtn}>
            🔄 {t("interventions.retry", "Réessayer")}
          </button>
        </div>
      </div>
    );
  }

  // ----------------- UI principale -----------------
  return (
    <>
      {/* Animations globales */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
      `}</style>

      {/* Background avec bulles flottantes */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        zIndex: -2
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00d4ff, #0078d4' : '#ff006e, #8338ec'})`,
              borderRadius: '50%',
              top: `${10 + i * 15}%`,
              left: `${5 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Grande carte conteneur */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <div style={{ padding: '2rem', position: 'relative', zIndex: 2 }}>
            {/* Header moderne */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,48,97,0.95) 0%, rgba(0,120,212,0.9) 50%, rgba(0,48,97,0.95) 100%)',
              borderRadius: '24px',
              padding: '2.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,48,97,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              animation: 'slideInLeft 0.8s ease-out',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,255,255,0.15) 0%, transparent 50%)`,
                zIndex: -1
              }} />

              <div style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: '0.75rem',
                  fontFamily: 'Inter, sans-serif',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  📋 {t("interventions.title", "Gestion des Interventions")}
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'rgba(255,255,255,0.95)',
                  margin: 0,
                  fontWeight: '500',
                  textShadow: '0 1px 5px rgba(0,0,0,0.2)'
                }}>
                  {t("interventions.subtitle", "Suivi et Gestion des Demandes d'Intervention Sagemcom")}
                </p>
              </div>
            </div>

            {/* Stats modernes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {[
                {
                  title: 'Total Interventions',
                  value: interventions.length,
                  icon: '📊',
                  color: '#0078d4',
                  bgGradient: 'linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,48,97,0.05) 100%)',
                  badge: `${interventions.filter((i) => i.statut === "EN_ATTENTE").length} en attente`
                },
                {
                  title: 'En Attente',
                  value: interventions.filter((i) => i.statut === "EN_ATTENTE").length,
                  icon: '⏳',
                  color: '#f59e0b',
                  bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)',
                  badge: 'À traiter'
                },
                {
                  title: 'En Cours',
                  value: interventions.filter((i) => i.statut === "EN_COURS").length,
                  icon: '🔄',
                  color: '#3b82f6',
                  bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)',
                  badge: 'En traitement'
                },
                {
                  title: 'Refusées',
                  value: interventions.filter((i) => i.statut === "REFUSEE").length,
                  icon: '❌',
                  color: '#ef4444',
                  bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                  badge: 'Rejetées'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`;
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: stat.bgGradient,
                    zIndex: -1
                  }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#374151',
                        margin: '0 0 0.75rem 0',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {stat.title}
                      </p>
                      <p style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#003061',
                        margin: '0 0 0.5rem 0',
                        textShadow: '0 2px 4px rgba(0,48,97,0.2)',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {stat.value}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {stat.badge}
                      </p>
                    </div>
                    <div style={{
                      fontSize: '3rem',
                      opacity: 0.8,
                      animation: 'pulse 2s ease-in-out infinite',
                      filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* Liste + pagination */}
          <div style={styles.listCard}>
            <h3 style={styles.blockTitle}>
              📋 Liste des interventions ({interventions.length})
            </h3>

            <AdvancedPagination
              data={interventions}
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
              searchFields={searchFields}
              sortFields={sortFields}
              filterFields={filterFields}
              showSearch={true}
              showFilters={true}
              showSort={true}
              renderItem={(intervention) => {
                const isOpen = expanded.has(intervention.id);
                const bonsState = bonsByIntervention[intervention.id];

                return (
                  <div
                    key={intervention.id}
                    style={styles.card}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    {/* En-tête intervention */}
                    <div style={styles.cardHeader}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.titleRow}>
                          {/* 👉 Description comme titre */}
                          <h4 style={styles.cardTitle}>
                            {getInterventionHeader(intervention)}
                          </h4>

                          <span
                            style={{
                              ...styles.pill,
                              background:
                                intervention.typeDemande === "CURATIVE" ? "#fee2e2" : "#dbeafe",
                              color:
                                intervention.typeDemande === "CURATIVE" ? "#dc2626" : "#2563eb",
                            }}
                          >
                            {intervention.typeDemande === "CURATIVE"
                              ? "🔧 CURATIVE"
                              : "🛠️ PRÉVENTIVE"}
                          </span>
                        </div>

                        {/* Sous-texte : afficher le titre s'il existe */}
                        <p style={styles.description}>
                          {intervention.titre?.trim()
                            ? `Titre : ${intervention.titre}`
                            : ""}
                        </p>

                        <div style={styles.metaRow}>
                          <span>
                            📅{" "}
                            {intervention.dateDemande
                              ? formatDate(intervention.dateDemande)
                              : "Date non disponible"}
                          </span>
                          <span>⚡ Priorité: {intervention.priorite || "Non définie"}</span>
                          <span>🧪 Testeur: {intervention.testeurCodeGMAO || "—"}</span>
                        </div>
                      </div>

                      <div style={styles.statusCol}>
                        <span
                          style={{
                            ...styles.statusPill,
                            background:
                              intervention.statut === "EN_ATTENTE"
                                ? "#fef3c7"
                                : intervention.statut === "EN_COURS"
                                ? "#dbeafe"
                                : intervention.statut === "REFUSEE"
                                ? "#fee2e2"
                                : "#dcfce7",
                            color:
                              intervention.statut === "EN_ATTENTE"
                                ? "#d97706"
                                : intervention.statut === "EN_COURS"
                                ? "#2563eb"
                                : intervention.statut === "REFUSEE"
                                ? "#dc2626"
                                : "#16a34a",
                          }}
                        >
                          {intervention.statut === "EN_ATTENTE"
                            ? "⏳ EN ATTENTE"
                            : intervention.statut === "EN_COURS"
                            ? "✅ EN COURS"
                            : intervention.statut === "REFUSEE"
                            ? "❌ REFUSÉE"
                            : "🏁 TERMINÉE"}
                        </span>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => toggleExpandIntervention(intervention.id)}
                            style={styles.expandBtn}
                          >
                            {isOpen ? "▴ Masquer les bons" : "▾ Afficher les bons"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bloc bons de travail */}
                    {isOpen && (
                      <div style={styles.bonsBlock}>
                        <h5 style={styles.bonsTitle}>Bons de travail associés</h5>

                        {!bonsState || bonsState.loading ? (
                          <div style={styles.bonsLoading}>Chargement des bons…</div>
                        ) : bonsState.error ? (
                          <div style={styles.bonsError}>{bonsState.error}</div>
                        ) : (bonsState.data?.length ?? 0) === 0 ? (
                          <div style={styles.bonsEmpty}>
                            Aucun bon lié à cette intervention.
                          </div>
                        ) : (
                          <div style={{ overflowX: "auto" }}>
                            <table style={styles.table}>
                              <thead>
                                <tr>
                                  <th style={{ ...styles.th, width: 60 }}></th>
                                  <th style={{ ...styles.th, width: 90 }}>Bon #</th>
                                  <th style={styles.th}>Description</th>
                                  <th style={styles.th}>Statut</th>
                                  <th style={styles.th}>Technicien</th>
                                  <th style={styles.th}>Testeur</th>
                                  <th style={styles.th}>Création</th>
                                  <th style={styles.th}>Début</th>
                                  <th style={styles.th}>Fin</th>
                                  <th style={{ ...styles.th, width: 120 }}>Composants</th>
                                  <th style={{ ...styles.th, minWidth: 320 }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bonsState.data.map((bon) => {
                                  const bonId = bon?.id;
                                  const open = expandedBons.has(bonId);
                                  const tech = formatTech(bon?.technicien);
                                  const testeur = bon?.testeur?.codeGMAO || "—";
                                  const draftVal =
                                    statusDrafts[bonId]?.value ?? bon?.statut ?? "EN_ATTENTE";
                                  const saving = !!statusDrafts[bonId]?.saving;
                                  const unchanged = draftVal === bon?.statut;

                                  return (
                                    <React.Fragment key={bonId}>
                                      <tr style={styles.tr}>
                                        <td style={styles.td}>
                                          <button
                                            onClick={() => toggleExpandBon(bonId)}
                                            style={styles.smallToggle}
                                            title={open ? "Replier" : "Voir les composants"}
                                          >
                                            {open ? "−" : "+"}
                                          </button>
                                        </td>
                                        <td style={styles.td}>#{bonId}</td>
                                        <td style={{ ...styles.td, maxWidth: 360 }}>
                                          <span title={bon?.description || ""}>
                                            {bon?.description || "—"}
                                          </span>
                                        </td>
                                        <td style={styles.td}>
                                          <span
                                            style={{
                                              ...styles.pill,
                                              background:
                                                bon?.statut === "EN_ATTENTE"
                                                  ? "#fef3c7"
                                                  : bon?.statut === "EN_COURS"
                                                  ? "#dbeafe"
                                                  : "#dcfce7",
                                              color:
                                                bon?.statut === "EN_ATTENTE"
                                                  ? "#d97706"
                                                  : bon?.statut === "EN_COURS"
                                                  ? "#2563eb"
                                                  : "#16a34a",
                                            }}
                                          >
                                            {bon?.statut || "—"}
                                          </span>
                                        </td>
                                        <td style={styles.td}>{tech}</td>
                                        <td style={styles.td}>{testeur}</td>
                                        <td style={styles.td}>{formatDate(bon?.dateCreation)}</td>
                                        <td style={styles.td}>{formatDate(bon?.dateDebut)}</td>
                                        <td style={styles.td}>{formatDate(bon?.dateFin)}</td>
                                        <td style={styles.td}>
                                          {Array.isArray(bon?.composants)
                                            ? bon.composants.length
                                            : "—"}
                                        </td>
                                        <td style={styles.td}>
                                          <div
                                            style={{
                                              display: "flex",
                                              gap: 8,
                                              alignItems: "center",
                                              flexWrap: "wrap",
                                            }}
                                          >
                                            <select
                                              aria-label="Changer le statut"
                                              value={draftVal}
                                              onChange={(e) =>
                                                setDraftStatus(bonId, e.target.value)
                                              }
                                              style={{
                                                border: "1px solid #e5e7eb",
                                                background: "white",
                                                borderRadius: 8,
                                                padding: "6px 8px",
                                                fontSize: "0.85rem",
                                              }}
                                            >
                                              {BON_STATUTS.map((s) => (
                                                <option key={s.value} value={s.value}>
                                                  {s.label}
                                                </option>
                                              ))}
                                            </select>

                                            <button
                                              onClick={() =>
                                                updateBonStatus(bonId, intervention.id)
                                              }
                                              disabled={saving || unchanged}
                                              style={{
                                                border: "1px solid #e5e7eb",
                                                background: saving ? "#9ca3af" : "#dcfce7",
                                                color: "#166534",
                                                borderRadius: 8,
                                                padding: "6px 10px",
                                                fontWeight: 600,
                                                cursor: saving || unchanged ? "not-allowed" : "pointer",
                                              }}
                                              title="Enregistrer le nouveau statut"
                                            >
                                              {saving ? "… Sauvegarde" : "💾 Enregistrer"}
                                            </button>

                                            {bon?.statut !== "TERMINE" && (
                                              <button
                                                onClick={() => {
                                                  setDraftStatus(bonId, "TERMINE");
                                                  updateBonStatus(bonId, intervention.id);
                                                }}
                                                style={{
                                                  border: "1px solid #e5e7eb",
                                                  background: "#dcfce7",
                                                  color: "#166534",
                                                  borderRadius: 8,
                                                  padding: "6px 10px",
                                                  fontWeight: 600,
                                                }}
                                                title="Marquer comme TERMINÉ"
                                              >
                                                ✅ Terminer
                                              </button>
                                            )}

                                            <button
                                              onClick={() =>
                                                exportBonToPdf(bon, intervention)
                                              }
                                              style={{
                                                border: "1px solid #e5e7eb",
                                                background: "white",
                                                borderRadius: 8,
                                                padding: "6px 10px",
                                                fontWeight: 600,
                                              }}
                                              title="Exporter ce bon en PDF"
                                            >
                                              📄 PDF
                                            </button>
                                          </div>
                                        </td>
                                      </tr>

                                      {open && (
                                        <tr>
                                          <td style={styles.td} colSpan={11}>
                                            {Array.isArray(bon?.composants) &&
                                            bon.composants.length > 0 ? (
                                              <div style={{ overflowX: "auto" }}>
                                                <table style={styles.subTable}>
                                                  <thead>
                                                    <tr>
                                                      <th style={{ ...styles.th, width: 90 }}>
                                                        Ligne #
                                                      </th>
                                                      <th style={styles.th}>Article</th>
                                                      <th style={styles.th}>Désignation</th>
                                                      <th style={styles.th}>Qté utilisée</th>
                                                      <th style={styles.th}>Stock actuel</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {bon.composants.map((lc, idx) => (
                                                      <tr key={lc?.id ?? idx} style={styles.tr}>
                                                        <td style={styles.td}>
                                                          {lc?.id ?? idx + 1}
                                                        </td>
                                                        <td style={{ ...styles.td, fontWeight: 600 }}>
                                                          {lc?.component?.trartArticle || "—"}
                                                        </td>
                                                        <td style={{ ...styles.td, maxWidth: 520 }}>
                                                          <span
                                                            title={
                                                              lc?.component?.trartDesignation || ""
                                                            }
                                                          >
                                                            {lc?.component?.trartDesignation || "—"}
                                                          </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                          {lc?.quantiteUtilisee ?? "—"}
                                                        </td>
                                                        <td style={styles.td}>
                                                          {lc?.component?.trartQuantite ?? "—"}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div style={styles.bonsEmpty}>Aucun composant.</div>
                                            )}
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
          </div>
        </div>
      </div>

      {/* Modal création intervention */}
      {showCreateForm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Créer une nouvelle intervention</h3>

            {createError && <div style={styles.modalError}>{createError}</div>}

            <form onSubmit={createIntervention}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.label}>Titre</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  style={{ ...styles.input, resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.label}>Priorité</label>
                <select
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="NORMALE">Normale</option>
                  <option value="HAUTE">Haute</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowCreateForm(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={createLoading} style={styles.submitBtn(createLoading)}>
                  {createLoading ? "⏳ Création..." : "✅ Créer l'intervention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ----------------------- Styles ---------------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
    padding: "2rem",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  loaderCard: {
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "3rem",
    boxShadow: "0 32px 64px rgba(0, 0, 0, 0.12)",
  },
  loaderTitle: { fontSize: "1.5rem", color: "#003061", marginBottom: "1rem" },
  errorCard: {
    textAlign: "center",
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    borderRadius: "24px",
    padding: "3rem",
    border: "1px solid #ef4444",
    maxWidth: "500px",
  },
  retryBtn: {
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #003061, #0078d4)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  headerCard: {
    background: "linear-gradient(135deg, #003061, #0078d4)",
    borderRadius: "24px",
    padding: "2rem",
    marginBottom: "2rem",
    color: "white",
    textAlign: "center",
  },
  headerTitle: { fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" },
  headerSubtitle: { fontSize: "1.1rem", opacity: 0.9 },

  toolbarCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "flex-end",
  },
  createBtn: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  statsCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "2rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  blockTitle: { fontSize: "1.2rem", fontWeight: 600, color: "#374151", marginBottom: "1.5rem" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },

  listCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" },
  titleRow: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" },
  cardTitle: { fontSize: "1.1rem", fontWeight: 600, color: "#374151", margin: 0 },
  pill: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  description: { color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1rem 0", lineHeight: 1.5 },
  metaRow: { display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" },

  statusCol: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
  statusPill: {
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  expandBtn: {
    padding: "0.5rem 0.75rem",
    background: "linear-gradient(135deg, #003061, #0078d4)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  bonsBlock: {
    marginTop: "1rem",
    borderTop: "1px dashed #e5e7eb",
    paddingTop: "1rem",
  },
  bonsTitle: { fontSize: "0.95rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem" },
  bonsLoading: { fontSize: "0.9rem", color: "#6b7280" },
  bonsError: { fontSize: "0.9rem", color: "#dc2626" },
  bonsEmpty: { fontSize: "0.9rem", color: "#6b7280" },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
  },
  subTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "0.5rem",
  },
  th: {
    textAlign: "left",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#6b7280",
    background: "#f9fafb",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  tr: { background: "white" },
  td: {
    fontSize: "0.875rem",
    color: "#111827",
    padding: "10px 12px",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "top",
  },
  smallToggle: {
    border: "1px solid #e5e7eb",
    background: "white",
    borderRadius: "8px",
    padding: "2px 8px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalCard: {
    background: "white",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: { fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem", color: "#374151" },
  modalError: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid " +
      "#d1d5db",
    borderRadius: "8px",
    fontSize: "0.875rem",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  submitBtn: (loading) => ({
    padding: "0.75rem 1.5rem",
    background: loading ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
  }),
};

/* --------------------------- Petits composants ------------------------------ */
function StatBox({ color, border, bg, value, label }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "1rem",
        background: bg,
        borderRadius: "12px",
        border: `1px solid ${border}`,
      }}
    >
      <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
      <p style={{ color, fontSize: "0.875rem" }}>{label}</p>
    </div>
  );
}
