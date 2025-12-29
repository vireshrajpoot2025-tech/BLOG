
# Sarkari Portal AI - Netlify Deployment Guide

चूंकि आपका Netlify अकाउंट तैयार है, बस ये 4 स्टेप्स फॉलो करें:

### स्टेप 1: GitHub पर 'Commit' करें
1. GitHub के उस पेज पर जाएँ जहाँ आपने फाइलें अपलोड की हैं।
2. नीचे जाकर हरे रंग का बटन **"Commit changes"** दबाएँ। अब आपकी कोडिंग का काम खत्म!

### स्टेप 2: Netlify में प्रोजेक्ट जोड़ें
1. अपने [Netlify Dashboard](https://app.netlify.com/) में जाएँ।
2. **"Add new site"** बटन पर क्लिक करें।
3. **"Import from an existing project"** चुनें।
4. **GitHub** बटन पर क्लिक करके लॉगिन करें और अपने **`BLOG`** फोल्डर (Repository) को चुनें।
5. **"Deploy site"** पर क्लिक करें।

### स्टेप 3: AI को चालू करें (सबसे ज़रूरी)
1. Netlify में अपनी साइट की **Site Settings** में जाएँ।
2. बायीं तरफ **"Environment variables"** पर क्लिक करें।
3. **"Add a variable"** चुनें:
   - Key: `API_KEY`
   - Value: अपनी **Gemini API Key** यहाँ डालें।
4. **Deploys** टैब में जाकर **"Trigger deploy"** कर दें।

### स्टेप 4: जॉब्स कैसे जोड़ें (बिना कोडिंग के)
1. आपकी साइट का लिंक (जैसे: `mysite.netlify.app`) अब लाइव है।
2. अब अपनी साइट के आगे `/admin` लगायें। (उदा: `mysite.netlify.app/admin`)
3. पासवर्ड `admin123` से लॉगिन करें।
4. वहां **"AI Link Sync"** का इस्तेमाल करें। आप वहां जो भी टाइप करेंगे या लिंक डालेंगे, वो अपने आप आपकी साइट पर अपडेट होता रहेगा। आपको दोबारा कभी फाइल अपलोड नहीं करनी पड़ेगी!
