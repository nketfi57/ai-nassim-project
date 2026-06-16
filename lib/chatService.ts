import { db } from "./firebase";
import { collection, addDoc, query, where, orderBy, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

// Sauvegarder un message dans le chat
export async function saveMessage(studentName: string, role: 'user' | 'assistant', content: string, imageUrl?: string) {
  try {
    await addDoc(collection(db, "messages"), {
      studentName,
      role,
      content,
      ...(imageUrl && { imageUrl }), 
      timestamp: new Date()
    });
  } catch (e) {
    console.error("Erreur lors de la sauvegarde Firestore : ", e);
  }
}

// Récupérer l'historique d'un élève
export async function getHistory(studentName: string) {
  try {
    const q = query(
      collection(db, "messages"), 
      where("studentName", "==", studentName),
      orderBy("timestamp", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error("Erreur récupération historique Firestore :", e);
    return [];
  }
}

// [ADMIN] Récupérer ABSOLUMENT TOUS les messages pour l'admin
export async function getAllMessagesForAdmin() {
  try {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error("Erreur récupération globale Admin :", e);
    return [];
  }
}

// [ADMIN] Sauvegarder la configuration de l'élève (Note du parent + Difficulté)
export async function saveStudentConfig(studentName: string, parentNote: string, difficulty: string) {
  try {
    await setDoc(doc(db, "studentConfigs", studentName), {
      parentNote,
      difficulty,
      updatedAt: new Date()
    });
  } catch (e) {
    console.error("Erreur sauvegarde config :", e);
  }
}

// Récupérer la configuration d'un élève
export async function getStudentConfig(studentName: string) {
  try {
    const docRef = doc(db, "studentConfigs", studentName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    // Valeurs par défaut si aucune config n'existe encore
    return { parentNote: "Aucune consigne pour le moment.", difficulty: "Moyen" };
  } catch (e) {
    console.error("Erreur récupération config :", e);
    return { parentNote: "Aucune consigne pour le moment.", difficulty: "Moyen" };
  }
}