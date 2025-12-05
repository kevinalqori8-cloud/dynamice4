// src/hooks/useMusicDedication.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  increment,
  updateDoc,
  doc 
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export const useMusicDedication = () => {
  const [dedications, setDedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const firestore = getFirestore();

  // Kirim dedication baru
  const sendDedication = async (dedicationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newDedication = {
        ...dedicationData,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: []
      };

      const docRef = await addDoc(collection(firestore, 'musicDedications'), newDedication);
      
      // Update local state
      setDedications(prev => [{
        id: docRef.id,
        ...dedicationData,
        createdAt: new Date()
      }, ...prev]);
      
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search dedications by receiver name (universal)
  const searchDedicationsByReceiver = async (receiverName, limitCount = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(firestore, 'musicDedications'),
        where('receiverName', '>=', receiverName),
        where('receiverName', '<=', receiverName + '\uf8ff'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });
      
      setDedications(results);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get all dedications (for explore page)
  const getAllDedications = async (limitCount = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(firestore, 'musicDedications'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });
      
      setDedications(results);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Like dedication
  const likeDedication = async (dedicationId, userId) => {
    try {
      const dedicationRef = doc(firestore, 'musicDedications', dedicationId);
      
      await updateDoc(dedicationRef, {
        likes: increment(1),
        likedBy: [...(dedications.find(d => d.id === dedicationId)?.likedBy || []), userId]
      });
      
      // Update local state
      setDedications(prev => prev.map(d => 
        d.id === dedicationId 
          ? { ...d, likes: d.likes + 1, likedBy: [...(d.likedBy || []), userId] }
          : d
      ));
    } catch (err) {
      console.error('Error liking dedication:', err);
      throw err;
    }
  };

  return {
    dedications,
    loading,
    error,
    sendDedication,
    searchDedicationsByReceiver,
    getAllDedications,
    likeDedication
  };
};

