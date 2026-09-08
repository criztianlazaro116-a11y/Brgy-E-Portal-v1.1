// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfSxkgjeJb8jquIAjsTz6Yld6Jt0Ax8w8",
  authDomain: "mywifi-e51c2.firebaseapp.com",
  databaseURL: "https://mywifi-e51c2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mywifi-e51c2",
  storageBucket: "mywifi-e51c2.firebasestorage.app",
  messagingSenderId: "597216691478",
  appId: "1:597216691478:web:1c8fa9dd2784fb5fdbbc37",
  measurementId: "G-KGPFM2561X"
};

// Initialize Firebase Core Services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* ==========================================
   BARANGAY PORTAL SDK HELPER FUNCTIONS
   ========================================== */

/**
 * 1. Register Resident Account + File Upload
 */
export async function registerResident(email, password, profileData, idFile) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Upload Valid ID file to Firebase Storage
    const storageRef = ref(storage, `ids/resident_${user.uid}_${idFile.name}`);
    await uploadBytes(storageRef, idFile);
    const idPhotoUrl = await getDownloadURL(storageRef);

    // Save Resident Record in Firestore
    await addDoc(collection(db, "residents"), {
      uid: user.uid,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      purok: profileData.purok,
      contact: profileData.contact,
      email: email,
      idPhotoUrl: idPhotoUrl,
      role: "resident",
      accountStatus: "pending", // Waiting official verification
      createdAt: serverTimestamp()
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error registering resident:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Submit Document Request (Clearance, Residency, etc.)
 */
export async function submitDocumentRequest(residentUid, documentType, purpose) {
  try {
    const refNo = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const docRef = await addDoc(collection(db, "document_requests"), {
      referenceNo: refNo,
      residentUid: residentUid,
      documentType: documentType,
      purpose: purpose,
      status: "pending",
      requestedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, referenceNo: refNo };
  } catch (error) {
    console.error("Error submitting request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Fetch Requests for Admin Dashboard
 */
export async function getAllDocumentRequests() {
  try {
    const querySnapshot = await getDocs(collection(db, "document_requests"));
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return requests;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}