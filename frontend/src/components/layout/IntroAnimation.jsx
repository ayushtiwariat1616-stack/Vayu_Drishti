import { useEffect, useState } from 'react';

export default function IntroAnimation() {
  const [visible, setVisible] = useState(() => sessionStorage.getItem('vayu-intro-seen') !== 'true');

  useEffect(() => {
    if (!visible) return undefined;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem('vayu-intro-seen', 'true');
      setVisible(false);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  const finish = () => {
    sessionStorage.setItem('vayu-intro-seen', 'true');
    setVisible(false);
  };

  return (
    <div className="intro-screen" role="dialog" aria-label="Opening Vayu Drishti">
      <div className="intro-orbit" aria-hidden="true">
        <span className="intro-stream intro-stream-saffron" />
        <span className="intro-stream intro-stream-white" />
        <span className="intro-stream intro-stream-green" />
      </div>
      <div className="intro-logo" aria-hidden="true"><span>VD</span></div>
      <div className="intro-title">VAYU DRISHTI</div>
      <div className="intro-subtitle">Intelligent Weather Monitoring</div>
      <button className="intro-skip" onClick={finish}>Skip</button>
    </div>
  );
}
