// Firebase configuration and services
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} = require('firebase/firestore');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDffudUm4k56hOmRp5RDxh2qolYqGpJUwQ",
  authDomain: "xpectra-is-best.firebaseapp.com",
  projectId: "xpectra-is-best",
  storageBucket: "xpectra-is-best.firebasestorage.app",
  messagingSenderId: "948726499152",
  appId: "1:948726499152:web:ae1dd756631bf33fd1ce55",
  measurementId: "G-R0SPDYSH45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// User management
const createUser = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Store additional user info in Firestore
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Site management
const createSite = async (userId, siteData) => {
  try {
    const apiKey = generateApiKey();
    
    const newSite = {
      userId,
      name: siteData.name,
      domain: siteData.domain,
      allowedOrigins: siteData.allowedOrigins || [],
      apiKey,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'sites'), newSite);
    return { 
      id: docRef.id,
      ...newSite,
      apiKey
    };
  } catch (error) {
    throw error;
  }
};

const getUserSites = async (userId) => {
  try {
    const sitesQuery = query(collection(db, 'sites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(sitesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    throw error;
  }
};

const getSiteById = async (siteId) => {
  try {
    const docRef = doc(db, 'sites', siteId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Site not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    };
  } catch (error) {
    throw error;
  }
};

const getSiteByApiKey = async (apiKey) => {
  try {
    const sitesQuery = query(collection(db, 'sites'), where('apiKey', '==', apiKey));
    const querySnapshot = await getDocs(sitesQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid API key');
    }
    
    const site = querySnapshot.docs[0];
    return {
      id: site.id,
      ...site.data(),
      createdAt: site.data().createdAt?.toDate(),
      updatedAt: site.data().updatedAt?.toDate()
    };
  } catch (error) {
    throw error;
  }
};

const updateSite = async (siteId, siteData) => {
  try {
    const docRef = doc(db, 'sites', siteId);
    const updateData = {
      ...siteData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    
    const updatedSite = await getDoc(docRef);
    return {
      id: updatedSite.id,
      ...updatedSite.data(),
      createdAt: updatedSite.data().createdAt?.toDate(),
      updatedAt: updatedSite.data().updatedAt?.toDate()
    };
  } catch (error) {
    throw error;
  }
};

const deleteSite = async (siteId) => {
  try {
    await deleteDoc(doc(db, 'sites', siteId));
    return true;
  } catch (error) {
    throw error;
  }
};

const regenerateSiteApiKey = async (siteId) => {
  try {
    const newApiKey = generateApiKey();
    const docRef = doc(db, 'sites', siteId);
    
    await updateDoc(docRef, {
      apiKey: newApiKey,
      updatedAt: serverTimestamp()
    });
    
    return newApiKey;
  } catch (error) {
    throw error;
  }
};

// Event tracking
const trackEvent = async (apiKey, eventData) => {
  try {
    // Get site information
    const site = await getSiteByApiKey(apiKey);
    
    // Store event data
    const event = {
      siteId: site.id,
      ...eventData,
      serverTimestamp: serverTimestamp()
    };
    
    await addDoc(collection(db, 'events'), event);
    return true;
  } catch (error) {
    throw error;
  }
};

// Analytics functions
const getAnalytics = async (siteId, timeRange) => {
  try {
    let startDate, endDate;
    
    // Calculate time range
    const now = new Date();
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last-7-days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'last-30-days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'custom':
        if (timeRange.startDate && timeRange.endDate) {
          startDate = new Date(timeRange.startDate);
          endDate = new Date(timeRange.endDate);
        } else {
          startDate = new Date(now.setDate(now.getDate() - 7));
          endDate = new Date();
        }
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
    }
    
    // Query events for this site within time range
    const eventsQuery = query(
      collection(db, 'events'),
      where('siteId', '==', siteId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(eventsQuery);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
      serverTimestamp: doc.data().serverTimestamp?.toDate()
    }));
    
    // Process analytics data
    const pageviews = events.filter(event => event.event === 'pageview');
    const customEvents = events.filter(event => event.event !== 'pageview');
    
    // Visitors data
    const uniqueVisitors = [...new Set(pageviews.map(pv => pv.visitorId))];
    const newVisitors = pageviews.filter(pv => pv.isNewVisitor).length;
    const returningVisitors = uniqueVisitors.length - newVisitors;
    
    // Pageviews data
    const paths = pageviews.reduce((acc, pv) => {
      const path = pv.path;
      if (!acc[path]) {
        acc[path] = {
          path,
          url: pv.url,
          pageviews: 0,
          uniqueVisitors: new Set(),
          totalTimeOnPage: 0
        };
      }
      acc[path].pageviews++;
      acc[path].uniqueVisitors.add(pv.visitorId);
      return acc;
    }, {});
    
    const topPages = Object.values(paths).map(page => ({
      path: page.path,
      url: page.url,
      pageviews: page.pageviews,
      uniqueVisitors: page.uniqueVisitors.size,
      avgTimeOnPage: page.totalTimeOnPage / page.pageviews || 0
    })).sort((a, b) => b.pageviews - a.pageviews);
    
    // Referrers data
    const referrers = pageviews.reduce((acc, pv) => {
      const referrer = pv.referrer;
      if (!acc[referrer]) {
        acc[referrer] = {
          source: referrer,
          count: 0
        };
      }
      acc[referrer].count++;
      return acc;
    }, {});
    
    const topReferrers = Object.values(referrers)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Device data
    const devices = pageviews.reduce((acc, pv) => {
      const deviceType = pv.device?.type || 'unknown';
      if (!acc[deviceType]) {
        acc[deviceType] = 0;
      }
      acc[deviceType]++;
      return acc;
    }, {});
    
    // Geographic data
    const countries = pageviews.reduce((acc, pv) => {
      const country = pv.location?.country || 'unknown';
      if (!acc[country]) {
        acc[country] = 0;
      }
      acc[country]++;
      return acc;
    }, {});
    
    // Process timeline data
    const timeline = processTimelineData(pageviews, startDate, endDate);
    
    return {
      visitors: {
        totalVisitors: uniqueVisitors.length,
        newVisitors,
        returningVisitors,
        timeline
      },
      pageviews: {
        totalPageviews: pageviews.length,
        uniquePageviews: Object.values(paths).reduce((sum, page) => sum + 1, 0),
        avgTimeOnPage: Object.values(paths).reduce((sum, page) => sum + page.avgTimeOnPage, 0) / Object.values(paths).length || 0,
        bounceRate: calculateBounceRate(pageviews, uniqueVisitors),
        timeline
      },
      pages: topPages,
      referrers: topReferrers,
      devices,
      countries: {
        countries
      }
    };
  } catch (error) {
    throw error;
  }
};

// Helper functions
const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = 'xpct_';
  
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return apiKey;
};

