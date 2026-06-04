// js/firebase_db.js

// 1️⃣ حطي كود الربط (Firebase Config) اللي هتديهوني هنا تحت السطر ده:
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// هنا هتحطي الـ firebaseConfig بتاعكِ
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// ==========================================

// تشغيل الفايربيز وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * دالة إنشاء بلاغ جديد (تتكفل بإنشاء الكوليكشن والحقول تلقائياً في أول مرة)
 */
export async function createNewReport(reportData) {
    try {
        // إضافة طابع زمني دقيق للبلاغ قبل الرفع
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
            creationDate: formattedDate, // الوقت والتاريخ
            timestamp: Date.now()        // للترتيب التلقائي
        };

        // الرفع المباشر (الفايربيز سيكريت كوليكشن reports آلياً لو مش موجود)
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
 * دالة تحديث حالة البلاغ من لوحة الأدمن (Open -> In Progress -> Fixed)
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