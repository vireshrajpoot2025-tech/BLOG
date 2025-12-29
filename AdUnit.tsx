
import React, { useEffect } from 'react';

interface AdUnitProps {
  type: 'leaderboard' | 'rectangle' | 'sidebar';
  adSlot?: string;
  publisherId?: string;
  visible?: boolean;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, adSlot, publisherId, visible = true }) => {
  useEffect(() => {
    if (visible && publisherId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [visible, publisherId]);

  if (!visible) return null;

  const styles = {
    leaderboard: "w-full min-h-[90px] bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center relative my-4",
    rectangle: "w-full min-h-[250px] bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center relative my-4",
    sidebar: "hidden lg:flex w-[160px] min-h-[600px] bg-gray-100 border border-dashed border-gray-400 items-center justify-center relative sticky top-24"
  };

  return (
    <div className={styles[type]}>
      <span className="absolute top-0 left-0 bg-gray-200 text-[10px] text-gray-500 px-1 font-bold">ADVERTISEMENT</span>
      {publisherId ? (
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client={publisherId}
             data-ad-slot={adSlot || 'default'}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      ) : (
        <div className="text-gray-400 text-sm italic">
          Google AdSense Placeholder<br/>
          ({type.toUpperCase()})
        </div>
      )}
    </div>
  );
};

export default AdUnit;
