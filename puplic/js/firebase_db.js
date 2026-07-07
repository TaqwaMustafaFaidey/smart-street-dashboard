// js/firebase_db.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ========================================================
// ⚠️ قومي باستبدال القيم أدناه ببيانات مشروعك الحقيقية من Firebase Settings
// ========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDTQs_H3KOVUkTD-RNnGIIE2nGvOjwf75s",
  authDomain: "smart-street-dashboard-315dc.firebaseapp.com",
  projectId: "smart-street-dashboard-315dc",
  storageBucket: "smart-street-dashboard-315dc.firebasestorage.app",
  messagingSenderId: "584982507857",
  appId: "1:584982507857:web:cb0389114b14c23e21e370",
  measurementId: "G-7TVNFGK93Q"
};

// تهيئة وتشغيل الفايربيز وقاعدة البيانات
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // تم عمل export للـ db عشان لو احتجتيه في سكريبتات فرعية

/**
 * دالة إنشاء بلاغ جديد (تتكفل بإنشاء الكوليكشن والحقول تلقائياً في أول مرة)
 */
export async function createNewReport(reportData) {
    try {
        // إضافة طابع زمني دقيق للبلاغ قبل الرفع لقاعدة البيانات
        const now = new Date();
        const formattedDate = now.toLocaleString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });

        const finalPayload = {
            ...reportData,
            creationDate: formattedDate, // الوقت والتاريخ بتنسيق عربي مقروء
            timestamp: Date.now()        // الـ Timestamp الفعلي للترتيب التصاعدي/التنازلي
        };

        // الرفع المباشر لـ Firestore (يتم إنشاء كوليكشن reports آلياً لو مش موجود)
        const docRef = await addDoc(collection(db, "reports"), finalPayload);
        return docRef.id;
    } catch (error) {
        console.error("Error creating report: ", error);
        throw error;
    }
}

/**
 * دالة الاستماع اللحظي للبلاغات (لتحديث جدول الأدمن والـ Charts فوراً)
 */
export function listenToReports(callback) {
    const reportsQuery = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    
    return onSnapshot(reportsQuery, (snapshot) => {
        const reports = [];
        snapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() });
        });
        callback(reports);
    }, (error) => {
        console.error("Error listening to reports: ", error);
    });
}

/**
 * دالة تحديث حالة البلاغ من لوحة الأدمن (pending -> progress -> resolved)
 */
export async function updateReportStatus(reportId, newStatus) {
    try {
        const reportDocRef = doc(db, "reports", reportId);
        await updateDoc(reportDocRef, {
            status: newStatus
        });
    } catch (error) {
        console.error("Error updating status: ", error);
        throw error;
    }
}