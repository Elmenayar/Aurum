import { useEffect } from 'react';
import { configService } from '@/src/services/configService';

export const AdTracking = () => {
  useEffect(() => {
    const initPixels = async () => {
      const config = await configService.getConfig();
      
      // Meta Pixel
      if (config.metaPixelId) {
        const metaScript = document.createElement('script');
        metaScript.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${config.metaPixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(metaScript);
        
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${config.metaPixelId}&ev=PageView&noscript=1" />`;
        document.body.appendChild(noscript);
      }

      // TikTok Pixel
      if (config.tiktokPixelId) {
        const ttScript = document.createElement('script');
        ttScript.innerHTML = `
          (function (w, d, s, l, i) {
              w[l] = w[l] || [];
              w[l].push({
                  'gtm.start': new Date().getTime(),
                  event: 'gtm.js'
              });
              var f = d.getElementsByTagName(s)[0],
                  j = d.createElement(s),
                  dl = l != 'dataLayer' ? '&l=' + l : '';
              j.async = true;
              j.src = 'https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=' + i;
              f.parentNode.insertBefore(j, f);
          })(window, document, 'script', 'ttq', '${config.tiktokPixelId}');
          ttq.load('${config.tiktokPixelId}');
          ttq.page();
        `;
        document.head.appendChild(ttScript);
      }
    };

    initPixels();
  }, []);

  return null;
};
