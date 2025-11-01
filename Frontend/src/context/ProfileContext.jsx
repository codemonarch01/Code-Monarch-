import React, { createContext, useContext, useEffect, useState } from 'react';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    education: '',
    skills: []
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('profileData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setProfileData({
          name: parsed.name || '',
          education: parsed.education || '',
          skills: Array.isArray(parsed.skills) ? parsed.skills : []
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('profileData', JSON.stringify(profileData));
    } catch {}
  }, [profileData]);

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);


