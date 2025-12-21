import { useState } from 'react';
import './ChatBubble.css';

const WECHAT_QR_URL = 'https://cdn.jsdelivr.net/gh/JSREI/.github/profile/README.assets/image-20231030132026541-7614065.png';

export function ChatBubble() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="chat-bubble-container">
      <div 
        className="chat-bubble"
        onMouseEnter={() => setShowQR(true)}
        onMouseLeave={() => setShowQR(false)}
      >
        <span className="bubble-icon">💬</span>
        <span className="bubble-text">交流群</span>
      </div>

      {showQR && (
        <div className="qr-popup">
          <div className="qr-content">
            <img 
              src={WECHAT_QR_URL} 
              alt="微信二维码" 
              className="qr-image"
            />
            <p className="qr-hint">
              微信扫码发送 <strong>"leetcode"</strong><br />
              加入算法交流群
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
