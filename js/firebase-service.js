/**
 * إعداد وربط Firebase Cloud Firestore
 * اتحاد طلاب كلية الحاسبات وعلوم البيانات 2027
 * رئيس الاتحاد: سيف عمرو | نائب الرئيس: علي تيتو
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    deleteDoc, 
    onSnapshot,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAs9xXCaNeDzqlMc8i8Km31R0mKd2XfqTQ",
    authDomain: "itthad-2027.firebaseapp.com",
    projectId: "itthad-2027",
    storageBucket: "itthad-2027.firebasestorage.app",
    messagingSenderId: "132363949455",
    appId: "1:132363949455:web:e3a1e2eb5c0996fec267fa",
    measurementId: "G-DG4T7M8635"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const MEMBERS_COLLECTION = "union_members_2027";

// Expose Service to Global Window for easy integration with app.js
window.FirebaseSync = {
    isOnline: false,

    // Initialize real-time listener
    initListener(onUpdateCallback) {
        try {
            const colRef = collection(db, MEMBERS_COLLECTION);
            
            // Listen to real-time changes across all devices!
            onSnapshot(colRef, (snapshot) => {
                const members = [];
                snapshot.forEach(docSnap => {
                    members.push(docSnap.data());
                });

                this.isOnline = true;
                this.updateSyncBadge(true);
                
                if (typeof onUpdateCallback === 'function') {
                    onUpdateCallback(members);
                }
            }, (error) => {
                console.warn("Firestore sync warning (falling back to local):", error);
                this.isOnline = false;
                this.updateSyncBadge(false, error.message);
            });
        } catch (err) {
            console.error("Firebase init error:", err);
            this.isOnline = false;
            this.updateSyncBadge(false);
        }
    },

    // Save or Update a member in Cloud Firestore
    async saveMember(member) {
        if (!member || !member.id) return;
        try {
            const docRef = doc(db, MEMBERS_COLLECTION, member.id);
            await setDoc(docRef, member, { merge: true });
            return true;
        } catch (error) {
            console.error("Error saving member to Firestore:", error);
            throw error;
        }
    },

    // Delete a member from Cloud Firestore
    async deleteMember(memberId) {
        if (!memberId) return;
        try {
            const docRef = doc(db, MEMBERS_COLLECTION, memberId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting member from Firestore:", error);
            throw error;
        }
    },

    // Clear all members in Cloud Firestore
    async clearAll(membersList) {
        try {
            const batch = writeBatch(db);
            membersList.forEach(m => {
                const docRef = doc(db, MEMBERS_COLLECTION, m.id);
                batch.delete(docRef);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error clearing all in Firestore:", error);
            throw error;
        }
    },

    // Update Live Sync Status Indicator in the UI
    updateSyncBadge(isLive, errorMsg = "") {
        const badge = document.getElementById("cloudSyncStatusBadge");
        if (!badge) return;

        if (isLive) {
            badge.className = "cloud-sync-badge live";
            badge.innerHTML = `
                <span class="pulse-dot"></span>
                <span>سحابي مباشر (مُتصل)</span>
            `;
            badge.title = "البيانات متصلة سحابياً وتسمع فورياً في جميع الأجهزة والموبايل";
        } else {
            badge.className = "cloud-sync-badge offline";
            badge.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>مزامنة محلية</span>
            `;
            badge.title = errorMsg ? `تنبيه: ${errorMsg} - راجع قواعد Firestore Rules` : "جاري الاتصال بقاعدة البيانات السحابية...";
        }
    }
};

// Dispatch event when Firebase is loaded and ready
window.dispatchEvent(new CustomEvent('FirebaseSyncReady'));
