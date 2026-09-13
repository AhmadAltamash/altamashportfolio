import { useEffect, useState } from "react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";
import FolioOrbit, { DEFAULT_IMAGES } from "./folio/FolioOrbit";

// Feeds the 3D card component from the same "profileCards" Firestore
// collection + admin panel (Admin > Homepage Cards) already built for the
// previous version of this carousel — nothing about that admin page needed
// to change, only what renders the images on the public site.
const ProfileCardScene = () => {
  const [images, setImages] = useState(null); // null = still loading

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "profileCards"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const orderA = a.Order ?? Infinity;
          const orderB = b.Order ?? Infinity;
          return orderA - orderB;
        });
        const urls = data.map((d) => d.Img).filter(Boolean);
        if (!cancelled) setImages(urls);
      } catch (err) {
        console.error("Failed to load profile cards:", err);
        if (!cancelled) setImages([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (images === null) return null;

  // Falls back to the component's own placeholder photos if nothing's
  // been uploaded via the admin panel yet, so the section never renders
  // empty/broken before you've added your first photo.
  const finalImages = images.length > 0 ? images : DEFAULT_IMAGES;

  return (
    <div className="w-full h-full">
      <FolioOrbit images={finalImages} />
    </div>
  );
};

export default ProfileCardScene;