const processTimelineData = (pageviews, startDate, endDate) => {
  const timeline = [];
  
  // Determine appropriate timeline granularity
  const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
  let granularity = 'day';
  
  if (diffDays <= 1) {
    granularity = 'hour';
  } else if (diffDays > 90) {
    granularity = 'month';
  } else if (diffDays > 30) {
    granularity = 'week';
  }
  
  // Group pageviews by timeline granularity
  const groupedData = pageviews.reduce((acc, pv) => {
    let timeKey;
    const timestamp = pv.timestamp;
    
    if (granularity === 'hour') {
      timeKey = new Date(timestamp).setMinutes(0, 0, 0);
    } else if (granularity === 'day') {
      timeKey = new Date(timestamp).setHours(0, 0, 0, 0);
    } else if (granularity === 'week') {
      const dayOfWeek = timestamp.getDay();
      const diff = timestamp.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      timeKey = new Date(timestamp.setDate(diff)).setHours(0, 0, 0, 0);
    } else if (granularity === 'month') {
      timeKey = new Date(timestamp.getFullYear(), timestamp.getMonth(), 1).getTime();
    }
    
    if (!acc[timeKey]) {
      acc[timeKey] = {
        date: new Date(timeKey),
        total: 0,
        new: 0,
        returning: 0,
        unique: new Set()
      };
    }
    
    acc[timeKey].total++;
    acc[timeKey].unique.add(pv.visitorId);
    
    if (pv.isNewVisitor) {
      acc[timeKey].new++;
    } else {
      acc[timeKey].returning++;
    }
    
    return acc;
  }, {});
  
  // Fill in missing dates and format timeline
  let current = new Date(startDate);
  
  while (current <= endDate) {
    let timeKey;
    
    if (granularity === 'hour') {
      timeKey = new Date(current).setMinutes(0, 0, 0);
      current = new Date(current.setHours(current.getHours() + 1));
    } else if (granularity === 'day') {
      timeKey = new Date(current).setHours(0, 0, 0, 0);
      current = new Date(current.setDate(current.getDate() + 1));
    } else if (granularity === 'week') {
      const dayOfWeek = current.getDay();
      const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      timeKey = new Date(current.setDate(diff)).setHours(0, 0, 0, 0);
      current = new Date(current.setDate(current.getDate() + 7));
    } else if (granularity === 'month') {
      timeKey = new Date(current.getFullYear(), current.getMonth(), 1).getTime();
      current = new Date(current.setMonth(current.getMonth() + 1));
    }
    
    const data = groupedData[timeKey] || {
      date: new Date(timeKey),
      total: 0,
      new: 0,
      returning: 0,
      unique: new Set()
    };
    
    timeline.push({
      date: formatDate(new Date(timeKey), granularity),
      total: data.total,
      new: data.new,
      returning: data.returning,
      unique: data.unique.size
    });
  }
  
  return timeline;
};

const formatDate = (date, granularity) => {
  if (granularity === 'hour') {
    return `${date.getHours()}:00`;
  } else if (granularity === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (granularity === 'week') {
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (granularity === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  return date.toLocaleDateString();
};

const calculateBounceRate = (pageviews, uniqueVisitors) => {
  const sessionsWithOnePageview = uniqueVisitors.filter(visitorId => {
    return pageviews.filter(pv => pv.visitorId === visitorId).length === 1;
  }).length;
  
  return Math.round((sessionsWithOnePageview / uniqueVisitors.length) * 100) || 0;
};

module.exports = {
  db,
  auth,
  createUser,
  loginUser,
  logoutUser,
  createSite,
  getUserSites,
  getSiteById,
  getSiteByApiKey,
  updateSite,
  deleteSite,
  regenerateSiteApiKey,
  trackEvent,
  getAnalytics
}; 